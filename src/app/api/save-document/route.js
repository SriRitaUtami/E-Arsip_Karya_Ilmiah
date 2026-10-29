// src/app/api/save-document/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';
import { google } from 'googleapis';

function getUserFromToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function POST(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Cek allow_upload untuk siswa
if (user.role === 'siswa') {
  const [settings] = await db.execute('SELECT allow_upload FROM settings WHERE id = 1');
  if (!settings[0]?.allow_upload) {
    return NextResponse.json({ message: 'Upload tidak diizinkan oleh admin' }, { status: 403 });
  }
}

    const body = await request.json();
    const { nis, namaPeneliti, judulKaryaIlmiah, tahunAjaran, tanggalUpload, fileUrl } = body;

    if (!nis || !namaPeneliti || !judulKaryaIlmiah || !tahunAjaran || !tanggalUpload) {
      return NextResponse.json({ message: 'Data tidak lengkap!' }, { status: 400 });
    }

    const [siswaCheck] = await db.execute('SELECT nis FROM siswa WHERE nis = ?', [nis]);

    if (siswaCheck.length === 0) {
      if (user.role === 'admin') {
        await db.execute(
          `INSERT INTO siswa (nis, nama, password, role) VALUES (?, 'Belum Daftar', 'x', 'siswa')`,
          [nis]
        );
      } else {
        return NextResponse.json({ message: 'NIS tidak terdaftar di sistem!' }, { status: 404 });
      }
    }

    await db.execute(
      `INSERT INTO karya_ilmiah
       (nis, nama_peneliti, judul, tahun_ajaran, tanggal_upload, file_url,
        diupload_oleh_id, uploaded_by_role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nis, namaPeneliti, judulKaryaIlmiah, tahunAjaran, tanggalUpload, fileUrl || null,
       user.id, user.role]
    );

    return NextResponse.json({ message: 'Dokumen berhasil disimpan!' }, { status: 201 });

  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ message: 'Gagal menyimpan dokumen!' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope');

    let query = `
      SELECT
        k.*,
        s.nama as nama_siswa,
        CASE
          WHEN k.uploaded_by_role = 'admin' THEN a.nama
          WHEN k.uploaded_by_role = 'siswa' THEN u.nama
          ELSE NULL
        END as nama_uploader
      FROM karya_ilmiah k
      JOIN siswa s ON k.nis = s.nis
      LEFT JOIN admin a ON k.diupload_oleh_id = a.id AND k.uploaded_by_role = 'admin'
      LEFT JOIN siswa u ON k.diupload_oleh_id = u.id AND k.uploaded_by_role = 'siswa'
    `;
    let params = [];

    if (scope === 'profile' && user.role === 'siswa') {
      query += ' WHERE k.nis = ?';
      params.push(user.nis);
    } else if (scope === 'uploaded' && user.role === 'admin') {
      query += ' WHERE k.diupload_oleh_id = ? AND k.uploaded_by_role = "admin"';
      params.push(user.id);
    }

    query += ' ORDER BY k.id DESC';

    const [rows] = await db.execute(query, params);
    return NextResponse.json({ data: rows });

  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ message: 'Gagal mengambil data!' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ message: 'ID tidak ditemukan' }, { status: 400 });

    // Ambil file_url sebelum dihapus
    const [rows] = await db.execute('SELECT file_url FROM karya_ilmiah WHERE id = ?', [id]);
    if (rows.length === 0) return NextResponse.json({ message: 'Data tidak ditemukan' }, { status: 404 });

    const fileUrl = rows[0].file_url;

    // Ekstrak Drive file ID dari URL, lalu hapus dari Google Drive
    if (fileUrl) {
      const match = fileUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      const fileId = match ? match[1] : null;

      if (fileId) {
        try {
          const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
          );
          auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
          const drive = google.drive({ version: 'v3', auth });
          await drive.files.delete({ fileId });
        } catch (driveErr) {
          console.warn('Gagal hapus dari Drive (file mungkin sudah tidak ada):', driveErr.message);
          // Tetap lanjut hapus dari DB
        }
      }
    }

    // Hapus dari DB
    await db.execute('DELETE FROM karya_ilmiah WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Dokumen berhasil dihapus' });

  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ message: 'Gagal menghapus dokumen' }, { status: 500 });
  }
}