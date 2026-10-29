// src/app/api/settings/route.js
import db from '@/lib/db';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET() {
  const [rows] = await db.query('SELECT * FROM settings WHERE id = 1');

  const data = rows[0] ?? {
    allow_upload: 0,
    allow_download: 0,
    allow_print: 0,
    nama_kepsek: '',
    nip_kepsek: '',
    nomor_urut_sertifikat: 0,
    format_nomor_sertifikat: '{nomor}/SKT/RIAB/{bulan}/{tahun}',
    logo_sekolah_url: null,
    warna_header: '#8b6914',
  };

  return NextResponse.json(data);
}

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer '))
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin')
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const fields = [];
    const values = [];

    if (body.allow_upload           !== undefined) { fields.push('allow_upload=?');           values.push(body.allow_upload); }
    if (body.allow_download         !== undefined) { fields.push('allow_download=?');          values.push(body.allow_download); }
    if (body.allow_print            !== undefined) { fields.push('allow_print=?');             values.push(body.allow_print); }
    if (body.nama_kepsek            !== undefined) { fields.push('nama_kepsek=?');             values.push(body.nama_kepsek); }
    if (body.nip_kepsek             !== undefined) { fields.push('nip_kepsek=?');              values.push(body.nip_kepsek); }
    if (body.nomor_urut_sertifikat  !== undefined) { fields.push('nomor_urut_sertifikat=?');   values.push(body.nomor_urut_sertifikat); }
    if (body.format_nomor_sertifikat !== undefined) { fields.push('format_nomor_sertifikat=?'); values.push(body.format_nomor_sertifikat); }
    if (body.warna_header            !== undefined) { fields.push('warna_header=?');            values.push(body.warna_header); }

    if (fields.length === 0)
      return NextResponse.json({ message: 'Tidak ada yang diupdate' }, { status: 400 });

    values.push(1);
    await db.query(`UPDATE settings SET ${fields.join(', ')} WHERE id=?`, values);
    return NextResponse.json({ message: 'Pengaturan berhasil diperbarui' });

  } catch (error) {
    console.error('POST settings error:', error);
    return NextResponse.json({ message: 'Gagal memperbarui pengaturan' }, { status: 500 });
  }
}