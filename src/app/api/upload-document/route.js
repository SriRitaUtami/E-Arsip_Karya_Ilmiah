//src/app/api/upload-document/route.js
import { uploadDocument } from '@/lib/uploadDocument';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const getUserFromToken = (request) => {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return null;

    const token = authHeader.split(' ')[1];
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
};

export async function POST(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cek kalau siswa, pastikan allowUpload = true
    if (user.role === 'siswa') {
      // allowUpload disimpen di localStorage, tapi nggak bisa dicek dari server
      // Jadi validasi utama tetep di /api/save-document
      // Di sini cukup pastiin user udah login
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    // Validasi tipe file
    if (file.type!== 'application/pdf') {
      return NextResponse.json({ error: 'File harus PDF' }, { status: 400 });
    }

    const fileId = await uploadDocument(file);
    const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;

    return NextResponse.json({ fileId, fileUrl }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal mengupload dokumen' }, { status: 500 });
  }
}