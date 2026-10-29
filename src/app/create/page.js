// src/app/create/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../../styles/form.css';
import HeaderBox from '../../components/HeaderBox';
import Toast, { showToast } from '../../components/Toast';

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

const CreatePage = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState('');
  const [loggedInNis, setLoggedInNis] = useState('');
  const [nis, setNis] = useState('');
  const [namaPeneliti, setNamaPeneliti] = useState('');
  const [judulKaryaIlmiah, setJudulKaryaIlmiah] = useState('');
  const [tahunAjaran, setTahunAjaran] = useState('');
  const [tanggalUpload, setTanggalUpload] = useState('');
  const [dokumenPdf, setDokumenPdf] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [allowUpload, setAllowUpload] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    const user = decodeToken(token);
    setUserRole(user?.role || '');

    if (user?.role === 'siswa') {
      setLoggedInNis(String(user.nis));
      setNamaPeneliti(user.nama);
      setNis(String(user.nis));

      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          setAllowUpload(!!data.allow_upload);
          if (!data.allow_upload) {
            alert('Waktu upload dokumen belum dibuka atau sudah ditutup');
            router.push('/dashboardsiswa');
          }
        });
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Sesi habis, silakan login ulang');
      router.push('/');
      return;
    }

    if (userRole === 'siswa') {
      if (!allowUpload) {
        setError('Upload dokumen sedang ditutup oleh admin');
        return;
      }
      if (String(nis) !== String(loggedInNis)) {
        setError('NIS harus sesuai dengan akun Anda. Anda hanya bisa upload dokumen pribadi.');
        return;
      }
    }

    if (!nis || !namaPeneliti || !judulKaryaIlmiah || !tahunAjaran || !tanggalUpload || !dokumenPdf) {
      setError('Semua field harus diisi!');
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMsg('Mengunggah file ke server...');

    try {
      const formData = new FormData();
      formData.append('file', dokumenPdf);
      const uploadRes = await fetch('/api/upload-document', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Gagal upload dokumen');

      setStatusMsg('Menyimpan data...');

      const saveRes = await fetch('/api/save-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nis,
          namaPeneliti,
          judulKaryaIlmiah,
          tahunAjaran,
          tanggalUpload,
          fileUrl: uploadData.fileUrl,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.message || 'Gagal simpan ke database');

      setStatusMsg('');
      showToast(setToast, 'Pengunggahan karya ilmiah berhasil!', 'success');

      // ✅ Redirect beda tergantung role
      const redirectPath = userRole === 'admin' ? '/dokumen' : '/profil';
      setTimeout(() => {
        router.push(redirectPath);
      }, 2000);

    } catch (error) {
      setError(error.message || 'Gagal mengunggah data!');
      setStatusMsg('');
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
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
      <Toast toast={toast} />
      <HeaderBox />
      <div className="form-container">
        <h1 className="mb-9 text-3xl font-serif text-center">Karya Ilmiah</h1>
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
            placeholder={userRole === 'siswa' ? `NIS Anda: ${loggedInNis}` : "Nomor Induk Siswa"}
            required
            disabled={userRole === 'siswa'}
          />

          <input
            type="text"
            value={namaPeneliti}
            onChange={(e) => setNamaPeneliti(e.target.value)}
            className="form-input"
            placeholder="Nama Peneliti"
            required
            disabled={userRole === 'siswa'}
          />

          <input
            type="text"
            value={judulKaryaIlmiah}
            onChange={(e) => setJudulKaryaIlmiah(e.target.value)}
            className="form-input"
            placeholder="Judul Karya Ilmiah"
            required
          />

          <select
            value={tahunAjaran}
            onChange={(e) => setTahunAjaran(e.target.value)}
            className="form-select"
            required
          >
            <option value="">Tahun Ajaran</option>
            {tahunAjaranList.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={tanggalUpload}
            onChange={(e) => setTanggalUpload(e.target.value)}
            className="form-input"
            required
          />

          <div>
            <span className="drop-file-text block mb-2">Drop file</span>
            <div className="file-input-container">
              <input type="file" accept=".pdf" onChange={handleFileChange} className="form-input" required />
              <span>{fileName ? fileName : ''} <img src="/folder.png" alt="Pilih Dokumen PDF" width="20" height="20" /></span>
            </div>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          {statusMsg && (
            <p style={{ fontSize: '13px', color: '#2d5a27', marginBottom: '8px' }}>
              ⏳ {statusMsg}
            </p>
          )}

          <button type="submit" className="form-button" disabled={loading}>
            {loading ? 'Memproses...' : 'Unggah'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;