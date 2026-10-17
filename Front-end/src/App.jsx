import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Banknote,
  BarChart3, Bell, CalendarDays, Camera, Check, CheckCircle2, ChevronDown,
  ChevronRight, Clock3, CreditCard, FileText, Filter, ImagePlus, LayoutDashboard,
  LogOut, Menu, MoreHorizontal, Plus, Printer, Search, Settings2, ShieldCheck,
  ShoppingBag, SlidersHorizontal, Sparkles, Store, UserRound, Users, Wallet,
  X,
} from 'lucide-react';
import { api, assetUrl, imageCredentials } from './services/api.js';

const demoUsers = [
  { username: 'owner', name: 'Ariani Putri', role: 'owner', title: 'Owner' },
  { username: 'kasir1', name: 'Nadia Safitri', role: 'kasir', title: 'Kasir 1' },
  { username: 'kasir2', name: 'Raka Pratama', role: 'kasir', title: 'Kasir 2' },
];

const currentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};
const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
}).format(Number(amount) || 0);
const formatDate = (value = new Date()) => new Intl.DateTimeFormat('id-ID', {
  day: '2-digit', month: 'short', year: 'numeric',
}).format(new Date(value));
const calcEndTime = (start, minutes) => {
  if (!start || !minutes) return '';
  const [hours, mins] = start.split(':').map(Number);
  const total = (hours * 60 + mins + Number(minutes)) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};
const normalizeWhatsapp = (input) => {
  const digits = input.replace(/\D/g, '');
  if (!/^(?:\+?62|08)\d{7,13}$/.test(input)) return null;
  return digits.startsWith('62') ? `0${digits.slice(2)}` : digits;
};

function CameraArtwork({ tone = 'pink', image, large = false }) {
  if (image) return <img className={`camera-art camera-art-${tone} ${large ? 'camera-art-large' : ''}`} src={assetUrl(image)} crossOrigin={imageCredentials} alt="" />;
  return (
    <div className={`camera-art camera-art-${tone} ${large ? 'camera-art-large' : ''}`}>
      <div className="camera-glow" />
      <svg viewBox="0 0 220 135" role="img" aria-label="Ilustrasi kamera">
        <ellipse cx="112" cy="112" rx="78" ry="10" fill="rgba(48, 31, 37, .10)" />
        <path d="M41 48h31l10-14h54l10 14h26a9 9 0 0 1 9 9v45a10 10 0 0 1-10 10H48a10 10 0 0 1-10-10V58a10 10 0 0 1 3-10Z" fill="#f8f7f5" stroke="#d5d1d1" strokeWidth="2" />
        <path d="M41 58h140v42a10 10 0 0 1-10 10H48a10 10 0 0 1-10-10V58Z" fill="#e9e6e4" />
        <path d="M43 49h25v5H43zM150 43h15v4h-15z" fill="#aaa4a4" />
        <circle cx="111" cy="77" r="29" fill="#555358" stroke="#c4bebe" strokeWidth="5" />
        <circle cx="111" cy="77" r="20" fill="#25272e" />
        <circle cx="105" cy="71" r="10" fill="#5e7180" />
        <circle cx="102" cy="68" r="4" fill="#c1dce8" opacity=".8" />
        <rect x="55" y="59" width="18" height="5" rx="2.5" fill="#d4cfd0" />
        <circle cx="163" cy="58" r="4" fill="#f08b9e" />
        <rect x="51" y="93" width="19" height="3" rx="1.5" fill="#cac5c5" />
      </svg>
      <span className="camera-art-caption">EVARTI CAMERA</span>
    </div>
  );
}

