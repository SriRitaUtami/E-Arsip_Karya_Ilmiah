// src/app/setelan/page.js
'use client';

import { useState, useEffect } from 'react';
import HeaderBox from '../../components/HeaderBox';

const IconToggleOn = () => (
  <svg width="44" height="24" viewBox="0 0 44 24" fill="none">
    <rect x="1" y="1" width="42" height="22" rx="11" fill="#2d5a27" stroke="#2d5a27" strokeWidth="2"/>
    <circle cx="33" cy="12" r="8" fill="white"/>
  </svg>
);

const IconToggleOff = () => (
  <svg width="44" height="24" viewBox="0 0 44 24" fill="none">
    <rect x="1" y="1" width="42" height="22" rx="11" fill="#ccc" stroke="#ccc" strokeWidth="2"/>
    <circle cx="11" cy="12" r="8" fill="white"/>
  </svg>
);

export default function SetelanPage() {
  const [allowUpload, setAllowUpload] = useState(true);
  const [allowDownload, setAllowDownload] = useState(true);
  const [allowPrint, setAllowPrint] = useState(true);
  const [namaKepsek, setNamaKepsek] = useState('');
  const [nipKepsek, setNipKepsek] = useState('');
  const [nomorUrut, setNomorUrut] = useState(0);
  const [formatNomor, setFormatNomor] = useState('{nomor}/SKT/RIAB/{bulan}/{tahun}');
  const [logoUrl, setLogoUrl] = useState(null);
  const [warnaHeader, setWarnaHeader] = useState('#8b6914');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingKepsek, setSavingKepsek] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setAllowUpload(!!data.allow_upload);
        setAllowDownload(!!data.allow_download);
        setAllowPrint(!!data.allow_print);
        setNamaKepsek(data.nama_kepsek || '');
        setNipKepsek(data.nip_kepsek || '');
        setNomorUrut(data.nomor_urut_sertifikat ?? 0);
        setFormatNomor(data.format_nomor_sertifikat || '{nomor}/SKT/RIAB/{bulan}/{tahun}');
        setLogoUrl(data.logo_sekolah_url || null);
        setWarnaHeader(data.warna_header || '#8b6914');
        setLoading(false);
      });
  }, []);

  const getToken = () => localStorage.getItem('token');

  const handleToggleUpload = async () => {
    const newValue = !allowUpload;
    setAllowUpload(newValue);
    await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ allow_upload: newValue ? 1 : 0 })
    });
  };

  const handleToggleDownload = async () => {
    const newValue = !allowDownload;
    setAllowDownload(newValue);
    await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ allow_download: newValue ? 1 : 0 })
    });
  };

  const handleTogglePrint = async () => {
    const newValue = !allowPrint;
    setAllowPrint(newValue);
    await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ allow_print: newValue ? 1 : 0 })
    });
  };

  const handleSimpanKepsek = async () => {
    setSavingKepsek(true);
    setSavedMsg('');
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          nama_kepsek: namaKepsek,
          nip_kepsek: nipKepsek,
          nomor_urut_sertifikat: Number(nomorUrut),
          format_nomor_sertifikat: formatNomor,
          warna_header: warnaHeader
        })
      });
      setSavedMsg('Tersimpan.');
    } catch {
      setSavedMsg('Gagal menyimpan.');
    } finally {
      setSavingKepsek(false);
      setTimeout(() => setSavedMsg(''), 3000);
    }
  };

  const handleUploadLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const res = await fetch('/api/settings/logo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setLogoUrl(data.logo_sekolah_url);
        setSavedMsg('Logo berhasil diunggah.');
      } else {
        setSavedMsg(data.message || 'Gagal mengunggah logo.');
      }
    } catch {
      setSavedMsg('Gagal mengunggah logo.');
    } finally {
      setUploadingLogo(false);
      setTimeout(() => setSavedMsg(''), 3000);
    }
  };

  const boxStyle = {
    background: '#f8fcf7',
    border: '1px solid #e0f0dd',
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cfe3cb',
    fontSize: '14px',
    fontFamily: 'serif',
    marginTop: '6px',
    marginBottom: '14px',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1a2e1a'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f2f7f1', fontFamily: 'serif' }}>
      <HeaderBox />

      <div style={{
        background: '#fff',
        minHeight: 'calc(100vh - 60px)',
        padding: '28px'
      }}>
        <h2 style={{ margin: '0 0 24px', fontSize: '20px', color: '#1a2e1a', fontWeight: 700 }}>
          Pengaturan Sistem
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#7a9b74' }}>Loading...</div>
        ) : (
          <>
            {/* BOX IZIN UPLOAD */}
            <div style={boxStyle}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a2e1a', marginBottom: '4px' }}>
                  Izin Upload Dokumen
                </div>
                <div style={{ fontSize: '13px', color: '#7a9b74' }}>
                  {allowUpload
                    ? 'Siswa diizinkan mengupload karya ilmiah'
                    : 'Siswa tidak bisa mengupload karya ilmiah'}
                </div>
              </div>
              <button
                onClick={handleToggleUpload}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {allowUpload ? <IconToggleOn /> : <IconToggleOff />}
              </button>
            </div>

            {/* BOX IZIN DOWNLOAD */}
            <div style={boxStyle}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a2e1a', marginBottom: '4px' }}>
                  Izin Download Dokumen
                </div>
                <div style={{ fontSize: '13px', color: '#7a9b74' }}>
                  {allowDownload
                    ? 'Siswa diizinkan mendownload file karya ilmiah'
                    : 'Siswa tidak bisa mendownload file karya ilmiah'}
                </div>
              </div>
              <button
                onClick={handleToggleDownload}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {allowDownload ? <IconToggleOn /> : <IconToggleOff />}
              </button>
            </div>

            {/* BOX IZIN SERTIFIKAT */}
            <div style={boxStyle}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a2e1a', marginBottom: '4px' }}>
                  Izin Cetak Sertifikat
                </div>
                <div style={{ fontSize: '13px', color: '#7a9b74' }}>
                  {allowPrint
                    ? 'Siswa diizinkan mencetak sertifikat karya ilmiah'
                    : 'Siswa tidak bisa mencetak sertifikat karya ilmiah'}
                </div>
              </div>
              <button
                onClick={handleTogglePrint}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {allowPrint ? <IconToggleOn /> : <IconToggleOff />}
              </button>
            </div>

            {/* BOX DATA SERTIFIKAT (KEPSEK + NOMOR) */}
            <div style={{
              background: '#f8fcf7',
              border: '1px solid #e0f0dd',
              borderRadius: '12px',
              padding: '20px 24px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a2e1a', marginBottom: '4px' }}>
                Data Sertifikat
              </div>
              <div style={{ fontSize: '13px', color: '#7a9b74', marginBottom: '16px' }}>
                Digunakan sebagai tanda tangan pada sertifikat yang baru dicetak
              </div>

              <label style={labelStyle}>Nama Kepala Sekolah</label>
              <input
                style={inputStyle}
                type="text"
                value={namaKepsek}
                onChange={e => setNamaKepsek(e.target.value)}
                placeholder="Contoh: Riadhi, S.Pd., M.Pd"
              />

              <label style={labelStyle}>NIP Kepala Sekolah</label>
              <input
                style={inputStyle}
                type="text"
                value={nipKepsek}
                onChange={e => setNipKepsek(e.target.value)}
                placeholder="Contoh: 197001012000121001"
              />

              <label style={labelStyle}>Nomor Urut Sertifikat Saat Ini</label>
              <input
                style={inputStyle}
                type="number"
                value={nomorUrut}
                onChange={e => setNomorUrut(e.target.value)}
                placeholder="0"
              />
              <div style={{ fontSize: '12px', color: '#999', marginTop: '-10px', marginBottom: '14px' }}>
                Sertifikat berikutnya akan menggunakan nomor urut + 1. Ubah nilai ini hanya jika perlu reset.
              </div>

              <label style={labelStyle}>Format Nomor Sertifikat</label>
              <input
                style={inputStyle}
                type="text"
                value={formatNomor}
                onChange={e => setFormatNomor(e.target.value)}
                placeholder="{nomor}/SKT/RIAB/{bulan}/{tahun}"
              />
              <div style={{ fontSize: '12px', color: '#999', marginTop: '-10px', marginBottom: '6px' }}>
                Placeholder yang tersedia: <code>{'{nomor}'}</code> (3 digit), <code>{'{bulan}'}</code> (angka romawi), <code>{'{tahun}'}</code>
              </div>
              <div style={{
                fontSize: '13px',
                color: '#2d5a27',
                background: '#eef7ec',
                border: '1px solid #cfe3cb',
                borderRadius: '6px',
                padding: '8px 12px',
                marginBottom: '14px'
              }}>
                Contoh hasil: {formatNomor
                  .replace('{nomor}', String(Number(nomorUrut) + 1).padStart(3, '0'))
                  .replace('{bulan}', 'VIII')
                  .replace('{tahun}', new Date().getFullYear())}
              </div>

              <button
                onClick={handleSimpanKepsek}
                disabled={savingKepsek}
                style={{
                  background: '#2d5a27',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontFamily: 'serif',
                  cursor: savingKepsek ? 'not-allowed' : 'pointer',
                  opacity: savingKepsek ? 0.7 : 1
                }}
              >
                {savingKepsek ? 'Menyimpan...' : 'Simpan'}
              </button>
              {savedMsg && (
                <span style={{ marginLeft: '12px', fontSize: '13px', color: '#2d5a27' }}>
                  {savedMsg}
                </span>
              )}
            </div>

            {/* BOX DESAIN SERTIFIKAT (LOGO + WARNA) */}
            <div style={{
              background: '#f8fcf7',
              border: '1px solid #e0f0dd',
              borderRadius: '12px',
              padding: '20px 24px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a2e1a', marginBottom: '4px' }}>
                Desain Sertifikat
              </div>
              <div style={{ fontSize: '13px', color: '#7a9b74', marginBottom: '16px' }}>
                Logo dan warna header pada sertifikat
              </div>

              <label style={labelStyle}>Logo Sekolah</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', marginBottom: '14px' }}>
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo sekolah"
                    style={{ width: '64px', height: '64px', objectFit: 'contain', border: '1px solid #e0f0dd', borderRadius: '6px', background: '#fff' }}
                  />
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadLogo}
                    disabled={uploadingLogo}
                    style={{ fontSize: '13px' }}
                  />
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {uploadingLogo ? 'Mengunggah...' : 'Format PNG/JPG, maks 2MB'}
                  </div>
                </div>
              </div>

              <label style={labelStyle}>Warna Header</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', marginBottom: '4px' }}>
                <input
                  type="color"
                  value={warnaHeader}
                  onChange={e => setWarnaHeader(e.target.value)}
                  style={{ width: '44px', height: '36px', border: '1px solid #cfe3cb', borderRadius: '6px', cursor: 'pointer', padding: '2px' }}
                />
                <input
                  type="text"
                  value={warnaHeader}
                  onChange={e => setWarnaHeader(e.target.value)}
                  style={{ ...inputStyle, width: '120px', margin: 0 }}
                  placeholder="#8b6914"
                />
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '14px' }}>
                Warna header pada sertifikat (kode hex, contoh: #8b6914)
              </div>

              <button
                onClick={handleSimpanKepsek}
                disabled={savingKepsek}
                style={{
                  background: '#2d5a27',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontFamily: 'serif',
                  cursor: savingKepsek ? 'not-allowed' : 'pointer',
                  opacity: savingKepsek ? 0.7 : 1
                }}
              >
                {savingKepsek ? 'Menyimpan...' : 'Simpan'}
              </button>
              {savedMsg && (
                <span style={{ marginLeft: '12px', fontSize: '13px', color: '#2d5a27' }}>
                  {savedMsg}
                </span>
              )}
            </div>

            <div style={{
              marginTop: '24px',
              padding: '14px',
              background: '#fff8e1',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#8a6d3b'
            }}>
              <strong>Catatan:</strong> Perubahan akan langsung berlaku untuk semua akun siswa. Perubahan nama/NIP kepala sekolah hanya berlaku untuk sertifikat yang dicetak setelah perubahan disimpan.
            </div>
          </>
        )}
      </div>
    </div>
  );
}