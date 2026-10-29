// src/app/lampiran/page.js
'use client';
import Head from 'next/head';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import HeaderBox from '../../components/HeaderBox';
import Toast, { showToast } from '../../components/Toast';

function LampiranContent() {
  const searchParams = useSearchParams();
  const fileUrl = searchParams.get('url');
  const [allowDownload, setAllowDownload] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setAllowDownload(!!data.allow_download));

    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setIsAdmin(payload?.role === 'admin');
    }
  }, []);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/\/d\/(.*?)\//);
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
    return url;
  };

  const getDownloadUrl = (url) => {
    if (!url) return null;
    const match = url.match(/\/d\/(.*?)\//);
    if (match) return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    return url;
  };

  const showDownloadBtn = isAdmin || allowDownload;

  // ✅ Handler download dengan notifikasi
  const handleDownload = (e) => {
    e.preventDefault();
    const url = getDownloadUrl(fileUrl);
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast(setToast, 'Dokumen berhasil diunduh!', 'success');
  };

  return (
    <>
      <Toast toast={toast} />
      <div className="absolute top-[calc(1.3rem+1.6cm)] left-1/2 -translate-x-1/2 bg-[#E9F3EB] p-5 rounded shadow-md w-[1460px] min-h-[600px]">
        {fileUrl ? (
          <>
            <iframe
              src={getEmbedUrl(fileUrl)}
              width="100%"
              height="600px"
              style={{ border: 'none', borderRadius: '6px' }}
              sandbox="allow-scripts allow-same-origin"
              referrerPolicy="no-referrer"
              allow="autoplay"
            />
            {showDownloadBtn && (
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <a
                  href={getDownloadUrl(fileUrl)}
                  onClick={handleDownload}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '10px 24px',
                    background: '#2d5a27',
                    color: '#fff',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Download PDF
                </a>
              </div>
            )}
          </>
        ) : (
          <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>
            Dokumen tidak ditemukan.
          </p>
        )}
      </div>
    </>
  );
}

function LampiranPage() {
  return (
    <div>
      <Head><title>Lampiran Dokumen</title></Head>
      <HeaderBox />
      <Suspense fallback={<div>Loading...</div>}>
        <LampiranContent />
      </Suspense>
    </div>
  );
}

export default LampiranPage;