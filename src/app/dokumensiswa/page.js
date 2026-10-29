//src/app/dokumensiswa/page.js
'use client';
import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import HeaderBox from '../../components/HeaderBox';

const ITEMS_PER_PAGE = 10;
const tahunAjaranList = ["2024/2025", "2025/2026", "2026/2027"];

const IconFile = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

export default function HomePage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [filterTahun, setFilterTahun] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetch('/api/save-document?scope=all', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
   .then(res => res.json())
   .then(json => setData(json.data || []))
   .catch(err => console.error(err));
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatTanggal = (val) => {
    if (!val) return '-';
    const d = new Date(val);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const filtered = data.filter(row => {
    const matchTahun = filterTahun? row.tahun_ajaran === filterTahun : true;
    const keyword = search.toLowerCase();
    const matchSearch =!keyword || [row.nis, row.nama_peneliti, row.judul, row.tahun_ajaran, row.tanggal_upload]
    .some(val => String(val || '').toLowerCase().includes(keyword));
    return matchTahun && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [filterTahun, search]);

  const getRowStyle = (index) => ({
    backgroundColor: index % 2 === 0? '#fff' : '#f8fcf7',
    fontSize: '13px',
  });

  const thStyle = {
    padding: '11px 16px',
    background: '#f0f7ee',
    color: '#2d5a27',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  };

  const tdStyle = {
    padding: '11px 16px',
    fontSize: '11.5px',
    borderBottom: '1px solid #edf5ec',
    textAlign: 'center',
    fontFamily: 'serif',
  };

  return (
    <div>
      <Head><title>Dokumen</title></Head>
      <HeaderBox />
      <div className="absolute top-[calc(1.2rem+1.6cm)] left-1/2 -translate-x-1/2 bg-[#E9F3EB] p-5 rounded-3xl shadow-xl w-[1500px]">
        <p style={{ fontFamily: 'serif', fontSize: '14px' }} className="text-black">Dokumen</p>
        <hr className="border border-white w-full mt-2" />

        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0', gap: '12px' }}>
          <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>Tahun Ajaran:</label>
            <select
              value={filterTahun}
              onChange={e => setFilterTahun(e.target.value)}
              style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
            >
              <option value="">Semua</option>
              {tahunAjaranList.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>Cari:</label>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, judul, NIS..."
              style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', width: '280px' }}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>No</th>
              <th style={thStyle}>NIS</th>
              <th style={thStyle}>Nama</th>
              <th style={thStyle}>Judul Karya Ilmiah</th>
              <th style={thStyle}>Tahun Ajaran</th>
              <th style={thStyle}>Tanggal Unggah</th>
              <th style={thStyle}>File</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '16px', color: '#888', fontSize: '12px' }}>
                  Data tidak ditemukan
                </td>
              </tr>
            ) : paginated.map((row, index) => (
              <tr key={row.id} style={getRowStyle(index)}>
                <td style={tdStyle}>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                <td style={tdStyle}>{row.nis}</td>
                <td style={tdStyle}>{row.nama_peneliti}</td>
                <td style={tdStyle}>{row.judul}</td>
                <td style={tdStyle}>{row.tahun_ajaran}</td>
                <td style={tdStyle}>{formatTanggal(row.tanggal_upload)}</td>
                <td style={tdStyle}>
                  {row.file_url? (
                    <a
                      href={`/lampiran?url=${encodeURIComponent(row.file_url)}`}
                      target="_blank"
                      title="Lihat Dokumen"
                      style={{ background: '#e8f5e2', color: '#2d5a27', borderRadius: 7, padding: '6px 8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <IconFile />
                    </a>
                  ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '13px' }}>
          <span>
            Menampilkan {filtered.length === 0? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} dokumen
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #ccc', cursor: currentPage === 1? 'not-allowed' : 'pointer' }}
            >‹</button>
            <span>{currentPage} dari {totalPages || 1}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #ccc', cursor: currentPage === totalPages? 'not-allowed' : 'pointer' }}
            >›</button>
          </div>
        </div>
      </div>
    </div>
  );
}