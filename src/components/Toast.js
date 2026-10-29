// src/components/Toast.js
export function showToast(setToast, message, type = 'success') {
  setToast({ show: true, message, type });
  setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2800);
}

export default function Toast({ toast }) {
  if (!toast?.show) return null;

  const isSuccess = toast.type === 'success';
  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 99999,
      background: isSuccess ? '#cacaca' : '#c0392b',
      color: '#767474',
      padding: '18px 32px', // <-- Gedein padding: atas-bawah 18px, kiri-kanan 32px
      borderRadius: '12px', // <-- Radius dibikin lebih bulet dikit
      boxShadow: '0 6px 20px rgba(0,0,0,0.2)', // <-- Shadow lebih tebel
      fontSize: '18px', // <-- Font digedein dari 16px jadi 18px
      fontFamily: 'serif',
      display: 'flex',
      alignItems: 'center',
      gap: '24px', // <-- Jarak icon ke teks dibesarin
      animation: 'toastIn 0.3s ease',
      minWidth: '320px', // <-- Lebar minimal digedein dari 220px
      maxWidth: '500px', // <-- Lebar maksimal digedein dari 380px
    }}>
      <span style={{ fontSize: '24px' }}>{isSuccess ? '✅' : '❌'}</span> {/* Icon digedein */}
      <span style={{ lineHeight: '1.4' }}>{toast.message}</span> {/* Line height biar nggak dempet */}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}