// src/app/api/sertifikat/[id]/route.js
import db from '@/lib/db';
import jwt from 'jsonwebtoken';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

function getUserFromToken(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch { return null; }
}

const BULAN_ROMAWI = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

function getLogoDefaultBase64() {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const buffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  } catch (err) {
    console.warn('Logo default tidak ditemukan di public/logo.png:', err.message);
    return null;
  }
}

export async function GET(request, context) {
  const user = getUserFromToken(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  const { id } = await context.params;

  const [settingsRows] = await db.query(
    'SELECT allow_print, nama_kepsek, nip_kepsek, nomor_urut_sertifikat, format_nomor_sertifikat, logo_sekolah_url, warna_header FROM settings WHERE id = 1'
  );
  const settings = settingsRows[0];

  if (!settings?.allow_print && user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Cetak sertifikat dinonaktifkan' }), {
      status: 403, headers: { 'Content-Type': 'application/json' }
    });
  }

  const [rows] = await db.query(
    `SELECT judul, tahun_ajaran, nama_peneliti, nis, nomor_sertifikat FROM karya_ilmiah WHERE id = ?`,
    [id]
  );
  if (!rows.length) {
    return new Response(JSON.stringify({ error: 'Dokumen tidak ditemukan' }), {
      status: 404, headers: { 'Content-Type': 'application/json' }
    });
  }

  let { judul, tahun_ajaran, nama_peneliti, nis, nomor_sertifikat } = rows[0];

  // Generate nomor sertifikat sekali saja, lalu kunci permanen di karya_ilmiah
  if (!nomor_sertifikat) {
    const nomorBaru = (settings.nomor_urut_sertifikat || 0) + 1;
    const romawi = BULAN_ROMAWI[new Date().getMonth()];
    const tahun = new Date().getFullYear();
    const format = settings.format_nomor_sertifikat || '{nomor}/SKT/RIAB/{bulan}/{tahun}';

    nomor_sertifikat = format
      .replace('{nomor}', String(nomorBaru).padStart(3, '0'))
      .replace('{bulan}', romawi)
      .replace('{tahun}', tahun);

    await db.query(
      'UPDATE karya_ilmiah SET nomor_sertifikat = ? WHERE id = ?',
      [nomor_sertifikat, id]
    );
    await db.query(
      'UPDATE settings SET nomor_urut_sertifikat = ? WHERE id = 1',
      [nomorBaru]
    );
  }

  const tanggal = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const html = generateHTML({
    nama: nama_peneliti,
    nis,
    judul,
    tahun_ajaran,
    tanggal,
    nomor: nomor_sertifikat,
    namaKepsek: settings.nama_kepsek || '-',
    nipKepsek: settings.nip_kepsek || '-',
    logoUrl: typeof settings.logo_sekolah_url === 'string' ? settings.logo_sekolah_url : getLogoDefaultBase64(),
    warnaHeader: typeof settings.warna_header === 'string' ? settings.warna_header : '#8b6914',
  });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--font-render-hinting=none',
    ],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 500));

  const pdfBuffer = await page.pdf({
    width: '297mm',
    height: '210mm',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="sertifikat-${nis}.pdf"`,
      'Content-Length': pdfBuffer.length.toString(),
    },
  });
}

function generateHTML({ nama, nis, judul, tahun_ajaran, tanggal, nomor, namaKepsek, nipKepsek, logoUrl, warnaHeader }) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }

  body {
    width:297mm; height:210mm; overflow:hidden; background:#f2f7f1;
    font-family:'Times New Roman', Times, serif;
  }

  .wrap {
    width:100%; height:210mm; position:relative;
    display:flex; flex-direction:column; align-items:center; justify-content:space-between;
  }

  .border-outer { position:absolute; inset:10px; border:3px solid #e3e9e5; border-radius:3px; }
  .border-inner  { position:absolute; inset:16px; border:1px solid #e3e9e5; border-radius:2px; }

  .header {
    width:100%; background:${warnaHeader}; padding:12px 0 10px;
    display:flex; align-items:center; justify-content:center;
    flex-direction:column; gap:2px; position:relative; z-index:2;
    flex-shrink:0;
  }
  .header-logo {
    position:absolute; left:24px; top:50%; transform:translateY(-50%);
    width:48px; height:48px; object-fit:contain;
  }
  .header-school  { font-size:20px; letter-spacing:2px; color:#fff; font-weight:bold; font-family:'Times New Roman', Times, serif; }
  .header-address { font-size:11px; color:rgba(255,255,255,0.90); font-family:'Times New Roman', Times, serif; }
  .header-accred  { font-size:10px; color:rgba(255,255,255,0.75); font-family:'Times New Roman', Times, serif; }

  .header-line1 { width:100%; height:3px; background:linear-gradient(to right,#7a5c00,#c9a84c,#7a5c00); flex-shrink:0; }
  .header-line2 { width:100%; height:1px; background:#c9a84c; opacity:0.4; flex-shrink:0; }

  .content {
    flex:1; display:flex; flex-direction:column; align-items:center;
    justify-content:space-between;
    padding:14px 44px 52px;
    position:relative; z-index:2; width:100%;
  }

  .content-top {
    display:flex; flex-direction:column; align-items:center; width:100%;
  }

  .title {
    font-size:58px; letter-spacing:2px; font-weight:bold;
    color:#2e7d32; margin-bottom:6px;
    font-family:'Times New Roman', Times, serif;
  }

  .nomor {
    font-size:13px; color:#8b6914; margin-bottom:10px;
    font-family:'Times New Roman', Times, serif;
  }

  .divider {
    width:240px; height:1px;
    background:linear-gradient(to right,transparent,#c9a84c,transparent);
    margin-bottom:14px;
  }

  .opening {
    font-size:15px; color:#333; margin-bottom:14px;
    font-family:'Times New Roman', Times, serif;
  }

  .info-table { width:100%; border-collapse:collapse; }
  .info-table td {
    font-size:15px; color:#222;
    padding:7px 0;
    vertical-align:top;
    font-family:'Times New Roman', Times, serif;
    line-height:1.4;
  }
  .info-table .key      { width:170px; color:#444; white-space:nowrap; }
  .info-table .sep      { width:18px; }
  .info-table .val-bold { font-weight:bold; }

  .ket {
    font-size:13px; color:#333; text-align:center;
    line-height:2; width:100%;
    font-family:'Times New Roman', Times, serif;
  }

  .ttd-wrap { width:100%; display:flex; justify-content:flex-end; padding:0 30px; }
  .ttd-item { display:flex; flex-direction:column; align-items:center; }
  .ttd-item .ttd-place {
    font-size:13px; color:#444; margin-bottom:2px;
    text-align:center; font-family:'Times New Roman', Times, serif;
  }
  .ttd-item .ttd-role  {
    font-size:13px; color:#444; margin-bottom:48px;
    text-align:center; font-family:'Times New Roman', Times, serif;
  }
  .ttd-item .ttd-line  { width:200px; height:1px; border-bottom:1px solid #333; margin-bottom:5px; }
  .ttd-item .ttd-name  {
    font-size:13px; font-weight:bold; color:#111;
    text-align:center; font-family:'Times New Roman', Times, serif;
  }
  .ttd-item .ttd-nip   {
    font-size:12px; color:#555;
    text-align:center; font-family:'Times New Roman', Times, serif;
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="border-outer"></div>
  <div class="border-inner"></div>

  <div class="header">
    ${logoUrl ? `<img class="header-logo" src="${logoUrl}" alt="Logo Sekolah" />` : ''}
    <div class="header-school">RUHUL ISLAM ANAK BANGSA</div>
    <div class="header-address">Jl. Ajun, Gue Gajah, Kec. Darul Imarah, Kabupaten Aceh Besar, Aceh 23233</div>
    <div class="header-accred">Terakreditasi A &nbsp;|&nbsp; NPSN: 10114244</div>
  </div>
  <div class="header-line1"></div>
  <div class="header-line2"></div>

  <div class="content">

    <div class="content-top">
      <div class="title">S E R T I F I K A T</div>
      <div class="nomor">Nomor: ${nomor}</div>
      <div class="divider"></div>
      <div class="opening">Yang bertanda tangan di bawah ini menerangkan bahwa:</div>
      <table class="info-table">
        <tr>
          <td class="key">Nama Lengkap</td>
          <td class="sep">:</td>
          <td class="val-bold">${nama}</td>
        </tr>
        <tr>
          <td class="key">NIS</td>
          <td class="sep">:</td>
          <td>${nis}</td>
        </tr>
        <tr>
          <td class="key">Judul Karya Ilmiah</td>
          <td class="sep">:</td>
          <td>${judul}</td>
        </tr>
        <tr>
          <td class="key">Tahun Ajaran</td>
          <td class="sep">:</td>
          <td>${tahun_ajaran}</td>
        </tr>
      </table>
    </div>

    <div class="ket">
      telah berhasil menyelesaikan dan mengumpulkan karya ilmiah pada sistem E-Arsip Karya Ilmiah.<br>
      Sertifikat ini diberikan sebagai bentuk penghargaan atas kontribusi dalam pengarsipan karya ilmiah sekolah.
    </div>

    <div class="ttd-wrap">
      <div class="ttd-item">
        <div class="ttd-place">${tanggal}</div>
        <div class="ttd-role">Kepala Sekolah</div>
        <div class="ttd-line"></div>
        <div class="ttd-name">${namaKepsek}</div>
        <div class="ttd-nip">NIP. ${nipKepsek}</div>
      </div>
    </div>

  </div>
</div>
</body>
</html>`;
}