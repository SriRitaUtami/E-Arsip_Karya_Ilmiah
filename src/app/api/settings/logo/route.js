// src/app/api/settings/logo/route.js
import db from '@/lib/db';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { uploadDocument } from '@/lib/uploadDocument';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer '))
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin')
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get('logo');

    if (!file) {
      return NextResponse.json({ message: 'File logo tidak ditemukan' }, { status: 400 });
    }

    // validasi tipe file (hanya gambar)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'File harus berupa gambar' }, { status: 400 });
    }

    // validasi ukuran (maks 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ message: 'Ukuran file maksimal 2MB' }, { status: 400 });
    }

    const fileId = await uploadDocument(file);

    // URL ini bisa dipakai langsung sebagai <img src="...">
    const logoUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w500`;

    await db.query('UPDATE settings SET logo_sekolah_url = ? WHERE id = 1', [logoUrl]);

    return NextResponse.json({ message: 'Logo berhasil diunggah', logo_sekolah_url: logoUrl });

  } catch (error) {
    console.error('POST settings/logo error:', error);
    return NextResponse.json({ message: 'Gagal mengunggah logo' }, { status: 500 });
  }
}