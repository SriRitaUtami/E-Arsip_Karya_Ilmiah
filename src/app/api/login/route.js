// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../../lib/db';

export async function POST(request) {
  try {
    const { role, nama, identifier, password } = await request.json();

    // Validasi kelengkapan input
    if (!role || !nama || !identifier || !password) {
      return NextResponse.json({ message: 'Semua field harus diisi' }, { status: 400 });
    }

    // Validasi role pengguna
    const roleLower = role.toLowerCase();
    const validRoles = ['admin', 'siswa'];
    if (!validRoles.includes(roleLower)) {
      return NextResponse.json({ message: 'Role tidak valid' }, { status: 400 });
    }

    // Menentukan tabel dan field berdasarkan role
    const table   = roleLower === 'siswa' ? 'siswa' : 'admin';
    const idField = roleLower === 'siswa' ? 'nis'   : 'nip';

    // Query database berdasarkan role pengguna
    const [rows] = await db.query(
      `SELECT * FROM ${table} WHERE ${idField} = ? AND nama = ?`,
      [identifier, nama]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Nama, NIS/NIP, atau password salah' }, { status: 401 });
    }

    const user = rows[0];

    // Verifikasi password menggunakan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Nama, NIS/NIP, atau password salah' }, { status: 401 });
    }

    // Membuat token JWT untuk sesi pengguna
    const token = jwt.sign(
      {
        id: user.id,
        nama: user.nama,
        role: user.role,
        nis: roleLower === 'siswa' ? user.nis : null,
        nip: roleLower === 'admin' ? user.nip : null,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        nama: user.nama,
        role: user.role,
        identifier: user[idField]
      }
    });

  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}