function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`}>
      <div className="brand-mark"><Camera size={19} strokeWidth={1.8} /></div>
      {!compact && <div><div className="brand-name">evarti<span>.</span></div><div className="brand-tagline">WEAVING STORIES INTO YOUR LIFE</div></div>}
    </div>
  );
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('owner');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onLogin(username, password);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <main className="login-page">
      <div className="login-visual">
        <div className="login-orb login-orb-one" /><div className="login-orb login-orb-two" />
        <Brand />
        <div className="login-visual-copy">
          <span className="eyebrow eyebrow-light"><Sparkles size={13} /> RENTAL STUDIO</span>
          <h1>Setiap cerita,<br /><em>punya caranya.</em></h1>
          <p>Kelola penyewaan kamera dengan mudah, dari awal sampai momen terakhir.</p>
          <div className="login-camera"><CameraArtwork large /></div>
        </div>
        <div className="login-visual-foot"><span>01 / 03</span><div className="login-progress"><i /></div><span>EVARTI RENTAL</span></div>
      </div>
      <div className="login-panel">
        <div className="login-mobile-brand"><Brand /></div>
        <div className="login-box">
          <span className="eyebrow">SELAMAT DATANG KEMBALI</span>
          <h2>Masuk ke Evarti</h2>
          <p className="login-subtitle">Gunakan akun kasir atau owner untuk melanjutkan.</p>
          <form onSubmit={submit} className="login-form">
            <label className="field-label" htmlFor="username">Username</label>
            <div className="input-icon-wrap"><UserRound size={17} /><select id="username" value={username} onChange={(event) => setUsername(event.target.value)}>
              {demoUsers.map((user) => <option key={user.username} value={user.username}>{user.title} — {user.name}</option>)}
            </select><ChevronDown size={16} className="select-chevron" /></div>
            <label className="field-label" htmlFor="password">Password</label>
            <input id="password" className="text-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan password" autoComplete="current-password" />
            {error && <div className="form-error">{error}</div>}
            <button className="button button-primary button-full login-submit" type="submit" disabled={submitting}>{submitting ? 'Memeriksa akun...' : 'Masuk ke dashboard'} <ArrowRight size={17} /></button>
          </form>
          <div className="login-hint"><ShieldCheck size={16} /><span>Akses terbatas untuk tim Evarti</span></div>
        </div>
        <div className="login-foot">© 2026 Evarti Rental Studio <span>•</span> Weaving stories into your life</div>
      </div>
    </main>
  );
}

function StatCard({ label, value, detail, icon: Icon, tone = 'pink', trend }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={18} /></div></div>
      <strong>{value}</strong>
      <div className="stat-foot">{trend && <span className="stat-trend"><ArrowUpRight size={13} /> {trend}</span>}<span>{detail}</span></div>
    </div>
  );
}

function Receipt({ transaction }) {
  if (!transaction) return null;
  const currency = (value) => formatCurrency(value).replace('IDR', 'Rp');
  return (
    <div className="receipt-paper">
      <div className="receipt-brand">evarti</div>
      <div className="receipt-tagline">Weaving stories into your life</div>
      <div className="receipt-rule" />
      <div className="receipt-row"><span>No. Struk</span><b>{transaction.receiptNo}</b></div>
      <div className="receipt-row"><span>Tanggal</span><b>{new Intl.DateTimeFormat('id-ID').format(new Date(transaction.createdAt))}</b></div>
      <div className="receipt-row"><span>Jam Mulai</span><b>{transaction.startTime}</b></div>
      <div className="receipt-row"><span>Jam Selesai</span><b>{transaction.endTime}</b></div>
      <div className="receipt-row"><span>Penyewa</span><b>{transaction.customerName || 'Nama penyewa'}</b></div>
      <div className="receipt-row"><span>No. WA</span><b>{transaction.customerWhatsapp || '08xxxxxxxxxx'}</b></div>
      {transaction.customerPagerNumber && <div className="receipt-row"><span>No. Pager</span><b>{transaction.customerPagerNumber}</b></div>}
      <div className="receipt-rule" />
      <div className="receipt-row"><span>Kamera</span><b>{transaction.cameraName || 'Pilih kamera'}</b></div>
      <div className="receipt-row"><span>Durasi</span><b>{transaction.durationLabel}</b></div>
      <div className="receipt-row"><span>Harga</span><b>{transaction.isManualPrice ? 'Tarif Manual' : currency(transaction.total)}</b></div>
      <div className="receipt-rule" />
      <div className="receipt-row receipt-total"><span>TOTAL</span><b>{currency(transaction.total)}</b></div>
      <div className="receipt-row"><span>Bayar</span><b>{transaction.paymentMethod === 'qris_dana' ? 'QRIS DANA' : 'Tunai'}</b></div>
      {transaction.paymentMethod === 'cash' && <>
        <div className="receipt-row"><span>Diterima</span><b>{currency(transaction.amountReceived)}</b></div>
        <div className="receipt-row"><span>Kembali</span><b>{currency(transaction.change)}</b></div>
      </>}
      <div className="receipt-rule" />
      <div className="receipt-terms">Keterlambatan dikenakan denda.<br />Kerusakan/kehilangan menjadi<br />tanggung jawab penyewa.</div>
      <div className="receipt-rule" />
      <div className="receipt-social">TikTok &amp; IG: @evartistore</div>
      <div className="receipt-thanks">Terima kasih!</div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [appError, setAppError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [reportCashier, setReportCashier] = useState('all');
  const [reportLocation, setReportLocation] = useState('all');
  const [page, setPage] = useState('dashboard');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState('');
  const [savedTransaction, setSavedTransaction] = useState(null);
  const [catalogDraft, setCatalogDraft] = useState(null);
  const [historySearch, setHistorySearch] = useState('');
  const [historyLocation, setHistoryLocation] = useState('all');
  const [historyCashier, setHistoryCashier] = useState('all');
  const [historyDate, setHistoryDate] = useState('');
  const printTimer = useRef(null);

  const refreshWorkspace = useCallback(async () => {
    setWorkspaceLoading(true);
    setAppError('');
    try {
      const [cameraResult, transactionResult] = await Promise.all([
        api.cameras(),
        api.transactions({ limit: 100 }),
      ]);
      setCameras(cameraResult.cameras);
      setTransactions(transactionResult.transactions);
    } catch (error) {
      if (error.status !== 401) setAppError(error.message);
    } finally {
      setWorkspaceLoading(false);
    }
  }, []);

  useEffect(() => {
    const unauthorized = () => {
      setUser(null);
      setCameras([]);
      setTransactions([]);
      setPage('dashboard');
    };
    window.addEventListener('evarti:unauthorized', unauthorized);
    api.me().then(({ user: currentUser }) => {
      setUser(currentUser);
    }).catch((error) => {
      if (error.status !== 401) setAppError(error.message);
    }).finally(() => setBooting(false));
    return () => window.removeEventListener('evarti:unauthorized', unauthorized);
  }, []);

  useEffect(() => {
    if (!user) {
      setCameras([]);
      setTransactions([]);
      return;
    }
    refreshWorkspace();
  }, [user, refreshWorkspace]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 3600);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => () => window.clearTimeout(printTimer.current), []);

  const login = async (username, password) => {
    const result = await api.login(username, password);
    setAppError('');
    setUser(result.user);
    setPage('dashboard');
  };
  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      setNotice(error.message);
    } finally {
      setUser(null);
      setCameras([]);
      setTransactions([]);
      setPage('dashboard');
    }
  };
  const isOwner = user?.role === 'owner';
  const visibleCameras = cameras.filter((camera) => camera.active);
  const visibleTransactions = transactions.filter((transaction) => (
    isOwner || transaction.cashierId === user?.username
  ));
  const todayTransactions = visibleTransactions.filter((transaction) => transaction.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10));
  const paidToday = todayTransactions.filter((transaction) => transaction.paymentStatus === 'paid');
  const revenueToday = paidToday.reduce((sum, transaction) => sum + Number(transaction.total), 0);

  const openPrint = async (transaction) => {
    try {
      if (transaction.paymentStatus !== 'paid') {
        setNotice('Struk hanya dapat dicetak setelah pembayaran lunas.');
        return;
      }
      const result = await api.markPrinted(transaction.id);
      setSavedTransaction(result.transaction);
      setTransactions((previous) => previous.map((item) => item.id === transaction.id ? result.transaction : item));
      setPage('print');
      printTimer.current = window.setTimeout(() => window.print(), 220);
    } catch (error) {
      setNotice(error.message);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create', label: 'Buat struk', icon: Plus },
    { id: 'history', label: 'Riwayat transaksi', icon: FileText, count: visibleTransactions.length },
    ...(isOwner ? [{ id: 'catalog', label: 'Katalog kamera', icon: Camera }] : []),
    ...(isOwner ? [{ id: 'reports', label: 'Laporan', icon: BarChart3 }] : []),
  ];

  if (booting) return <main className="login-page"><div className="login-panel"><div className="login-box"><span className="eyebrow">EVARTI RENTAL STUDIO</span><h2>Memeriksa sesi...</h2><p className="login-subtitle">Menghubungkan ke server dengan aman.</p></div></div></main>;
  if (!user) return <><Login onLogin={login} />{appError && <div className="toast"><X size={17} />{appError}</div>}</>;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand"><Brand /><button className="icon-button mobile-close" onClick={() => setMobileMenu(false)} aria-label="Tutup menu"><X size={19} /></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="sidebar-nav">
          {navItems.map(({ id, label, icon: Icon, count }) => (
            <button className={`nav-item ${page === id ? 'nav-active' : ''}`} key={id} onClick={() => { setPage(id); setMobileMenu(false); }}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{count > 0 && id === 'history' && <small>{count}</small>}
              {page === id && <ChevronRight className="nav-chevron" size={16} />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="side-note"><div className="side-note-icon"><Sparkles size={16} /></div><strong>Keep the moments</strong><p>Setiap momen punya cerita. Terima kasih sudah jadi bagian darinya.</p><span>EVARTI · 2026</span></div>
          <button className="nav-item nav-logout" onClick={logout}><LogOut size={18} /><span>Keluar akun</span></button>
          <div className="profile-row"><div className="avatar">{user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><div className="profile-meta"><strong>{user.name}</strong><span>{user.title}</span></div><MoreHorizontal size={18} className="profile-more" /></div>
        </div>
      </aside>
      {mobileMenu && <button className="sidebar-backdrop" aria-label="Tutup menu" onClick={() => setMobileMenu(false)} />}
      <main className="main-panel">
        <header className="topbar">
          <button className="icon-button mobile-menu-button" aria-label="Buka menu" onClick={() => setMobileMenu(true)}><Menu size={20} /></button>
          <div className="breadcrumb"><span>Evarti Studio</span><ChevronRight size={15} /><strong>{navItems.find((item) => item.id === page)?.label || 'Struk'}</strong></div>
          <div className="topbar-actions"><span className="topbar-date"><CalendarDays size={15} /> {formatDate()}</span><button className="icon-button notification-button" aria-label="Notifikasi"><Bell size={18} /><i /></button><div className="topbar-avatar">{user.name.slice(0, 1)}</div></div>
        </header>
        <div className="page-content">
          {appError && <div className="error-banner"><X size={16} />{appError}<button onClick={refreshWorkspace}>Coba lagi</button></div>}
          {workspaceLoading && <div className="loading-banner"><span className="loading-spinner" /> Memuat data terbaru dari server...</div>}
          {page === 'dashboard' && <Dashboard
            user={user} transactions={visibleTransactions} todayTransactions={todayTransactions}
            revenueToday={revenueToday} onNavigate={setPage} onPrint={openPrint}
          />}
          {page === 'create' && <CreateTransaction
            user={user} cameras={visibleCameras} onSave={(transaction) => {
              return api.createTransaction(transaction.payload, transaction.guaranteePhoto).then(({ transaction: saved }) => {
                setTransactions((previous) => [saved, ...previous.filter((item) => item.id !== saved.id)]);
                setSavedTransaction(saved);
                setNotice(saved.paymentStatus === 'pending_verification' ? 'Transaksi tersimpan · menunggu verifikasi QRIS' : 'Struk berhasil disimpan');
                return saved;
              });
            }} onVerify={async (transaction) => {
              const { transaction: updated } = await api.verifyTransaction(transaction.id);
              setTransactions((previous) => previous.map((item) => item.id === updated.id ? updated : item));
              setSavedTransaction(updated);
              return updated;
            }} notice={notice} onNotice={setNotice} onPrint={openPrint} savedTransaction={savedTransaction}
          />}
          {page === 'history' && <History
            transactions={visibleTransactions} isOwner={isOwner} search={historySearch}
            setSearch={setHistorySearch} location={historyLocation} setLocation={setHistoryLocation}
            cashier={historyCashier} setCashier={setHistoryCashier} date={historyDate} setDate={setHistoryDate}
            onPrint={openPrint} onVoid={async (transaction) => {
              const reason = window.prompt(`Alasan membatalkan ${transaction.receiptNo}:`);
              if (reason == null) return;
              try {
                const { transaction: updated } = await api.voidTransaction(transaction.id, reason);
                setTransactions((previous) => previous.map((item) => item.id === updated.id ? updated : item));
                setNotice(`${updated.receiptNo} berhasil dibatalkan.`);
              } catch (error) {
                setNotice(error.message);
              }
            }}
          />}
          {page === 'catalog' && isOwner && <Catalog
            cameras={cameras} draft={catalogDraft} setDraft={setCatalogDraft}
            onCreate={async (camera, image) => {
              const { camera: created } = await api.createCamera(camera);
              if (image) await api.uploadCameraImage(created.id, image);
              await refreshWorkspace();
              setNotice('Kamera berhasil ditambahkan ke katalog.');
            }}
            onUpdate={async (id, camera, image) => {
              await api.updateCamera(id, camera);
              if (image) await api.uploadCameraImage(id, image);
              await refreshWorkspace();
              setNotice('Perubahan kamera berhasil disimpan.');
            }}
            onToggle={async (id, active) => {
              await api.toggleCamera(id, active);
              await refreshWorkspace();
              setNotice(active ? 'Kamera kembali aktif di katalog.' : 'Kamera dinonaktifkan dari katalog kasir.');
            }}
            onNotice={setNotice}
          />}
          {page === 'reports' && isOwner && <Reports
            report={report} loading={reportLoading} error={reportError}
            date={reportDate} setDate={setReportDate}
            cashier={reportCashier} setCashier={setReportCashier}
            location={reportLocation} setLocation={setReportLocation}
            onLoad={async () => {
              setReportLoading(true);
              setReportError('');
              try {
                const nextReport = await api.reportSummary({
                  date: reportDate,
                  cashier: reportCashier,
                  location: reportLocation,
                });
                setReport(nextReport);
              } catch (error) {
                setReportError(error.message);
              } finally {
                setReportLoading(false);
              }
            }}
            onExport={async () => {
              try {
                const blob = await api.reportPdf({
                  date: reportDate,
                  cashier: reportCashier,
                  location: reportLocation,
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'evarti-ringkasan-transaksi.pdf';
                link.click();
                URL.revokeObjectURL(url);
              } catch (error) {
                setReportError(error.message);
              }
            }}
          />}
          {page === 'print' && savedTransaction && <PrintView transaction={savedTransaction} onBack={() => setPage('create')} onPrint={() => openPrint(savedTransaction)} />}
        </div>
      </main>
      {notice && page !== 'create' && <div className="toast"><CheckCircle2 size={17} />{notice}<button onClick={() => setNotice('')} aria-label="Tutup"><X size={15} /></button></div>}
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function Dashboard({ user, transactions, todayTransactions, revenueToday, onNavigate, onPrint }) {
  const todayPaid = todayTransactions.filter((transaction) => transaction.paymentStatus === 'paid');
  const newest = [...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const popular = Object.values(todayPaid.reduce((all, transaction) => {
    all[transaction.cameraName] = (all[transaction.cameraName] || 0) + 1;
    return all;
  }, {})).length;
  return (
    <>
      <PageHeading eyebrow={`SELAMAT PAGI, ${user.name.split(' ')[0].toUpperCase()}`} title="Ruang cerita hari ini." description="Semua yang perlu kamu tahu, dalam satu tempat." action={<button className="button button-primary" onClick={() => onNavigate('create')}><Plus size={17} /> Buat struk baru</button>} />
      <section className="welcome-card">
        <div className="welcome-copy"><div className="welcome-label"><span className="welcome-dot" /> HARI INI · {formatDate()}</div><h2>Siap mengabadikan<br />cerita baru?</h2><p>Kelola penyewaan dengan mudah dan pastikan setiap momen punya awal yang manis.</p><button className="button button-light" onClick={() => onNavigate('create')}>Mulai transaksi <ArrowRight size={16} /></button></div>
        <div className="welcome-decoration"><div className="welcome-ring ring-a" /><div className="welcome-ring ring-b" /><div className="welcome-sparkle"><Sparkles size={20} /></div><div className="welcome-camera"><CameraArtwork large /></div><span className="deco-tag tag-top">little moments</span><span className="deco-tag tag-bottom">stay forever</span></div>
      </section>
      <div className="section-heading"><div><h2>Ringkasan hari ini</h2><p>Performa operasional hari ini</p></div><span className="live-pill"><i /> LIVE</span></div>
      <section className="stats-grid">
        <StatCard label="Pendapatan" value={formatCurrency(revenueToday)} detail="Dari transaksi lunas hari ini" icon={Wallet} tone="pink" trend={todayPaid.length ? '+ Hari ini' : ''} />
        <StatCard label="Transaksi" value={todayTransactions.length} detail={`${todayPaid.length} lunas · ${todayTransactions.length - todayPaid.length} menunggu`} icon={ShoppingBag} tone="lavender" />
        <StatCard label="Kamera disewa" value={popular} detail="Model berbeda hari ini" icon={Camera} tone="mint" />
        <StatCard label="Menunggu verifikasi" value={todayTransactions.filter((transaction) => transaction.paymentStatus === 'pending_verification').length} detail="Pembayaran QRIS DANA" icon={Clock3} tone="peach" />
      </section>
      <section className="dashboard-lower">
        <div className="panel recent-panel">
          <div className="panel-heading"><div><h2>Transaksi terbaru</h2><p>Aktivitas penyewaan terakhir</p></div><button className="text-button" onClick={() => onNavigate('history')}>Lihat semua <ArrowRight size={15} /></button></div>
          {newest.length === 0 ? <EmptyState title="Belum ada transaksi" body="Transaksi yang dibuat akan muncul di sini." /> : <div className="table-wrap"><table><thead><tr><th>No. struk</th><th>Penyewa</th><th>Kamera</th><th>Total</th><th>Status</th><th /></tr></thead><tbody>
            {newest.map((transaction) => <tr key={transaction.id}><td><strong className="receipt-id">{transaction.receiptNo}</strong><small>{formatDate(transaction.createdAt)}</small></td><td>{transaction.customerName}<small>{transaction.location === 'cafe' ? 'Cafe' : 'Event'}</small></td><td>{transaction.cameraName}</td><td className="money-cell">{formatCurrency(transaction.total)}</td><td><StatusBadge transaction={transaction} /></td><td><button className="table-icon-button" onClick={() => onPrint(transaction)} aria-label="Cetak struk"><Printer size={16} /></button></td></tr>)}
          </tbody></table></div>}
        </div>
        <div className="panel quick-panel"><div className="panel-heading"><div><h2>Akses cepat</h2><p>Yang sering kamu butuhkan</p></div><SlidersHorizontal size={17} className="muted-icon" /></div>
          <button className="quick-link" onClick={() => onNavigate('create')}><div className="quick-icon quick-pink"><Plus size={19} /></div><span><strong>Buat struk baru</strong><small>Mulai transaksi penyewaan</small></span><ChevronRight size={17} /></button>
          <button className="quick-link" onClick={() => onNavigate('history')}><div className="quick-icon quick-purple"><FileText size={18} /></div><span><strong>Riwayat transaksi</strong><small>Lihat transaksi tersimpan</small></span><ChevronRight size={17} /></button>
          {user.role === 'owner' && <button className="quick-link" onClick={() => onNavigate('catalog')}><div className="quick-icon quick-peach"><Settings2 size={18} /></div><span><strong>Kelola katalog</strong><small>Harga dan kamera</small></span><ChevronRight size={17} /></button>}
          <div className="quick-footer"><ShieldCheck size={15} /> Data transaksi hanya terlihat oleh tim berwenang</div>
        </div>
      </section>
    </>
  );
}

function StatusBadge({ transaction }) {
  if (transaction.paymentStatus === 'void') return <span className="status-badge status-void">Void</span>;
  if (transaction.paymentStatus === 'pending_verification') return <span className="status-badge status-pending"><i /> Menunggu verifikasi</span>;
  return <span className="status-badge status-paid"><Check size={12} /> Lunas</span>;
}

function EmptyState({ title, body }) {
  return <div className="empty-state"><div className="empty-icon"><FileText size={21} /></div><strong>{title}</strong><p>{body}</p></div>;
}

function CreateTransaction({ user, cameras, onSave, onVerify, onNotice, onPrint, savedTransaction }) {
  const [location, setLocation] = useState(user.username === 'kasir2' ? 'event' : 'cafe');
  const assignedLocation = user.username === 'kasir1' ? 'cafe' : user.username === 'kasir2' ? 'event' : null;
  const activeLocation = assignedLocation || location;
  const [customerName, setCustomerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [pagerNumber, setPagerNumber] = useState('');
  const [guaranteeType, setGuaranteeType] = useState('none');
  const [guaranteeId, setGuaranteeId] = useState('');
  const [guaranteeImage, setGuaranteeImage] = useState('');
  const [guaranteePhotoFile, setGuaranteePhotoFile] = useState(null);
  const [guaranteeError, setGuaranteeError] = useState('');
  const [selectedCamera, setSelectedCamera] = useState('');
  const [duration, setDuration] = useState('1');
  const [manualHours, setManualHours] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [startTime, setStartTime] = useState(currentTime);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [errors, setErrors] = useState({});
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [savedHere, setSavedHere] = useState(false);
  const selected = cameras.find((camera) => camera.id === selectedCamera);
  const durationMinutes = duration === 'manual' ? Number(manualHours || 0) * 60 + Number(manualMinutes || 0) : Number(duration) * 60;
  const endTime = calcEndTime(startTime, durationMinutes);
  const total = duration === 'manual' ? Number(manualPrice) || 0 : Number(selected?.prices?.[duration]) || 0;
  const normalizedWhatsapp = normalizeWhatsapp(whatsapp);
  const change = Math.max(0, Number(amountReceived) - total);
  const preview = activeTransaction || {
    receiptNo: `${activeLocation === 'event' ? 'EVT' : 'CAF'}-YYYYMMDD-000`,
    createdAt: new Date().toISOString(),
    startTime,
    endTime,
    customerName,
    customerWhatsapp: normalizedWhatsapp || whatsapp || '',
    customerPagerNumber: pagerNumber.trim(),
    cameraName: selected?.name || '',
    durationLabel: duration === 'manual' ? `${manualHours || 0} jam ${manualMinutes || 0} mnt` : `${duration} Jam`,
    total,
    isManualPrice: duration === 'manual',
    paymentMethod,
    amountReceived: Number(amountReceived) || 0,
    change,
  };
  const needsVerification = activeTransaction?.paymentStatus === 'pending_verification';
  const isSavedPaid = activeTransaction?.paymentStatus === 'paid';

  useEffect(() => {
    setSavedHere(false);
    setActiveTransaction(null);
  }, [activeLocation, customerName, whatsapp, pagerNumber, guaranteeType, guaranteeId, guaranteeImage, guaranteePhotoFile, selectedCamera, duration, manualHours, manualMinutes, manualPrice, manualNote, startTime, paymentMethod, amountReceived]);

  const fieldError = (name, message) => <div className="field-error">{message || errors[name]}</div>;
  const validate = () => {
    const nextErrors = {};
    if (!customerName.trim()) nextErrors.customerName = 'Nama penyewa wajib diisi.';
    if (!whatsapp.trim()) nextErrors.whatsapp = 'No. WhatsApp wajib diisi.';
    else if (!normalizedWhatsapp) nextErrors.whatsapp = 'Format nomor tidak valid. Gunakan 08, 62, atau +62 (9–15 digit).';
    if (!selected) nextErrors.camera = 'Pilih kamera yang akan disewa.';
    if (duration === 'manual' && (
      !Number.isInteger(Number(manualHours || 0)) || Number(manualHours || 0) < 0 ||
      !Number.isInteger(Number(manualMinutes || 0)) || Number(manualMinutes || 0) < 0 ||
      Number(manualMinutes || 0) > 59 || durationMinutes <= 120
    )) nextErrors.manualDuration = 'Isi durasi lebih dari 2 jam. Jam harus bilangan bulat dan menit antara 0–59.';
    if (duration === 'manual' && !(Number(manualPrice) > 0)) nextErrors.manualPrice = 'Isi tarif manual lebih dari Rp 0.';
    if (!durationMinutes) nextErrors.duration = 'Pilih durasi sewa.';
    if (!startTime || !endTime || durationMinutes <= 0) nextErrors.time = 'Jam mulai dan durasi harus menghasilkan jam selesai.';
    if (paymentMethod === 'cash' && Number(amountReceived) < total) nextErrors.amountReceived = 'Uang diterima tidak boleh kurang dari total.';
    if (guaranteeType === 'id_number' && !guaranteeId.trim()) nextErrors.guaranteeId = 'Nomor ID wajib diisi jika jaminan dipilih.';
    if (guaranteeType === 'photo' && !guaranteeImage) nextErrors.guaranteeImage = 'Foto jaminan wajib diunggah.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      onNotice('Periksa kembali data transaksi yang wajib diisi.');
      return;
    }
    const payload = {
      location: activeLocation,
      customerName: customerName.trim(),
      customerWhatsapp: normalizedWhatsapp,
      customerPagerNumber: pagerNumber.trim(),
      guaranteeType,
      guaranteeIdNumber: guaranteeType === 'id_number' ? guaranteeId.trim() : null,
      cameraId: selected.id,
      durationLabel: duration === 'manual' ? `${manualHours} jam ${manualMinutes || 0} mnt` : `${duration} Jam`,
      durationMinutes,
      startTime,
      endTime,
      price: total,
      isManualPrice: duration === 'manual',
      manualNote: duration === 'manual' ? manualNote.trim() : '',
      total,
      paymentMethod,
      amountReceived: paymentMethod === 'cash' ? Number(amountReceived) : total,
    };
    try {
      const transaction = await onSave({
        payload,
        guaranteePhoto: guaranteeType === 'photo' ? guaranteePhotoFile : null,
      });
      setActiveTransaction(transaction);
      setSavedHere(true);
    } catch (error) {
      setErrors((previous) => ({ ...previous, submit: error.message }));
      onNotice(error.message);
    }
  };

  const verifyPayment = async () => {
    try {
      const updated = await onVerify(activeTransaction);
      setActiveTransaction(updated);
      setSavedHere(true);
      onNotice('Pembayaran QRIS terverifikasi. Struk siap dicetak.');
    } catch (error) {
      onNotice(error.message);
    }
  };

  const onGuaranteeUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setGuaranteeError('Format file harus JPG, PNG, atau WebP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setGuaranteeError('Ukuran foto maksimal 2 MB.');
      return;
    }
    const reader = new FileReader();
    setGuaranteePhotoFile(file);
    reader.onload = () => {
      setGuaranteeImage(String(reader.result));
      setGuaranteeError('');
    };
    reader.onerror = () => setGuaranteeError('Foto tidak dapat dibaca. Silakan pilih file lain.');
    reader.readAsDataURL(file);
  };

  return (
    <>
      <PageHeading eyebrow="TRANSAKSI BARU" title="Buat struk sewa." description="Lengkapi detail penyewaan, lalu cek pratinjau sebelum disimpan." action={<div className="secure-note"><ShieldCheck size={15} /> Data tersimpan aman</div>} />
      {savedHere && activeTransaction && <div className={`saved-banner ${needsVerification ? 'saved-pending' : ''}`}><div className="saved-banner-icon">{needsVerification ? <Clock3 size={19} /> : <CheckCircle2 size={20} />}</div><div><strong>{needsVerification ? 'Transaksi tersimpan · menunggu verifikasi' : 'Transaksi berhasil disimpan'}</strong><span>{activeTransaction.receiptNo} · {needsVerification ? 'Verifikasi pembayaran untuk membuka cetak struk.' : 'Struk siap dicetak atau bisa dicetak ulang nanti.'}</span></div>{isSavedPaid && <button className="button button-primary button-small" onClick={() => onPrint(activeTransaction)}><Printer size={15} /> Cetak struk</button>}</div>}
      <div className="transaction-layout">
        <form className="transaction-form" onSubmit={submit} noValidate>
          <section className="form-section">
            <SectionTitle number="01" title="Detail penyewaan" subtitle="Tentukan lokasi dan informasi penyewa" />
            <div className="form-grid">
              <div className="form-field full-field"><label className="field-label">Lokasi penyewaan</label>{assignedLocation ? <div className="assigned-location"><div className={`choice-icon ${activeLocation === 'cafe' ? 'choice-icon-pink' : 'choice-icon-blue'}`}>{activeLocation === 'cafe' ? <Store size={18} /> : <Sparkles size={18} />}</div><span><strong>{activeLocation === 'cafe' ? 'Cafe' : 'Event'}</strong><small>Otomatis mengikuti akun {user.title}</small></span><span className="choice-check"><Check size={12} /></span></div> : <div className="choice-row">
                <button type="button" className={`choice-card ${activeLocation === 'cafe' ? 'choice-selected' : ''}`} onClick={() => setLocation('cafe')}><div className="choice-icon choice-icon-pink"><Store size={18} /></div><span><strong>Cafe</strong><small>Penyewaan di cafe</small></span>{activeLocation === 'cafe' && <span className="choice-check"><Check size={12} /></span>}</button>
                <button type="button" className={`choice-card ${activeLocation === 'event' ? 'choice-selected' : ''}`} onClick={() => setLocation('event')}><div className="choice-icon choice-icon-blue"><Sparkles size={18} /></div><span><strong>Event</strong><small>Penyewaan di event</small></span>{activeLocation === 'event' && <span className="choice-check"><Check size={12} /></span>}</button>
              </div>}</div>
              <div className="form-field"><label className="field-label" htmlFor="customerName">Nama penyewa <span>*</span></label><input id="customerName" className={`text-input ${errors.customerName ? 'input-invalid' : ''}`} value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Contoh: Alya Putri" />{errors.customerName && fieldError('customerName')}</div>
              <div className="form-field"><label className="field-label" htmlFor="whatsapp">No. WhatsApp <span>*</span></label><div className={`phone-input ${errors.whatsapp ? 'input-invalid' : ''}`}><input id="whatsapp" value={whatsapp} onChange={(event) => { setWhatsapp(event.target.value); setErrors((previous) => ({ ...previous, whatsapp: '' })); }} placeholder="08xxxxxxxxxx atau +628..." inputMode="tel" /></div>{errors.whatsapp ? fieldError('whatsapp') : <small className="field-hint">Gunakan format 08, 62, atau +62. Nomor dinormalisasi saat disimpan.</small>}</div>
              <div className="form-field"><label className="field-label" htmlFor="pagerNumber">Nomor pager <span className="optional-tag">OPSIONAL</span></label><input id="pagerNumber" className="text-input" value={pagerNumber} onChange={(event) => setPagerNumber(event.target.value)} placeholder="Nomor pager untuk pengingat waktu sewa" maxLength={40} /></div>
              <div className="form-field full-field"><label className="field-label">Jaminan <span className="optional-tag">OPSIONAL</span></label><div className="guarantee-options">
                {[['none', 'Tidak ada'], ['photo', 'Foto'], ['id_number', 'Nomor ID']].map(([value, label]) => <button key={value} type="button" onClick={() => { setGuaranteeType(value); setGuaranteeError(''); }} className={`pill-option ${guaranteeType === value ? 'pill-option-active' : ''}`}>{guaranteeType === value && <Check size={13} />}{label}</button>)}
              </div></div>
              {guaranteeType === 'photo' && <div className="form-field full-field"><label className="field-label">Foto jaminan <span>*</span></label><label className={`upload-box ${guaranteeImage ? 'upload-has-file' : ''}`}><input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={onGuaranteeUpload} />{guaranteeImage ? <><img src={guaranteeImage} alt="Pratinjau jaminan" /><span><strong>Foto berhasil ditambahkan</strong><small>Ketuk untuk mengganti foto</small></span></> : <><ImagePlus size={22} /><span><strong>Unggah atau ambil foto</strong><small>JPG, PNG, WebP · maks. 2 MB</small></span></>}</label>{(guaranteeError || errors.guaranteeImage) && fieldError('guaranteeImage', guaranteeError || errors.guaranteeImage)}</div>}
              {guaranteeType === 'id_number' && <div className="form-field full-field"><label className="field-label" htmlFor="guaranteeId">Nomor ID <span>*</span></label><input id="guaranteeId" className={`text-input ${errors.guaranteeId ? 'input-invalid' : ''}`} value={guaranteeId} onChange={(event) => setGuaranteeId(event.target.value)} placeholder="Masukkan nomor ID" />{errors.guaranteeId && fieldError('guaranteeId')}</div>}
            </div>
            <div className="privacy-note"><ShieldCheck size={15} /><span>Data jaminan hanya dapat dilihat oleh Owner dan kasir yang membuat transaksi. Tidak dicetak di struk.</span></div>
          </section>
          <section className="form-section">
            <SectionTitle number="02" title="Pilih kamera" subtitle="Pilih kamera yang akan disewa" />
            {errors.camera && fieldError('camera')}
            {cameras.length === 0 ? <EmptyState title="Katalog belum tersedia" body="Belum ada kamera aktif di katalog." /> : <div className="camera-grid">
              {cameras.map((camera) => <button type="button" className={`camera-option ${selectedCamera === camera.id ? 'camera-option-selected' : ''}`} key={camera.id} onClick={() => setSelectedCamera(camera.id)}><div className="camera-option-visual"><CameraArtwork tone={camera.tone} image={camera.image} /><span className="camera-select-check"><Check size={13} /></span></div><div className="camera-option-info"><strong>{camera.name}</strong><span>{formatCurrency(camera.prices[1])} <small>/ jam</small></span></div></button>)}
            </div>}
          </section>
          <section className="form-section">
            <SectionTitle number="03" title="Durasi & pembayaran" subtitle="Atur waktu dan metode pembayaran" />
            <div className="duration-options">
              {[['1', '1 jam', 'Tarif katalog'], ['2', '2 jam', 'Tarif katalog'], ['manual', 'Lebih dari 2 jam', 'Tarif manual']].map(([value, title, desc]) => <button type="button" key={value} onClick={() => setDuration(value)} className={`duration-card ${duration === value ? 'duration-selected' : ''}`}><span className="duration-check">{duration === value && <Check size={12} />}</span><strong>{title}</strong><small>{desc}</small></button>)}
            </div>
            {duration === 'manual' && <div className="manual-price-panel"><div className="manual-info"><Sparkles size={16} /><span><strong>Tarif diisi manual</strong><small>Sistem tidak menghitung tarif untuk durasi di atas 2 jam.</small></span></div><div className="form-grid">
              <div className="form-field"><label className="field-label">Durasi <span>*</span></label><div className="duration-inputs"><div><input className="text-input" type="number" min="0" max="24" value={manualHours} onChange={(event) => setManualHours(event.target.value)} placeholder="3" /><span>Jam</span></div><div><input className="text-input" type="number" min="0" max="59" value={manualMinutes} onChange={(event) => setManualMinutes(event.target.value)} placeholder="00" /><span>Menit</span></div></div>{errors.manualDuration && fieldError('manualDuration')}</div>
              <div className="form-field"><label className="field-label">Tarif manual <span>*</span></label><div className="currency-input"><span>Rp</span><input className="text-input" type="number" min="1" value={manualPrice} onChange={(event) => setManualPrice(event.target.value)} placeholder="45.000" /></div>{errors.manualPrice && fieldError('manualPrice')}</div>
              <div className="form-field full-field"><label className="field-label">Catatan alasan <span className="optional-tag">OPSIONAL</span></label><input className="text-input" value={manualNote} onChange={(event) => setManualNote(event.target.value)} placeholder="Contoh: harga paket event" /></div>
            </div></div>}
            <div className="form-grid time-grid">
              <div className="form-field"><label className="field-label" htmlFor="startTime">Jam mulai <span>*</span></label><input id="startTime" className="text-input time-input" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></div>
              <div className="form-field"><label className="field-label">Jam selesai <span className="auto-tag">OTOMATIS</span></label><div className="readonly-input"><Clock3 size={16} /><strong>{endTime || '--:--'}</strong><span>{durationMinutes > 0 ? `Durasi ${Math.floor(durationMinutes / 60)}j ${durationMinutes % 60 ? `${durationMinutes % 60}m` : ''}` : 'Isi durasi'}</span></div></div>
            </div>
            {errors.time && fieldError('time')}
            <div className="form-field payment-field"><label className="field-label">Metode pembayaran <span>*</span></label><div className="payment-methods">
              <button type="button" onClick={() => setPaymentMethod('cash')} className={`payment-option ${paymentMethod === 'cash' ? 'payment-selected' : ''}`}><div className="payment-icon cash-icon"><Banknote size={19} /></div><span><strong>Tunai</strong><small>Bayar langsung</small></span>{paymentMethod === 'cash' && <CheckCircle2 size={17} className="payment-check" />}</button>
              <button type="button" onClick={() => setPaymentMethod('qris_dana')} className={`payment-option ${paymentMethod === 'qris_dana' ? 'payment-selected' : ''}`}><div className="payment-icon qris-icon"><CreditCard size={18} /></div><span><strong>QRIS DANA</strong><small>Transfer non-tunai</small></span>{paymentMethod === 'qris_dana' && <CheckCircle2 size={17} className="payment-check" />}</button>
            </div></div>
            {paymentMethod === 'cash' ? <div className="form-grid cash-grid"><div className="form-field"><label className="field-label" htmlFor="amountReceived">Uang diterima <span>*</span></label><div className={`currency-input ${errors.amountReceived ? 'input-invalid' : ''}`}><span>Rp</span><input id="amountReceived" className="text-input" type="number" min={total} value={amountReceived} onChange={(event) => setAmountReceived(event.target.value)} placeholder="0" /></div>{errors.amountReceived && fieldError('amountReceived')}</div><div className="change-card"><span>Kembali</span><strong>{formatCurrency(change)}</strong>{Number(amountReceived) > 0 && Number(amountReceived) < total && <small>Uang diterima kurang dari total.</small>}</div></div> : <div className="qris-panel"><div className="qris-symbol">D</div><div className="qris-copy"><strong>QRIS DANA Evarti</strong><span>Tampilkan QRIS statis resmi Evarti kepada penyewa, lalu verifikasi pembayaran secara manual.</span></div><div className="qris-total"><small>Total pembayaran</small><strong>{formatCurrency(total)}</strong></div></div>}
            {paymentMethod === 'qris_dana' && <div className="manual-verification-note"><ShieldCheck size={15} /> Pembayaran diverifikasi kasir secara manual setelah dana diterima.</div>}
          </section>
          <div className="form-submit-row"><span><ShieldCheck size={15} /> Pastikan semua data sudah benar.</span><button className="button button-primary button-submit" type="submit"><CheckCircle2 size={17} /> Simpan transaksi</button></div>
        </form>
        <aside className="preview-column">
          <div className="preview-sticky">
            <div className="preview-heading"><div><span className="eyebrow">LIVE PREVIEW</span><h2>Pratinjau struk</h2></div><span className="preview-live-dot"><i /> LIVE</span></div>
            <div className="receipt-location-tag">{activeLocation === 'cafe' ? 'CAF' : 'EVT'} <span>•</span> {activeLocation === 'cafe' ? 'Cafe' : 'Event'}</div>
            <Receipt transaction={preview} />
            <div className="preview-footer"><span><Printer size={14} /> Thermal receipt · 58 mm</span><span>Tinjau detail sebelum cetak</span></div>
            {needsVerification && <button className="button button-primary button-full verify-button" onClick={verifyPayment}><BadgeCheck size={17} /> Pembayaran Terverifikasi</button>}
            {isSavedPaid && <button className="button button-primary button-full verify-button" onClick={() => onPrint(activeTransaction)}><Printer size={17} /> Cetak struk</button>}
            {savedTransaction && !savedHere && <button className="button button-secondary button-full verify-button" onClick={() => onPrint(savedTransaction)}><Printer size={17} /> Cetak struk terakhir</button>}
            <div className="preview-security"><ShieldCheck size={14} /> Nomor WhatsApp tampil pada struk. Data jaminan tetap privat.</div>
          </div>
        </aside>
      </div>
    </>
  );
}

function SectionTitle({ number, title, subtitle }) {
  return <div className="form-section-title"><span>{number}</span><div><h2>{title}</h2><p>{subtitle}</p></div></div>;
}

function History({ transactions, isOwner, search, setSearch, location, setLocation, cashier, setCashier, date, setDate, onPrint, onVoid }) {
  const [tab, setTab] = useState('all');
  const filtered = useMemo(() => transactions.filter((transaction) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [transaction.receiptNo, transaction.customerName, transaction.customerWhatsapp].some((value) => value?.toLowerCase().includes(query));
    return matchesSearch && (location === 'all' || transaction.location === location) &&
      (!isOwner || cashier === 'all' || transaction.cashierId === cashier) &&
      (!date || transaction.createdAt.slice(0, 10) === date) &&
      (tab === 'all' || transaction.location === tab);
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [transactions, search, location, cashier, date, tab, isOwner]);
  const countFor = (value) => transactions.filter((transaction) => value === 'all' || transaction.location === value).length;
  return (
    <>
      <PageHeading eyebrow="ARSIP PENYEWAAN" title="Riwayat transaksi." description="Temukan transaksi, tinjau pembayaran, dan cetak ulang struk." />
      <div className="history-tabs"><button onClick={() => setTab('all')} className={tab === 'all' ? 'history-tab-active' : ''}>Semua <span>{countFor('all')}</span></button><button onClick={() => setTab('cafe')} className={tab === 'cafe' ? 'history-tab-active' : ''}>Cafe <span>{countFor('cafe')}</span></button><button onClick={() => setTab('event')} className={tab === 'event' ? 'history-tab-active' : ''}>Event <span>{countFor('event')}</span></button></div>
      <div className="panel history-panel">
        <div className="history-toolbar"><div className="search-input"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari no. struk, nama, atau WhatsApp..." /></div><div className="filter-controls"><label className="select-filter"><Filter size={15} /><select value={location} onChange={(event) => setLocation(event.target.value)}><option value="all">Semua lokasi</option><option value="cafe">Cafe</option><option value="event">Event</option></select><ChevronDown size={14} /></label>{isOwner && <label className="select-filter"><Users size={15} /><select value={cashier} onChange={(event) => setCashier(event.target.value)}><option value="all">Semua kasir</option><option value="kasir1">Kasir 1</option><option value="kasir2">Kasir 2</option></select><ChevronDown size={14} /></label>}<label className="date-filter"><CalendarDays size={15} /><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label></div></div>
        {filtered.length === 0 ? <EmptyState title="Transaksi tidak ditemukan" body={transactions.length ? 'Coba ubah kata kunci atau filter yang digunakan.' : 'Transaksi yang sudah dibuat akan muncul di sini.'} /> : <div className="table-wrap"><table className="history-table"><thead><tr><th>No. struk</th><th>Penyewa</th><th>Kamera & durasi</th><th>Lokasi</th>{isOwner && <th>Kasir</th>}<th>Pembayaran</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{filtered.map((transaction) => <tr key={transaction.id}><td><strong className="receipt-id">{transaction.receiptNo}</strong><small>{formatDate(transaction.createdAt)} · {transaction.startTime}</small></td><td><strong>{transaction.customerName}</strong><small>{transaction.customerWhatsapp}</small></td><td>{transaction.cameraName}{transaction.isManualPrice && <span className="manual-flag">TARIF MANUAL</span>}<small>{transaction.durationLabel}</small></td><td><span className={`location-pill location-${transaction.location}`}>{transaction.location === 'cafe' ? 'Cafe' : 'Event'}</span></td>{isOwner && <td>{transaction.cashierName}<small>{transaction.cashierId}</small></td>}<td>{transaction.paymentMethod === 'cash' ? 'Tunai' : 'QRIS DANA'}{transaction.paymentMethod === 'qris_dana' && transaction.verifiedBy && <small>Diverifikasi {transaction.verifiedBy.split(' ')[0]}</small>}</td><td className="money-cell">{formatCurrency(transaction.total)}</td><td><StatusBadge transaction={transaction} /></td><td><div className="history-actions"><button className="table-action-button" disabled={transaction.paymentStatus !== 'paid'} onClick={() => onPrint(transaction)}><Printer size={14} /> Cetak ulang</button>{isOwner && transaction.paymentStatus !== 'void' && <button className="table-action-button table-void-button" onClick={() => onVoid(transaction)}><X size={13} /> Void</button>}</div></td></tr>)}</tbody></table></div>}
        <div className="table-footer"><span>Menampilkan <strong>{filtered.length}</strong> dari <strong>{transactions.length}</strong> transaksi termuat</span><span>Riwayat bersumber dari server</span></div>
      </div>
    </>
  );
}

function Catalog({ cameras, draft, setDraft, onCreate, onUpdate, onToggle, onNotice }) {
  const [form, setForm] = useState({ name: '', price1: '', price2: '', image: '', tone: 'pink', active: true });
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);
  useEffect(() => {
    if (draft) setForm({ name: draft.name, price1: draft.prices[1], price2: draft.prices[2], image: draft.image || '', tone: draft.tone || 'pink', active: draft.active });
    else setForm({ name: '', price1: '', price2: '', image: '', tone: 'pink', active: true });
    setImageFile(null);
    setError('');
  }, [draft]);
  const change = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
  const uploadImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Format foto harus JPG, PNG, atau WebP.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError('Ukuran foto maksimal 3 MB.');
      return;
    }
    const reader = new FileReader();
    setImageFile(file);
    reader.onload = () => change('image', String(reader.result));
    reader.onerror = () => setError('Foto tidak dapat dibaca. Silakan pilih file lain.');
    reader.readAsDataURL(file);
  };
  const saveCamera = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || Number(form.price1) <= 0 || Number(form.price2) <= 0) {
      setError('Nama kamera dan harga 1 jam / 2 jam wajib diisi lebih dari Rp 0.');
      return;
    }
    setSaving(true);
    setError('');
    const cameraData = { name: form.name.trim(), price1: Number(form.price1), price2: Number(form.price2) };
    try {
      if (draft) await onUpdate(draft.id, cameraData, imageFile);
      else await onCreate(cameraData, imageFile);
      setImageFile(null);
      setDraft(null);
    } catch (saveError) {
      setError(saveError.message);
      onNotice(saveError.message);
    } finally {
      setSaving(false);
    }
  };
  const toggleActive = async (camera) => {
    try {
      await onToggle(camera.id, !camera.active);
    } catch (toggleError) {
      setError(toggleError.message);
      onNotice(toggleError.message);
    }
  };
  return (
    <>
      <PageHeading eyebrow="PENGELOLAAN KATALOG" title="Kamera pilihanmu." description="Atur kamera, foto, dan tarif sewa. Perubahan hanya berlaku untuk transaksi baru." action={<button className="button button-primary" onClick={() => { setDraft(null); document.getElementById('catalog-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}><Plus size={17} /> Tambah kamera</button>} />
      <div className="catalog-summary"><div><div className="summary-icon"><Camera size={19} /></div><span><strong>{cameras.length} kamera</strong><small>{cameras.filter((camera) => camera.active).length} kamera aktif di katalog kasir</small></span></div><span className="catalog-tip"><ShieldCheck size={15} /> Harga transaksi tersimpan sebagai snapshot</span></div>
      <div className="catalog-layout">
        <section className="catalog-list">
          <div className="section-heading catalog-section-heading"><div><h2>Daftar kamera</h2><p>Kelola kamera yang tersedia untuk disewa</p></div><span className="catalog-count">{cameras.length} ITEM</span></div>
          <div className="catalog-grid">{cameras.map((camera) => <article className={`catalog-card ${!camera.active ? 'catalog-inactive' : ''}`} key={camera.id}><div className="catalog-camera-visual"><CameraArtwork tone={camera.tone} image={camera.image} /><span className={`catalog-status ${camera.active ? '' : 'catalog-status-off'}`}>{camera.active ? 'Aktif' : 'Nonaktif'}</span><button className="catalog-edit" onClick={() => { setDraft(camera); document.getElementById('catalog-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} aria-label={`Edit ${camera.name}`}><Settings2 size={16} /></button></div><div className="catalog-card-body"><h3>{camera.name}</h3><div className="catalog-prices"><span><small>1 JAM</small><strong>{formatCurrency(camera.prices[1])}</strong></span><i /><span><small>2 JAM</small><strong>{formatCurrency(camera.prices[2])}</strong></span></div><div className="catalog-card-footer"><button className="edit-link" onClick={() => { setDraft(camera); document.getElementById('catalog-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>Edit detail <ArrowRight size={14} /></button><button className={`toggle-switch ${camera.active ? 'toggle-on' : ''}`} onClick={() => toggleActive(camera)} aria-label={camera.active ? 'Nonaktifkan kamera' : 'Aktifkan kamera'}><i /></button></div></div></article>)}</div>
        </section>
        <form id="catalog-form" className="panel catalog-form" onSubmit={saveCamera}>
          <div className="catalog-form-heading"><div className="catalog-form-icon"><Camera size={18} /></div><div><h2>{draft ? 'Edit kamera' : 'Tambah kamera'}</h2><p>{draft ? 'Perbarui detail katalog' : 'Tambahkan kamera ke katalog'}</p></div>{draft && <button type="button" className="icon-button" onClick={() => setDraft(null)} aria-label="Batal edit"><X size={17} /></button>}</div>
          <div className="form-field"><label className="field-label" htmlFor="cameraName">Nama kamera <span>*</span></label><input id="cameraName" className="text-input" value={form.name} onChange={(event) => change('name', event.target.value)} placeholder="Contoh: Canon Ixus 185" /></div>
          <div className="form-grid catalog-price-grid"><div className="form-field"><label className="field-label">Harga 1 jam <span>*</span></label><div className="currency-input"><span>Rp</span><input className="text-input" type="number" min="1" value={form.price1} onChange={(event) => change('price1', event.target.value)} placeholder="25.000" /></div></div><div className="form-field"><label className="field-label">Harga 2 jam <span>*</span></label><div className="currency-input"><span>Rp</span><input className="text-input" type="number" min="1" value={form.price2} onChange={(event) => change('price2', event.target.value)} placeholder="35.000" /></div></div></div>
          <div className="form-field"><label className="field-label">Foto kamera <span className="optional-tag">OPSIONAL</span></label><input className="hidden-input" ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} /><div className="catalog-image-preview"><CameraArtwork tone={form.tone} image={form.image} /><button type="button" className="image-upload-button" onClick={() => fileRef.current?.click()}><ImagePlus size={15} /> {form.image ? 'Ganti foto' : 'Pilih foto'}</button></div><small className="field-hint">JPG, PNG, atau WebP · maksimal 3 MB.</small></div>
          {error && <div className="form-error">{error}</div>}
          <button className="button button-primary button-full catalog-save" type="submit" disabled={saving}>{draft ? <Check size={16} /> : <Plus size={16} />}{saving ? 'Menyimpan...' : draft ? 'Simpan perubahan' : 'Tambah ke katalog'}</button>
          <p className="catalog-form-note"><ShieldCheck size={14} /> Kamera nonaktif tetap tersimpan di riwayat transaksi.</p>
        </form>
      </div>
    </>
  );
}

function Reports({
  report, loading, error, date, setDate, cashier, setCashier,
  location, setLocation, onLoad, onExport,
}) {
  useEffect(() => {
    onLoad();
  }, []);
  return (
    <>
      <PageHeading
        eyebrow="LAPORAN OPERASIONAL"
        title="Cerita dalam angka."
        description="Pantau pendapatan dan aktivitas penyewaan berdasarkan periode, kasir, dan lokasi."
        action={<button className="button button-secondary" onClick={onExport}><FileText size={16} /> Unduh PDF</button>}
      />
      <div className="panel report-filters">
        <div className="date-filter"><CalendarDays size={15} /><input type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="Tanggal laporan" /></div>
        <label className="select-filter"><Users size={15} /><select value={cashier} onChange={(event) => setCashier(event.target.value)} aria-label="Filter kasir"><option value="all">Semua kasir</option><option value="kasir1">Kasir 1</option><option value="kasir2">Kasir 2</option></select><ChevronDown size={14} /></label>
        <label className="select-filter"><Filter size={15} /><select value={location} onChange={(event) => setLocation(event.target.value)} aria-label="Filter lokasi"><option value="all">Semua lokasi</option><option value="cafe">Cafe</option><option value="event">Event</option></select><ChevronDown size={14} /></label>
        <button className="button button-primary button-small" onClick={onLoad} disabled={loading}>{loading ? 'Memuat...' : 'Terapkan filter'}</button>
        <span className="report-period">{report ? `${report.period.from} — ${report.period.to}` : '7 hari terakhir'}</span>
      </div>
      {error && <div className="error-banner"><X size={16} />{error}</div>}
      {loading && !report ? <div className="loading-banner"><span className="loading-spinner" /> Memuat laporan...</div> : report && <>
        <section className="stats-grid report-stats">
          <StatCard label="Pendapatan lunas" value={formatCurrency(report.totals.revenue)} detail={`${report.totals.paidCount} transaksi lunas`} icon={Wallet} tone="pink" />
          <StatCard label="Jumlah transaksi" value={report.totals.transactionCount} detail={`${report.totals.voidCount} void`} icon={ShoppingBag} tone="lavender" />
          <StatCard label="Menunggu verifikasi" value={report.totals.pendingCount} detail="Pembayaran QRIS DANA" icon={Clock3} tone="peach" />
          <StatCard label="Tarif manual" value={report.totals.manualPriceCount} detail="Transaksi berdurasi > 2 jam" icon={SlidersHorizontal} tone="mint" />
        </section>
        <div className="report-panels">
          <section className="panel report-panel"><div className="panel-heading"><div><h2>Pendapatan per metode bayar</h2><p>Transaksi lunas pada periode ini</p></div><CreditCard size={17} className="muted-icon" /></div>
            <div className="report-metric-row"><span><i className="report-dot report-dot-cash" /> Tunai</span><strong>{formatCurrency(report.totals.paymentMethods.cash)}</strong></div>
            <div className="report-metric-row"><span><i className="report-dot report-dot-qris" /> QRIS DANA</span><strong>{formatCurrency(report.totals.paymentMethods.qrisDana)}</strong></div>
          </section>
          <section className="panel report-panel"><div className="panel-heading"><div><h2>Pendapatan per lokasi</h2><p>Perbandingan Cafe dan Event</p></div><Store size={17} className="muted-icon" /></div>
            {report.byLocation.length ? report.byLocation.map((item) => <div className="report-metric-row" key={item.location}><span><i className={`report-dot ${item.location === 'cafe' ? 'report-dot-cash' : 'report-dot-qris'}`} /> {item.location === 'cafe' ? 'Cafe' : 'Event'} <small>· {item.transactionCount} transaksi</small></span><strong>{formatCurrency(item.revenue)}</strong></div>) : <p className="report-empty">Belum ada transaksi pada periode ini.</p>}
          </section>
          <section className="panel report-panel report-wide"><div className="panel-heading"><div><h2>Performa kasir</h2><p>Jumlah transaksi dan pendapatan</p></div><Users size={17} className="muted-icon" /></div>
            {report.byCashier.length ? <div className="table-wrap"><table><thead><tr><th>Kasir</th><th>Transaksi</th><th>Pendapatan</th></tr></thead><tbody>{report.byCashier.map((item) => <tr key={item.cashierId}><td>{item.cashierName}<small>{item.cashierId}</small></td><td>{item.transactionCount}</td><td className="money-cell">{formatCurrency(item.revenue)}</td></tr>)}</tbody></table></div> : <p className="report-empty">Belum ada aktivitas kasir pada periode ini.</p>}
          </section>
          <section className="panel report-panel report-wide"><div className="panel-heading"><div><h2>Kamera terlaris</h2><p>Model dengan penyewaan terbanyak</p></div><Camera size={17} className="muted-icon" /></div>
            {report.popularCameras.length ? <div className="popular-camera-list">{report.popularCameras.map((item, index) => <div className="popular-camera-row" key={`${item.cameraId}-${item.cameraName}`}><span className="popular-rank">{String(index + 1).padStart(2, '0')}</span><strong>{item.cameraName}</strong><span>{item.rentalCount} sewa</span><b>{formatCurrency(item.revenue)}</b></div>)}</div> : <p className="report-empty">Belum ada kamera yang disewa pada periode ini.</p>}
          </section>
        </div>
        <p className="report-footnote"><ShieldCheck size={14} /> Data laporan berasal dari transaksi server. Pendapatan menghitung transaksi lunas dan mengecualikan void.</p>
      </>}
    </>
  );
}

function PrintView({ transaction, onBack, onPrint }) {
  return <div className="print-page"><PageHeading eyebrow="STRUK PENYEWAAN" title="Siap untuk dicetak." description={`${transaction.receiptNo} · ${transaction.location === 'cafe' ? 'Cafe' : 'Event'}`} action={<button className="button button-secondary" onClick={onBack}><ArrowLeft size={16} /> Kembali</button>} /><div className="print-layout"><div className="panel print-help"><div className="print-help-icon"><Printer size={22} /></div><h2>Cetak struk thermal</h2><p>Gunakan kertas 58 mm. Pada dialog cetak, pilih printer Rongta RPP02N atau printer thermal yang tersedia.</p><div className="print-steps"><span><i>1</i> Klik tombol cetak</span><span><i>2</i> Pilih printer &amp; ukuran kertas</span><span><i>3</i> Pastikan skala 100%</span></div><button className="button button-primary" onClick={onPrint}><Printer size={17} /> Cetak sekarang</button></div><div className="print-preview"><span className="eyebrow">PRATINJAU · 58 MM</span><Receipt transaction={transaction} /></div></div></div>;
}

export default App;
