//src/app/edit/[id]/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import '../../styles/form.css';
import HeaderBox from '../../components/HeaderBox';

const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const tahunAjaranList = [
  { value: "2024/2025", label: "2024/2025" },
  { value: "2025/2026", label: "2025/2026" },
  { value: "2026/2027", label: "2026/2027" },
];

const EditPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [nis, setNis] = useState('');
  const [namaPeneliti, setNamaPeneliti] = useState('');
  const [judulKaryaIlmiah, setJudulKaryaIlmiah] = useState('');
  const [tahunAjaran, setTahunAjaran] = useState('');
  const [tanggalUpload, setTanggalUpload] = useState('');
  const [dokumenPdf, setDokumenPdf] = useState(null);
  const [fileName, setFileName] = useState('');
  const [oldFileUrl, setOldFileUrl] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const user = decodeToken(token);
    if (user?.role!== 'admin') {
      alert('Hanya admin yang boleh akses halaman ini');
      router.push('/login');
      return;
    }

    fetch(`/api/save-document`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
 .then(res => res.json())
 .then(json => {
      const doc = json.data?.find(d => String(d.id) === String(id));
      if (!doc) {
        setError('Data tidak ditemukan');
        return;
      }

      setNis(doc.nis);
      setNamaPeneliti(doc.nama_peneliti);
      setJudulKaryaIlmiah(doc.judul);
      setTahunAjaran(doc.tahun_ajaran);
      setTanggalUpload(doc.tanggal_upload?.split('T')[0] || '');
      setOldFileUrl(doc.file_url || '');
    })
 .catch(err => {
      console.error(err);
      setError('Gagal ambil data');
    });
  }, [id, router]);

  const handleSubmit = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');
  if (!token) {
    setError('Sesi habis, silakan login ulang');
    router.push('/login');
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const formData = new FormData();
    formData.append('nis', nis);
    formData.append('nama_peneliti', namaPeneliti);
    formData.append('judul', judulKaryaIlmiah);
    formData.append('tahun_ajaran', tahunAjaran);
    if (tanggalUpload) formData.append('tanggal_upload', tanggalUpload); // ← hanya append kalau ada
    if (dokumenPdf) formData.append('file', dokumenPdf);

    const res = await fetch(`/api/edit-document/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal update');

    router.push('/dokumen');
  } catch (error) {
    setError(error.message || 'Gagal mengupdate data!');
    setLoading(false);
  }
};
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type!== 'application/pdf') {
        setError('File harus berupa PDF!');
        return;
      }
      setDokumenPdf(file);
      setFileName(file.name);
      setError(null);
    } else {
      setDokumenPdf(null);
      setFileName('');
    }
  };

  return (
    <div>
      <HeaderBox />
      <div className="form-container">
        <h1 className="mb-9 text-3xl font-serif text-center">Edit Karya Ilmiah</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={nis}
            onChange={(e) => {
              const input = e.target.value;
              if (/^[0-9]*$/.test(input)) {
                setNis(input);
                setError(null);
              }
            }}
            minLength={10}
            maxLength={20}
            className="form-input"
            placeholder="Nomor Induk Siswa"
          />

          <input
            type="text"
            value={namaPeneliti}
            onChange={(e) => setNamaPeneliti(e.target.value)}
            className="form-input"
            placeholder="Nama"
          />

          <input type="text" value={judulKaryaIlmiah} onChange={(e) => setJudulKaryaIlmiah(e.target.value)} className="form-input" placeholder="Judul Karya Ilmiah" />

          <select value={tahunAjaran} onChange={(e) => setTahunAjaran(e.target.value)} className="form-select">
            <option value="">Tahun Ajaran</option>
            {tahunAjaranList.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input type="date" value={tanggalUpload} onChange={(e) => setTanggalUpload(e.target.value)} className="form-input" />

          <div>
            <span className="drop-file-text block mb-2">Ganti file (opsional)</span>
            {oldFileUrl && (
              <div className="mb-2 text-sm">
                File saat ini: <a href={oldFileUrl} target="_blank" className="text-blue-600 underline">Lihat PDF</a>
              </div>
            )}
            <div className="file-input-container">
              <input type="file" accept=".pdf" onChange={handleFileChange} className="form-input" />
              <span> {fileName? fileName : ''} <img src="/folder.png" alt="Pilih Dokumen PDF" width="20" height="20" /> </span>
            </div>
          </div>

          {error && <p className="text-red-500">{error}</p>}
          <button type="submit" className="form-button" disabled={loading}>
            {loading? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPage;