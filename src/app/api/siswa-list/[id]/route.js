//src/app/api/siswa-list/[id]/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(req, { params }) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { nama, nis } = await req.json();

  if (!nama || !nis) return NextResponse.json({ message: 'Nama dan NIS wajib diisi' }, { status: 400 });

  await db.query("UPDATE siswa SET nama = ?, nis = ? WHERE id = ?", [nama, nis, id]);
  return NextResponse.json({ message: 'Berhasil diperbarui' });
}

export async function DELETE(req, { params }) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await db.query("DELETE FROM siswa WHERE id = ?", [id]);
  return NextResponse.json({ message: 'Berhasil dihapus' });
}