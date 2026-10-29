//src/app/dashboardsiswa/page.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import HeaderBox from '../../components/HeaderBox';

const tahunAjaranList = ["2024/2025", "2025/2026", "2026/2027"];

const IconDoc = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconFile = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);
const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const formatTanggal = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export default function Dashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState("");
  const [filterTahun, setFilterTahun] = useState("");
  const [namaUser, setNamaUser] = useState("");
  const [allowUpload, setAllowUpload] = useState(true);
  const [showUploadWarning, setShowUploadWarning] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      setNamaUser(decoded?.nama || "");
    }
    fetch('/api/settings')
    .then(res => res.json())
    .then(data => setAllowUpload(!!data.allow_upload));
  }, []);

  const fetchDocs = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('/api/save-document?scope=all', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  .then(res => res.json())
  .then(json => setDocs(json.data || []))
  .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleNav = (key) => {
    setActivePage(key);
    if (key === "dokumen") router.push('/dokumensiswa');
    if (key === "profil") router.push('/profil');
    if (key === "logout") {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/');
    }
  };

  const handleCreateClick = () => {
    if (!allowUpload) {
      setShowUploadWarning(true);
      setTimeout(() => setShowUploadWarning(false), 4000);
    } else {
      router.push('/create');
    }
  };

  const filtered = docs.filter(d => {
    const matchTahun = filterTahun? d.tahun_ajaran === filterTahun : true;
    const keyword = search.toLowerCase();
    const matchSearch =!keyword || [d.nis, d.nama_peneliti, d.judul, d.tahun_ajaran]
  .some(val => String(val || '').toLowerCase().includes(keyword));
    return matchTahun && matchSearch;
  });

  const navItems = [
    { key:"dashboard", icon:<IconGrid />, label:"Dashboard" },
    { key:"dokumen", icon:<IconDoc />, label:"Dokumen" },
    { key:"profil", icon:<IconUser />, label:"Profil" },
    { key:"logout", icon:<IconLogout />, label:"Logout"}
  ];

  const tdStyle = {
    padding: "11px 16px",
    fontSize: "11.5px",
    borderBottom: "1px solid #edf5ec",
    textAlign: "center",
    fontFamily: "serif",
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"#f2f7f1", fontFamily:"sans-serif", overflow:"hidden" }}>

      <HeaderBox />

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        <aside style={{ width: sidebarOpen? 220 : 62, transition:"width.25s", background:"linear-gradient(180deg,#1a3817,#2d5a27)", color:"#fff", display:"flex", flexDirection:"column", flexShrink:0, overflow:"hidden" }}>

          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 14px", minHeight:68, borderBottom:"1px solid rgba(255,255,255,.1)" }}>
            <img src="/logo.png" alt="Logo" style={{ width:36, height:36, borderRadius:"10px", objectFit:"contain", flexShrink:0 }} />
            {sidebarOpen && (
              <div style={{
                flex: 1,
                minWidth: 0,
                overflow: 'hidden'
              }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: 14,
                  lineHeight: 1.2,
                  color: "#fff",
                  fontFamily: 'serif',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                  maxHeight: '2.4em',
                  overflow: 'hidden'
                }}>
                  {namaUser || "Loading..."}
                </div>
              </div>
            )}
          </div>
          <div style={{ padding:"10px 14px", borderBottom:"1px solid rgba(255,255,255,.1)" }}>
            <button onClick={() => setSidebarOpen(p =>!p)}
              style={{ background:"none", border:"none", cursor:"pointer", color:"#fff", display:"flex", padding:4 }}>
              <IconMenu />
            </button>
          </div>

          {navItems.map(item => (
            <button key={item.key} onClick={() => handleNav(item.key)}
              style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 16px", color: activePage===item.key? "#fff" : "#b8d9b3", background: activePage===item.key? "rgba(255,255,255,.18)" : "transparent", border:"none", borderLeft: activePage===item.key? "3px solid #a8d5a2" : "3px solid transparent", cursor:"pointer", width:"100%", fontSize:13.5, fontWeight: activePage===item.key? 600 : 400, justifyContent: sidebarOpen? "flex-start" : "center" }}>
              <span style={{ flexShrink:0 }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </aside>

        <main style={{ flex:1, overflowY:"auto", padding:"26px 28px" }}>

          <div style={{ display:"flex", gap:18, marginBottom:26, flexWrap:"wrap" }}>
            <div style={{ flex:"1 1 180px", background:"linear-gradient(135deg,#2d5a27,#1a3817)", borderRadius:14, padding:"20px 22px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 4px 20px rgba(0,0,0,.12)" }}>
              <div>
                <div style={{ fontSize:38, fontWeight:700, color:"#fff" }}>{docs.length}</div>
                <div style={{ fontSize:12.5, color:"#a8d5a2", marginTop:4 }}>Total Dokumen</div>
              </div>
              <div style={{ fontSize:44, opacity:.2 }}>📄</div>
            </div>

            <button onClick={handleCreateClick}
              style={{ flex:"1 1 180px", background: allowUpload? "linear-gradient(135deg,#4a7c42,#2d5a27)" : "#ccc", borderRadius:14, padding:"20px 22px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 4px 20px rgba(0,0,0,.12)", border:"none", cursor: allowUpload? "pointer" : "not-allowed", opacity: allowUpload? 1 : 0.6 }}>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:14, fontWeight:600, color:"#fff" }}>Tambah Dokumen</div>
                <div style={{ fontSize:12, color:"#c8e6c3", marginTop:4 }}>
                  {allowUpload? "Unggah dokumen baru" : "Upload ditutup"}
                </div>
              </div>
              <div style={{ width:42, height:42, borderRadius:"50%", background:"rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                <IconPlus />
              </div>
            </button>
          </div>

          {showUploadWarning && (
            <div style={{
              background:"#fdecea",
              border:"1px solid #f5c6cb",
              borderRadius:8,
              padding:"12px 16px",
              marginBottom:16,
              display:"flex",
              alignItems:"center",
              gap:10,
              fontSize:13,
              color:"#721c24"
            }}>
              <IconAlert />
              <span style={{ fontWeight:600 }}>Waktu upload dokumen belum dibuka atau sudah ditutup</span>
            </div>
          )}

          <div style={{ display:"flex", justifyContent:"space-between", gap:12, marginBottom:16, flexWrap:"wrap" }}>
            <div style={{ background:"#fff", padding:"10px 14px", borderRadius:8, boxShadow:"0 1px 4px rgba(0,0,0,.08)", display:"flex", alignItems:"center", gap:8 }}>
              <label style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap" }}>Tahun Ajaran:</label>
              <select value={filterTahun} onChange={e => setFilterTahun(e.target.value)}
                style={{ padding:"5px 10px", borderRadius:4, border:"1px solid #ccc", fontSize:13 }}>
                <option value="">Semua</option>
                {tahunAjaranList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ background:"#fff", padding:"10px 14px", borderRadius:8, boxShadow:"0 1px 4px rgba(0,0,0,.08)", display:"flex", alignItems:"center", gap:8 }}>
              <IconSearch />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama, judul, NIS..."
                style={{ border:"none", outline:"none", fontSize:13, width:220 }} />
            </div>
          </div>

          <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 4px 24px rgba(0,0,0,.07)", overflow:"hidden" }}>
            <div style={{ padding:"18px 22px 14px" }}>
              <h2 style={{ margin:0, fontSize:27, color:"#1a2e1a", fontWeight:700, fontFamily: "'Georgia', serif" }}>Karya Ilmiah</h2>
              <p style={{ margin:"3px 0 0", fontSize:13, color:"#8aab84" }}>5 data terbaru</p>
            </div>

            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    {["No","NIS","Nama","Judul Karya Ilmiah","Tahun Ajaran","Tgl. Unggah","File"].map(h => (
                      <th key={h} style={{ background:"#f0f7ee", color:"#2d5a27", fontSize:11, fontWeight:700, textTransform:"uppercase", padding:"11px 16px", textAlign:"center", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0? (
                    <tr>
                      <td colSpan={7} style={{ padding:"36px", textAlign:"center", color:"#aaa" }}>Dokumen tidak ditemukan</td>
                    </tr>
                  ) : filtered.slice(0, 5).map((row, i) => (
                    <tr key={row.id} style={{ background: i%2===0? "#fff" : "#f8fcf7" }}>
                      <td style={tdStyle}>{i+1}</td>
                      <td style={tdStyle}>{row.nis}</td>
                      <td style={tdStyle}>{row.nama_peneliti}</td>
                      <td style={tdStyle}>{row.judul}</td>
                      <td style={tdStyle}>{row.tahun_ajaran}</td>
                      <td style={{...tdStyle, whiteSpace:"nowrap" }}>{formatTanggal(row.tanggal_upload)}</td>
                      <td style={tdStyle}>
                        {row.file_url? (
                          <a href={`/lampiran?url=${encodeURIComponent(row.file_url)}`} target="_blank" rel="noreferrer"
                            style={{ background:"#e8f5e2", color:"#2d5a27", borderRadius:7, padding:"6px 8px", display:"inline-flex", alignItems:"center" }}>
                            <IconFile />
                          </a>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 22px", borderTop:"1px solid #edf5ec", background:"#fafdf9" }}>
              <span style={{ fontSize:13, color:"#7a9b74" }}>
                Menampilkan {Math.min(5, filtered.length)} dari {filtered.length} dokumen
              </span>
              <button onClick={() => router.push('/dokumensiswa')}
                style={{ background:"#2d5a27", color:"#fff", border:"none", borderRadius:8, padding:"7px 16px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                Lihat Semua →
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}