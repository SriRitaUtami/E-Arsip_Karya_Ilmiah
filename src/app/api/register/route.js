// app/api/register/route.js
import db from '../../../lib/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { role, nama, identifier, password } = await req.json();

    if (!role ||!nama ||!identifier ||!password) {
      return NextResponse.json({ message: 'Semua field harus diisi' }, { status: 400 });
    }

    const namaRegex = /^[a-zA-Z\s]+$/;
    if (!namaRegex.test(nama)) {
      return NextResponse.json({ message: 'Nama hanya boleh berisi huruf dan spasi' }, { status: 400 });
    }

    const roleLower = role.toLowerCase();
    if (roleLower!== 'admin' && roleLower!== 'siswa') {
      return NextResponse.json({ message: 'Role tidak valid' }, { status: 400 });
    }

    if (!/^\d+$/.test(identifier)) {
      return NextResponse.json({ message: 'NIS/NIP hanya boleh berisi angka' }, { status: 400 });
    }

    const passwordRegex = /^[a-z0-9]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ message: 'Password harus minimal 8 karakter, hanya huruf kecil dan angka' }, { status: 400 });
    }

    let table = '';
    let idField = '';

    if (roleLower === 'siswa') {
      table = 'siswa';
      idField = 'nis';
    } else {
      table = 'admin';
      idField = 'nip';
    }

    // Cek nama sudah terdaftar, kecuali kalo nama dummy 'Belum Daftar'
    const [existingNama] = await db.query(`SELECT id FROM ${table} WHERE nama =? AND nama!= 'Belum Daftar'`, [nama]);
    if (existingNama.length > 0) {
      return NextResponse.json({ message: 'Nama sudah terdaftar' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (roleLower === 'siswa') {
      // CEK APAKAH NIS UDAH ADA KARENA DIBOOKING ADMIN
      const [existingSiswa] = await db.query(`SELECT id, nama FROM ${table} WHERE ${idField} =?`, [identifier]);

      if (existingSiswa.length > 0) {
        // KASUS 1: NIS UDAH ADA
        if (existingSiswa[0].nama === 'Belum Daftar') {
          // Ini akun dummy yg dibikin admin. Update aja jadi akun asli
          await db.query(
            `UPDATE ${table} SET nama =?, password =? WHERE ${idField} =?`,
            [nama, hashedPassword, identifier]
          );
          return NextResponse.json({ message: 'Akun berhasil diaktifkan! Karya lama sudah masuk profil kamu' }, { status: 200 });
        } else {
          // NIS udah dipake siswa asli
          return NextResponse.json({ message: 'NIS sudah terdaftar' }, { status: 400 });
        }
      } else {
        // KASUS 2: NIS BENAR-BENAR BARU
        await db.query(
          `INSERT INTO ${table} (nama, ${idField}, password, role) VALUES (?,?,?,?)`,
          [nama, identifier, hashedPassword, roleLower]
        );
        return NextResponse.json({ message: 'Registrasi berhasil' }, { status: 201 });
      }
    } else {
      // REGISTER ADMIN - LOGIC LAMA TETEP
      const [existingId] = await db.query(`SELECT id FROM ${table} WHERE ${idField} =?`, [identifier]);
      if (existingId.length > 0) {
        return NextResponse.json({ message: `${idField.toUpperCase()} sudah terdaftar` }, { status: 400 });
      }

      await db.query(
        `INSERT INTO ${table} (nama, ${idField}, password, role) VALUES (?,?,?,?)`,
        [nama, identifier, hashedPassword, roleLower]
      );
      return NextResponse.json({ message: 'Registrasi berhasil' }, { status: 201 });
    }

  } catch (error) {
    console.error('Error register:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'NIS/NIP atau Nama sudah terdaftar' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}