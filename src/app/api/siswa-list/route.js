//src/app/api/siswa-list/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const [rows] = await db.query("SELECT id, nama, nis FROM siswa ORDER BY nama ASC");
  return NextResponse.json(rows);
}