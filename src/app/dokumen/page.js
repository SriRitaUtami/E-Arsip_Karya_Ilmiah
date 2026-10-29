//src/app/dokumen/page.json
'use client';
import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import HeaderBox from '../../components/HeaderBox';
import Toast, { showToast } from '../../components/Toast';

const ITEMS_PER_PAGE = 10;
const tahunAjaranList = ["2024/2025", "2025/2026", "2026/2027"];

const IconFile = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);
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

export default function HomePage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [filterTahun, setFilterTahun] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editData, setEditData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const fetchData = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetch('/api/save-document?scope=all', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
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

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setLoadingDelete(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/save-document?id=${deleteId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      fetchData();
      setShowDeleteModal(false);
      setDeleteId(null);
      showToast(setToast, 'Dokumen berhasil dihapus!', 'success');
    } else {
      setShowDeleteModal(false);
      setDeleteId(null);
      showToast(setToast, 'Gagal menghapus dokumen!', 'error');
    }
    setLoadingDelete(false);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setLoadingEdit(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('nis', editData.nis);
    formData.append('nama_peneliti', editData.nama_peneliti);
    formData.append('judul', editData.judul);
    formData.append('tahun_ajaran', editData.tahun_ajaran);
    formData.append('tanggal_upload', editData.tanggal_upload);
    if (editData.newFile) formData.append('file', editData.newFile);

    const res = await fetch(`/api/edit-document/${editData.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setShowModal(false);
      fetchData();
      showToast(setToast, 'Data dokumen berhasil diperbarui!', 'success');
    } else {
      showToast(setToast, data.message || 'Gagal update dokumen!', 'error');
    }
    setLoadingEdit(false);
  };

  const filtered = data.filter(row => {
    const matchTahun = filterTahun ? row.tahun_ajaran === filterTahun : true;
    const keyword = search.toLowerCase();
    const matchSearch = !keyword || [row.nis, row.nama_peneliti, row.judul, row.tahun_ajaran, row.tanggal_upload]
      .some(val => String(val || '').toLowerCase().includes(keyword));
    return matchTahun && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [filterTahun, search]);

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
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '16px', color: '#888', fontSize: '12px' }}>
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
                  {row.file_url ? (
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
                <td style={tdStyle}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => { setEditData({ ...row, newFile: null }); setShowModal(true); }}
                      title="Edit"
                      style={{ background: '#e8f5e2', color: '#2d5a27', border: 'none', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', display: 'flex' }}
                    >
                      <IconEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(row.id)}
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
            Menampilkan {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} dokumen
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
      {showModal && editData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <form onSubmit={handleEditSave} style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '480px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: '700' }}>Update Dokumen Karya Ilmiah</h3>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>NIS</label>
              <input
                value={editData.nis || ''}
                onChange={e => setEditData(prev => ({ ...prev, nis: e.target.value }))}
                style={{ display: 'block', width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', marginTop: '4px', boxSizing: 'border-box', background: '#D9D9D9' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Nama</label>
              <input
                value={editData.nama_peneliti || ''}
                onChange={e => setEditData(prev => ({ ...prev, nama_peneliti: e.target.value }))}
                style={{ display: 'block', width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', marginTop: '4px', boxSizing: 'border-box', background: '#D9D9D9' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Judul</label>
              <input
                value={editData.judul || ''}
                onChange={e => setEditData(prev => ({ ...prev, judul: e.target.value }))}
                style={{ display: 'block', width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', marginTop: '4px', boxSizing: 'border-box', background: '#D9D9D9' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Tahun Ajaran</label>
              <select
                value={editData.tahun_ajaran || ''}
                onChange={e => setEditData(prev => ({ ...prev, tahun_ajaran: e.target.value }))}
                style={{ display: 'block', width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', marginTop: '4px', background: '#D9D9D9' }}
              >
                <option value="">Pilih Tahun Ajaran</option>
                {tahunAjaranList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Tanggal Upload</label>
              <input
                type="date"
                value={editData.tanggal_upload?.split('T')[0] || ''}
                onChange={e => setEditData(prev => ({ ...prev, tanggal_upload: e.target.value }))}
                style={{ display: 'block', width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', marginTop: '4px', boxSizing: 'border-box', background: '#D9D9D9' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Ganti File PDF (kosongkan jika tidak ganti)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setEditData(prev => ({ ...prev, newFile: e.target.files[0] }))}
                style={{ display: 'block', width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', marginTop: '4px', background: '#D9D9D9' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loadingEdit}
                style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #ccc', cursor: loadingEdit ? 'not-allowed' : 'pointer' }}
              >Batal</button>
              <button
                type="submit"
                disabled={loadingEdit}
                style={{
                  padding: '6px 14px',
                  background: loadingEdit ? '#7a9b74' : '#02542D',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loadingEdit ? 'not-allowed' : 'pointer',
                  minWidth: '90px'
                }}
              >
                {loadingEdit ? 'Memperbarui...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Hapus */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#D9D9D9', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: '700', color: '#000' }}>Konfirmasi Hapus</h3>
            <p style={{ fontSize: '13px', marginBottom: '20px', color: '#000' }}>
              Yakin ingin menghapus data ini? Data yang telah dihapus tidak bisa dibatalkan.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={loadingDelete}
                style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #ccc', cursor: loadingDelete ? 'not-allowed' : 'pointer', background: '#fff' }}
              >Batal</button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={loadingDelete}
                style={{
                  padding: '6px 14px',
                  background: loadingDelete ? '#7a9b74' : '#02542D',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loadingDelete ? 'not-allowed' : 'pointer',
                  minWidth: '80px'
                }}
              >
                {loadingDelete ? 'Menghapus...' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}