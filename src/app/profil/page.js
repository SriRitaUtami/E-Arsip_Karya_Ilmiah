// src/app/profil/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderBox from '../../components/HeaderBox';
import Toast, { showToast } from '../../components/Toast';

const ITEMS_PER_PAGE = 10;

const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const formatTanggal = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const IconFile = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

const IconCert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

// Icon untuk Bukti Unggah (receipt/stamp style)
const IconBukti = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="13" x2="15" y2="13"/>
    <line x1="9" y1="17" x2="12" y2="17"/>
    <polyline points="9 10 9 10"/>
  </svg>
);

const IconAlert = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e67e22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [myDocs, setMyDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allowPrint, setAllowPrint] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingCert, setLoadingCert] = useState(null);
  const [loadingBukti, setLoadingBukti] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/'); return; }

    const decoded = decodeToken(token);
    if (!decoded) { router.push('/'); return; }
    setUser(decoded);

    const scope = decoded.role === 'admin' ? 'uploaded' : 'profile';

    Promise.all([
      fetch(`/api/save-document?scope=${scope}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),
      fetch('/api/settings').then(res => res.json())
    ])
      .then(([docsData, settingsData]) => {
        setMyDocs(docsData.data || []);
        setAllowPrint(!!settingsData.allow_print);
      })
      .catch(err => console.error('Fetch error:', err))
      .finally(() => setLoading(false));
  }, [router]);

  if (!user) return null;

  const showCert = user.role === 'admin' || allowPrint;

  const totalPages = Math.ceil(myDocs.length / ITEMS_PER_PAGE);
  const paginated = myDocs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const tdStyle = {
    padding: '11px 16px',
    fontSize: '13px',
    borderBottom: '1px solid #edf5ec',
    textAlign: 'center',
    fontFamily: 'serif',
  };

  const handleUnduhSertifikat = async (rowId, nis) => {
    const token = localStorage.getItem('token');
    setLoadingCert(rowId);
    try {
      const res = await fetch(`/api/sertifikat/${rowId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) { showToast(setToast, 'Gagal mengunduh sertifikat!', 'error'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `sertifikat-${nis}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(setToast, 'Sertifikat berhasil diunduh!', 'success');
    } catch (err) {
      showToast(setToast, 'Terjadi kesalahan: ' + err.message, 'error');
    } finally {
      setLoadingCert(null);
    }
  };

  const handleUnduhBukti = async (rowId, nis) => {
    const token = localStorage.getItem('token');
    setLoadingBukti(rowId);
    try {
      const res = await fetch(`/api/bukti-unggah/${rowId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) { showToast(setToast, 'Gagal mengunduh bukti unggah!', 'error'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `bukti-unggah-${nis}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(setToast, 'Bukti unggah berhasil diunduh!', 'success');
    } catch (err) {
      showToast(setToast, 'Terjadi kesalahan: ' + err.message, 'error');
    } finally {
      setLoadingBukti(null);
    }
  };

  // Header kolom — Bukti Unggah selalu tampil (statis)
  const tableHeaders = [
    'No', 'NIS', 'Nama', 'Judul Karya Ilmiah',
    'Tahun Ajaran', 'Tgl. Unggah', 'Bukti Unggah',
    showCert ? 'File / Sertifikat' : 'File'
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f2f7f1', fontFamily: 'serif' }}>
      <Toast toast={toast} />
      <HeaderBox />

      <div style={{ background: '#fff', minHeight: 'calc(100vh - 60px)', padding: '28px' }}>

        <h2 style={{ margin: '0 0 12px', fontSize: '30px', color: '#1a2e1a', fontWeight: 700 }}>
          Dokumen Karya Ilmiah
        </h2>

        <div style={{ marginBottom: '20px', fontSize: '16px', color: '#2d5a27' }}>
          <p style={{ margin: '8px 0' }}><strong>Nama:</strong> {user.nama || '-'}</p>
          <p style={{ margin: '8px 0' }}>
            <strong>{user.role === 'admin' ? 'NIP' : 'NIS'}:</strong>{' '}
            {user.role === 'admin' ? user.nip : user.nis || '-'}
          </p>
          <p style={{ margin: '8px 0' }}>
            <strong>Keterangan :</strong> {user.role === 'admin' ? 'Admin' : 'Siswa'}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#7a9b74' }}>Loading...</div>
        ) : myDocs.length === 0 ? (
          <div style={{
            background: '#fef5e7', border: '1px solid #f9e79f',
            borderRadius: '12px', padding: '32px', textAlign: 'center'
          }}>
            <div style={{ marginBottom: '12px' }}><IconAlert /></div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a2e1a', marginBottom: '8px' }}>
              {user.role === 'admin' ? 'Belum ada dokumen yang kamu upload' : 'Kamu belum mengupload karya ilmiah'}
            </div>
            <div style={{ fontSize: '13px', color: '#7a9b74', marginBottom: '20px' }}>
              Upload dokumen karya ilmiah agar tersimpan di sistem
            </div>
            <button
              onClick={() => router.push('/create')}
              style={{
                background: '#2d5a27', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '10px 20px',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'serif'
              }}
            >
              Upload Sekarang
            </button>
          </div>
        ) : (
          <>
            <div style={{ border: '1px solid #edf5ec', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {tableHeaders.map(h => (
                      <th key={h} style={{
                        background: '#f0f7ee', color: '#2d5a27',
                        fontSize: '12px', fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '12px 16px', textAlign: 'center'
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((row, index) => (
                    <tr key={row.id} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8fcf7' }}>
                      <td style={tdStyle}>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                      <td style={tdStyle}>{row.nis}</td>
                      <td style={tdStyle}>{row.nama_siswa}</td>
                      <td style={{ ...tdStyle, textAlign: 'left' }}>{row.judul}</td>
                      <td style={tdStyle}>{row.tahun_ajaran}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{formatTanggal(row.tanggal_upload)}</td>

                      {/* Kolom Bukti Unggah — selalu tampil */}
                      <td style={tdStyle}>
                        <button
                          onClick={() => handleUnduhBukti(row.id, row.nis)}
                          disabled={loadingBukti === row.id}
                          title="Unduh Bukti Unggah"
                          style={{
                            background: loadingBukti === row.id ? '#d0d0d0' : '#f0f0f0',
                            color: loadingBukti === row.id ? '#888' : '#111',
                            border: '1px solid #bbb',
                            borderRadius: '7px',
                            padding: '6px 10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: loadingBukti === row.id ? 'not-allowed' : 'pointer',
                            fontSize: '11px',
                            fontFamily: 'serif',
                          }}
                        >
                          <IconBukti />
                          {loadingBukti === row.id ? '...' : ''}
                        </button>
                      </td>

                      {/* Kolom File / Sertifikat */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          {row.file_url ? (
                            <a
                              href={`/lampiran?url=${encodeURIComponent(row.file_url)}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Lihat Lampiran"
                              style={{
                                background: '#e8f5e2', color: '#2d5a27',
                                borderRadius: '7px', padding: '6px 10px',
                                display: 'inline-flex', alignItems: 'center',
                                textDecoration: 'none'
                              }}
                            >
                              <IconFile />
                            </a>
                          ) : (
                            <span style={{ color: '#ccc', fontSize: '12px' }}>-</span>
                          )}

                          {showCert && (
                            <button
                              onClick={() => handleUnduhSertifikat(row.id, row.nis)}
                              disabled={loadingCert === row.id}
                              title="Unduh Sertifikat"
                              style={{
                                background: loadingCert === row.id ? '#7a9b74' : '#2d5a27',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '7px',
                                padding: '6px 10px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: loadingCert === row.id ? 'not-allowed' : 'pointer',
                                fontSize: '11px',
                                fontFamily: 'serif'
                              }}
                            >
                              <IconCert />
                              {loadingCert === row.id ? '...' : ''}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginTop: '12px',
              fontSize: '13px', color: '#2d5a27'
            }}>
              <span>
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, myDocs.length)} of {myDocs.length} dokumen
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '4px 12px', borderRadius: '4px', border: '1px solid #ccc',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    background: currentPage === 1 ? '#f5f5f5' : '#fff'
                  }}
                >Prev</button>
                <span>{currentPage} dari {totalPages || 1}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  style={{
                    padding: '4px 12px', borderRadius: '4px', border: '1px solid #ccc',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    background: currentPage === totalPages ? '#f5f5f5' : '#fff'
                  }}
                >Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}