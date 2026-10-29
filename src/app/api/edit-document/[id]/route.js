//src/app/api/edit-document/[id]/route.js
import { google } from 'googleapis';
import { Readable } from 'stream';
import db from '@/lib/db';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
const drive = google.drive({ version: 'v3', auth: oauth2Client });

const getUserFromToken = (request) => {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

export async function PUT(request, { params }) {
  const {id} = await params;

  try {
    const user = getUserFromToken(request);
    if (!user || user.role!== 'admin') {
      return NextResponse.json({ message: 'Unauthorized: Admin only' }, { status: 403 });
    }

    const formData = await request.formData();
    const [rows] = await db.execute('SELECT * FROM karya_ilmiah WHERE id =?', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ message: 'Dokumen tidak ditemukan' }, { status: 404 });
    }

    const oldData = rows[0];
    let oldFileUrl = oldData.file_url;

    // Kalau field nggak dikirim atau kosong, pake data lama
    const nis = formData.get('nis') || oldData.nis;
    const nama_peneliti = formData.get('nama_peneliti') || oldData.nama_peneliti;
    const judul = formData.get('judul') || oldData.judul;
    const tahun_ajaran = formData.get('tahun_ajaran') || oldData.tahun_ajaran;
    const tanggal_upload = formData.get('tanggal_upload') || oldData.tanggal_upload;
    const file = formData.get('file');

    let newFileUrl = oldFileUrl;

    if (file && file.size > 0) {
      if (file.type!== 'application/pdf') {
        return NextResponse.json({ message: 'File harus PDF' }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const readableStream = Readable.from(buffer);

      if (!oldFileUrl) {
        const driveRes = await drive.files.create({
          requestBody: {
            name: `${judul}_${nis}.pdf`,
            mimeType: 'application/pdf',
          },
          media: {
            mimeType: 'application/pdf',
            body: readableStream,
          },
          fields: 'id',
        });
        newFileUrl = `https://drive.google.com/file/d/${driveRes.data.id}/view`;
      } else {
        const fileId = oldFileUrl.split('/d/')[1].split('/')[0];
        await drive.files.update({
          fileId: fileId,
          media: {
            mimeType: file.type,
            body: readableStream,
          },
        });
        newFileUrl = `https://drive.google.com/file/d/${fileId}/view`;
      }
    }

    await db.execute(
      'UPDATE karya_ilmiah SET nis=?, nama_peneliti=?, judul=?, tahun_ajaran=?, tanggal_upload=?, file_url=? WHERE id=?',
      [nis, nama_peneliti, judul, tahun_ajaran, tanggal_upload, newFileUrl, id]
    );

    return NextResponse.json({ success: true, message: 'Dokumen berhasil diupdate' });
  } catch (error) {
    console.error('Error update dokumen:', error);
    return NextResponse.json({ message: 'Gagal update dokumen' }, { status: 500 });
  }
}