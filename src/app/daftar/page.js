//src/app/daftar/page.js
'use client';
import React, { useState } from 'react';
import HeaderBox from '../../components/HeaderBox';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const DaftarPage = () => {
  const router = useRouter();
  const [nama, setNama] = useState('');
  const [password, setPassword] = useState('');
  const [identifier, setIdentifier] = useState(''); // NIS atau NIP
  const [role, setRole] = useState('');

  const handleDaftarAkun = () => {
    router.push('/');
  };

  const handleRegister = async () => {
    const trimmedNama = nama.trim();
    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password.trim();

    if (!role ||!trimmedNama ||!trimmedIdentifier ||!trimmedPassword) {
      toast.error('Semua field harus diisi', {
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: { borderRadius: '10px', backgroundColor: '#DED6D6' }
      });
      return;
    }

    const namaRegex = /^[a-zA-Z\s]+$/;
    if (!namaRegex.test(trimmedNama)) {
      toast.error('Nama hanya boleh berisi huruf dan spasi', {
        autoClose: 5000,
        style: { borderRadius: '10px', backgroundColor: '#DED6D6' }
      });
      return;
    }

    if (!/^\d+$/.test(trimmedIdentifier)) {
      toast.error('NIS/NIP hanya boleh berisi angka', {
        autoClose: 5000,
        style: { borderRadius: '10px', backgroundColor: '#DED6D6' }
      });
      return;
    }

    const passwordRegex = /^[a-z0-9]{8,}$/;
    if (!passwordRegex.test(trimmedPassword)) {
      toast.error('Password harus minimal 8 karakter dan hanya berisi huruf kecil dan angka', {
        autoClose: 5000,
        style: { borderRadius: '10px', backgroundColor: '#DED6D6' }
      });
      return;
    }

    try {
      const response = await axios.post('/api/register', {
        role: role.toLowerCase(), // kirim 'admin' atau 'siswa'
        nama: trimmedNama,
        identifier: trimmedIdentifier,
        password: trimmedPassword
      });
      toast.success(response.data.message, {
        autoClose: 3000,
        style: { borderRadius: '10px', backgroundColor: '#DED6D6' },
        onClose: () => router.push('/')
      });
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message, {
          autoClose: 5000,
          style: { borderRadius: '10px', backgroundColor: '#DED6D6' }
        });
      } else {
        toast.error('Error registrasi', {
          autoClose: 5000,
          style: { borderRadius: '10px', backgroundColor: '#DED6D6' }
        });
      }
    }
  };

  return (
    <div>
      <HeaderBox />
      <ToastContainer />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '10vh' }}>
        <img src="/logo.png" alt="Gambar" style={{ width: '5%', height: 'auto' }} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '30%', padding: '20px', border: '1px solid #0A3F08', borderRadius: '5px', backgroundColor: '#0A3F08', marginTop: '20px', fontFamily: 'serif' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '50px', marginBottom: '20px', backgroundColor: '#FFFFFF', borderRadius: '5px' }}>
            <select style={{ width: '100%', height: '100%', padding: '10px', border: 'none', borderRadius: '5px', textAlign: 'left', fontFamily: 'Arial', fontSize: '16px' }}
              value={role} onChange={(e) => {setRole(e.target.value); setIdentifier('');}}>
              <option value="">Pilih daftar sebagai</option>
              <option value="admin">Admin/Guru</option>
              <option value="siswa">Siswa</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '50px', marginBottom: '20px', backgroundColor: '#FFFFFF', borderRadius: '5px' }}>
            <input type="text" placeholder="Nama Lengkap" style={{ width: '100%', height: '100%', padding: '10px', border: 'none', borderRadius: '5px', textAlign: 'left', fontFamily: 'serif', fontSize: '16px' }}
              value={nama} onChange={(e) => setNama(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '50px', marginBottom: '20px', backgroundColor: '#FFFFFF', borderRadius: '5px' }}>
            <input type="text"
              placeholder={role === 'admin'? 'NIP' : role === 'siswa'? 'NIS' : 'NIS / NIP'}
              style={{ width: '100%', height: '100%', padding: '10px', border: 'none', borderRadius: '5px', textAlign: 'left', fontFamily: 'serif', fontSize: '16px' }}
              value={identifier} onChange={(e) => setIdentifier(e.target.value)} disabled={!role} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '50px', backgroundColor: '#F7F7F7', borderRadius: '5px', marginBottom: '20px' }}>
            <input type="password" placeholder="Password" style={{ width: '100%', height: '100%', padding: '10px', border: 'none', borderRadius: '5px', backgroundColor: '#F7F7F7', textAlign: 'left', fontFamily: 'serif', fontSize: '16px' }}
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button style={{ width: '40%', height: '30px', backgroundColor: '#0b8f3eff', color: '#fafafaff', border: 'none', borderRadius: '15px', cursor: 'pointer', marginTop: '0px', fontFamily: 'serif', fontSize: '15px' }}
            onClick={handleRegister}>Daftar</button>
          <p style={{ marginTop: '10px', color: '#F7F7F7', cursor: 'pointer', fontFamily: 'serif', fontSize: '12px', fontStyle: 'italic' }} onClick={handleDaftarAkun}>Login</p>
        </div>
      </div>
    </div>
  );
};

export default DaftarPage;