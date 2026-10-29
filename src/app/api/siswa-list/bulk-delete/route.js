//src/app/api/siswa-list/bulk-delete/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(req) {
  const { ids } = await req.json();
  if (!ids || ids.length === 0) return NextResponse.json({ message: 'Tidak ada data' }, { status: 400 });

  const placeholders = ids.map(() => '?').join(',');
  await db.query(`DELETE FROM siswa WHERE id IN (${placeholders})`, ids);

  return NextResponse.json({ message: 'Berhasil dihapus' });
}