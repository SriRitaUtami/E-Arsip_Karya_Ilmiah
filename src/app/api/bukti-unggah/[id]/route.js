// src/app/api/bukti-unggah/[id]/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import puppeteer from 'puppeteer';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const [rows] = await db.query(
      `SELECT k.id, k.judul, k.tahun_ajaran, k.tanggal_upload,
              k.created_at, k.nama_peneliti AS nama_siswa, k.nis
       FROM karya_ilmiah k
       WHERE k.id = ?`,
      [id]
    );

    if (!rows.length) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    const data = rows[0];

    const tgl = new Date(data.tanggal_upload);
    const waktuDate = new Date(data.created_at);
    const pad = (n) => String(n).padStart(2, '0');
    const tanggal = `${pad(tgl.getDate())}-${pad(tgl.getMonth() + 1)}-${tgl.getFullYear()}`;
    const waktu = `${pad(waktuDate.getHours())}:${pad(waktuDate.getMinutes())}:${pad(waktuDate.getSeconds())}`;

    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', Times, serif;
      background: #fff;
      color: #111;
      width: 794px;
      padding: 40px 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .wrapper {
      width: 700px;
      padding: 48px 56px;
      border: 2px solid #111;
      position: relative;
    }
    .inner-border {
      position: absolute;
      top: 8px; left: 8px; right: 8px; bottom: 8px;
      border: 1px solid #555;
      pointer-events: none;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #111;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header h1 {
      font-size: 18px;
      font-weight: bold;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .header p {
      font-size: 12px;
      color: #444;
      letter-spacing: 0.5px;
    }
    .badge {
      text-align: center;
      margin-bottom: 20px;
    }
    .badge span {
      display: inline-block;
      border: 1px solid #111;
      padding: 4px 20px;
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .body-text {
      text-align: center;
      font-size: 13px;
      margin-bottom: 20px;
      line-height: 1.7;
      color: #222;
    }
    table.info {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
      font-size: 13px;
    }
    table.info tr td {
      padding: 7px 10px;
    }
    table.info tr td:first-child {
      width: 140px;
      font-weight: bold;
      color: #222;
    }
    table.info tr td:nth-child(2) {
      width: 12px;
      color: #555;
    }
    table.info tr:nth-child(odd) {
      background: #f5f5f5;
    }
    .statement {
      text-align: center;
      font-size: 13px;
      line-height: 2;
      color: #111;
      border-top: 1px solid #bbb;
      padding-top: 18px;
      margin-bottom: 16px;
    }
    .statement em {
      font-style: italic;
      color: #333;
    }
    .footer {
      text-align: right;
      font-size: 12px;
      color: #444;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="inner-border"></div>

    <div class="header">
      <h1>Bukti Unggah Karya Ilmiah</h1>
      <p>Sistem E-Arsip Karya Ilmiah — Ruhul Islam Anak Bangsa</p>
    </div>

    <div class="badge">
      <span>Dokumen Resmi Sistem</span>
    </div>

    <div class="body-text">
      Dokumen ini menyatakan bahwa siswa berikut:
    </div>

    <table class="info">
      <tr>
        <td>Nama Siswa</td>
        <td>:</td>
        <td>${data.nama_siswa}</td>
      </tr>
      <tr>
        <td>NIS</td>
        <td>:</td>
        <td>${data.nis}</td>
      </tr>
      <tr>
        <td>Judul Karya</td>
        <td>:</td>
        <td>${data.judul}</td>
      </tr>
      <tr>
        <td>Tahun Ajaran</td>
        <td>:</td>
        <td>${data.tahun_ajaran}</td>
      </tr>
      <tr>
        <td>Tanggal Unggah</td>
        <td>:</td>
        <td>${tanggal}</td>
      </tr>
      <tr>
        <td>Waktu Unggah</td>
        <td>:</td>
        <td>${waktu} WIB</td>
      </tr>
    </table>

    <div class="statement">
      <em>
        telah berhasil mengunggah karya ilmiah ke dalam Sistem E-Arsip Karya Ilmiah
      </em>
    </div>

    <div class="footer">
      Disahkan secara elektronik oleh sistem pada &bull; ${tanggal}
    </div>
  </div>
</body>
</html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 800 });
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Ukur tinggi konten secara dinamis agar tidak terpotong
    const contentHeight = await page.evaluate(() => document.body.scrollHeight);

    const pdfBuffer = await page.pdf({
      width: '794px',
      height: `${contentHeight + 80}px`,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="bukti-unggah-${data.nis}.pdf"`,
      },
    });
  } catch (err) {
    console.error('Bukti unggah error:', err);
    return NextResponse.json({ error: 'Gagal generate bukti unggah' }, { status: 500 });
  }
}