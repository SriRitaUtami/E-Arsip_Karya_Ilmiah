//src/app/page.js
'use client';
import React, { useState, useEffect } from 'react';
import HeaderBox from '../components/HeaderBox';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';

const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const HomePage = () => {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [nama, setNama] = useState('');
  const [identifier, setIdentifier] = useState(''); // NIS atau NIP
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Kalo udah login, langsung lempar ke dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = token && decodeToken(token);
    if (user) {
      if (user.role === 'admin') router.push('/dashboard');
      else router.push('/dashboardsiswa');
    }
  }, [router]);

  const handleDaftarAkun = () => {
    router.push('/daftar');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: role.toLowerCase(),
          nama,
          identifier,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      if (data.user.role === 'admin') {
        router.push('/dashboard');
      } else if (data.user.role === 'siswa') {
        router.push('/dashboardsiswa');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8fcf7] min-h-screen flex flex-col">
      <Head>
        <title>E-ARSIP KARYA ILMIAH</title>
        <meta name="description" content="Sistem E-Arsip Karya Ilmiah" />
      </Head>

      <HeaderBox />

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '8vh' }}>

        <img src="/logo.png" alt="Gambar" style={{ width: '5%', height: 'auto', marginBottom: '30px' }} />

        <div style={{ width: '30%', padding: '20px', border: '1px solid #0A3F08', borderRadius: '5px', backgroundColor: '#0A3F08', fontFamily: 'serif' }}>
          <form onSubmit={handleLogin}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '50px', marginBottom: '20px', backgroundColor: '#FFFFFF', borderRadius: '5px' }}>
              <select style={{ width: '100%', height: '100%', padding: '10px', border: 'none', borderRadius: '5px', textAlign: 'left', fontFamily: 'Arial', fontSize: '16px' }}
                value={role} onChange={(e) => {setRole(e.target.value); setIdentifier('');}} required>
                <option value="">Pilih login sebagai</option>
                <option value="admin">Admin</option>
                <option value="siswa">Siswa</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '50px', marginBottom: '20px', backgroundColor: '#FFFFFF', borderRadius: '5px' }}>
              <input type="text" placeholder="Nama Lengkap" style={{ width: '100%', height: '100%', padding: '10px', border: 'none', borderRadius: '5px', textAlign: 'left', fontFamily: 'serif', fontSize: '16px' }}
                value={nama} onChange={(e) => setNama(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '50px', marginBottom: '20px', backgroundColor: '#FFFFFF', borderRadius: '5px' }}>
              <input type="text"
                placeholder={role === 'admin'? 'NIP' : role === 'siswa'? 'NIS' : 'NIS / NIP'}
                style={{ width: '100%', height: '100%', padding: '10px', border: 'none', borderRadius: '5px', textAlign: 'left', fontFamily: 'serif', fontSize: '16px' }}
                value={identifier} onChange={(e) => setIdentifier(e.target.value)} required disabled={!role} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '50px', backgroundColor: '#F7F7F7', borderRadius: '5px', marginBottom: '20px' }}>
              <input type="password" placeholder="Password" style={{ width: '100%', height: '100%', padding: '10px', border: 'none', borderRadius: '5px', backgroundColor: '#F7F7F7', textAlign: 'left', fontFamily: 'serif', fontSize: '16px' }}
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p style={{ color: 'red', marginBottom: '10px', textAlign:'center' }}>{error}</p>}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button type="submit" disabled={loading} style={{ width: '40%', height: '30px', backgroundColor: loading? '#666' : '#0b8f3eff', color: '#fafafaff', border: 'none', borderRadius: '15px', cursor: loading? 'not-allowed' : 'pointer', marginTop: '0px', fontFamily: 'serif', fontSize: '15px' }}>
                {loading? 'Loading...' : 'Login'}
              </button>
            </div>
          </form>
          <p style={{ marginTop: '10px', color: '#F7F7F7', cursor: 'pointer', fontFamily: 'serif', fontSize: '12px', fontStyle: 'italic', textAlign: 'center' }} onClick={handleDaftarAkun}>
            Belum mempunyai akun?
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;