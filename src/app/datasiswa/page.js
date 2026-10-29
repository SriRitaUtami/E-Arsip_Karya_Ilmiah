// src/app/datasiswa/page.js
'use client';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderBox from '../../components/HeaderBox';
import Toast, { showToast } from '../../components/Toast';

const ITEMS_PER_PAGE = 10;

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

export default function DataSiswa() {
  const router = useRouter();
  const [siswaList, setSiswaList] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBulkConfirm, setDeleteBulkConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const fetchSiswa = async () => {
  const token = localStorage.getItem('token');
  if (!token) { router.push('/'); return; }
  try {
    const res = await fetch('/api/siswa-list', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const text = await res.text();
    if (!text) return;
    setSiswaList(JSON.parse(text) || []);
  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => { fetchSiswa(); }, []);

  const filtered = siswaList.filter(row => {
    const keyword = search.toLowerCase();
    return !keyword || [row.nama, row.nis]
      .some(val => String(val || '').toLowerCase().includes(keyword));
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [search]);

  const allPageIds = paginated.map(r => r.id);
  const allFilteredIds = filtered.map(r => r.id);
  const isAllPageSelected = allPageIds.length > 0 && allPageIds.every(id => selectedIds.includes(id));
  const isAllFilteredSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));

  const toggleOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const togglePageAll = () => {
    if (isAllPageSelected) {
      setSelectedIds(prev => prev.filter(id => !allPageIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...allPageIds])]);
    }
  };

  const selectAllFiltered = () => {
    setSelectedIds(allFilteredIds);
  };

  const clearSelection = () => setSelectedIds([]);

  const handleEdit = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/siswa-list/${editData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nama: editData.nama, nis: editData.nis }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal update');
      setEditData(null);
      fetchSiswa();
      // ✅ Toast edit berhasil
      showToast(setToast, 'Data siswa berhasil diperbarui!', 'success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/siswa-list/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDeleteTarget(null);
      fetchSiswa();
      // ✅ Toast hapus berhasil
      showToast(setToast, 'Data siswa berhasil dihapus!', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      await fetch(`/api/siswa-list/bulk-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const count = selectedIds.length;
      setSelectedIds([]);
      setDeleteBulkConfirm(false);
      fetchSiswa();
      // ✅ Toast bulk delete berhasil
      showToast(setToast, `${count} data siswa berhasil dihapus!`, 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRowStyle = (index) => ({
    backgroundColor: index % 2 === 0 ? '#fff' : '#f8fcf7',
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
      <Toast toast={toast} />
      <Head><title>Data Siswa</title></Head>
      <HeaderBox />
      <div className="absolute top-[calc(1.2rem+1.6cm)] left-1/2 -translate-x-1/2 bg-[#E9F3EB] p-5 rounded-3xl shadow-xl w-[1500px]">
        <p style={{ fontFamily: 'serif', fontSize: '14px' }} className="text-black">Data Siswa</p>
        <hr className="border border-white w-full mt-2" />

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0', gap: '12px', flexWrap: 'wrap' }}>

          {/* Kiri: info seleksi + tombol bulk delete */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedIds.length > 0 && (
              <>
                <span style={{ fontSize: '13px', color: '#2d5a27', fontWeight: '600' }}>
                  {selectedIds.length} siswa dipilih
                </span>
                {!isAllFilteredSelected && filtered.length > paginated.length && (
                  <button
                    onClick={selectAllFiltered}
                    style={{ fontSize: '12px', color: '#2d5a27', background: '#e8f5e2', border: '1px solid #b7ddb0', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer' }}
                  >
                    Pilih semua {filtered.length} hasil pencarian
                  </button>
                )}
                <button
                  onClick={clearSelection}
                  style={{ fontSize: '12px', color: '#888', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer' }}
                >
                  Batal pilih
                </button>
                <button
                  onClick={() => setDeleteBulkConfirm(true)}
                  style={{ fontSize: '12px', color: '#fff', background: '#c0392b', border: 'none', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Hapus yang dipilih
                </button>
              </>
            )}
          </div>

          {/* Kanan: search */}
          <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>Cari:</label>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama atau NIS..."
              style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', width: '280px' }}
            />
          </div>
        </div>

        {/* Info select all filtered */}
        {isAllFilteredSelected && selectedIds.length > 0 && (
          <div style={{ background: '#e8f5e2', border: '1px solid #b7ddb0', borderRadius: '6px', padding: '8px 14px', marginBottom: '10px', fontSize: '13px', color: '#2d5a27' }}>
            Semua <strong>{filtered.length}</strong> siswa dari hasil pencarian telah dipilih.
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '40px' }}>
                <input
                  type="checkbox"
                  checked={isAllPageSelected}
                  onChange={togglePageAll}
                  title="Pilih semua di halaman ini"
                />
              </th>
              <th style={thStyle}>No</th>
              <th style={thStyle}>Nama</th>
              <th style={thStyle}>NIS</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '16px', color: '#888', fontSize: '12px' }}>
                  Data tidak ditemukan
                </td>
              </tr>
            ) : paginated.map((row, index) => (
              <tr key={row.id} style={{
                ...getRowStyle(index),
                background: selectedIds.includes(row.id) ? '#d4edda' : getRowStyle(index).backgroundColor,
              }}>
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => toggleOne(row.id)}
                  />
                </td>
                <td style={tdStyle}>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                <td style={tdStyle}>{row.nama}</td>
                <td style={tdStyle}>{row.nis}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => setEditData({ ...row })}
                      title="Edit"
                      style={{ background: '#e8f5e2', color: '#2d5a27', border: 'none', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', display: 'flex' }}
                    >
                      <IconEdit />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(row)}
                      title="Hapus"
                      style={{ background: '#fdecea', color: '#c0392b', border: 'none', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', display: 'flex' }}
                    >
                      <IconTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '13px' }}>
          <span>
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} siswa
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #ccc', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >‹</button>
            <span>{currentPage} dari {totalPages || 1}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #ccc', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >›</button>
          </div>
        </div>
      </div>

      {/* Modal Edit */}
      {editData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '480px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: '700' }}>Edit Akun Siswa</h3>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Nama</label>
              <input
                value={editData.nama || ''}
                onChange={e => setEditData(prev => ({ ...prev, nama: e.target.value }))}
                style={{ display: 'block', width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', marginTop: '4px', boxSizing: 'border-box', background: '#D9D9D9' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>NIS</label>
              <input
                value={editData.nis || ''}
                onChange={e => { if (/^[0-9]*$/.test(e.target.value)) setEditData(prev => ({ ...prev, nis: e.target.value })); }}
                style={{ display: 'block', width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', marginTop: '4px', boxSizing: 'border-box', background: '#D9D9D9' }}
              />
            </div>

            {error && <p style={{ color: '#c0392b', fontSize: '12px', marginBottom: '8px' }}>{error}</p>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={() => { setEditData(null); setError(null); }}
                style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
              >Batal</button>
              <button
                onClick={handleEdit}
                disabled={loading}
                style={{ padding: '6px 14px', background: '#02542D', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >{loading ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus Satu */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#D9D9D9', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: '700', color: '#000' }}>Konfirmasi Hapus</h3>
            <p style={{ fontSize: '13px', marginBottom: '20px', color: '#000' }}>
              Yakin ingin menghapus akun <strong>{deleteTarget.nama}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', background: '#fff' }}
              >Batal</button>
              <button
                onClick={handleDelete}
                style={{ padding: '6px 14px', background: '#02542D', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus Banyak */}
      {deleteBulkConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#D9D9D9', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: '700', color: '#000' }}>Konfirmasi Hapus</h3>
            <p style={{ fontSize: '13px', marginBottom: '20px', color: '#000' }}>
              Anda yakin ingin menghapus <strong>{selectedIds.length} akun siswa</strong> yang dipilih? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setDeleteBulkConfirm(false)}
                style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', background: '#fff' }}
              >Batal</button>
              <button
                onClick={handleBulkDelete}
                disabled={loading}
                style={{ padding: '6px 14px', background: '#02542D', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >{loading ? 'Menghapus...' : 'OK'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}