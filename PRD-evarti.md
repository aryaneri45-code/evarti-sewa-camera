# PRD — Evarti Camera Rental

**Produk:** Aplikasi internal penyewaan kamera dan pengelolaan transaksi
**Brand:** evarti — *Weaving stories into your life*
**Status:** Dokumentasi produk yang sudah berjalan
**Tanggal pembaruan:** 21 Oktober 2026

## 1. Ringkasan Produk

Evarti Camera Rental adalah aplikasi web responsif untuk membantu staf Evarti
mengelola penyewaan kamera di lokasi Cafe dan Event. Aplikasi mencakup login
staf, katalog kamera dan add-on, pembuatan transaksi, struk, riwayat, laporan,
serta pengelolaan transaksi oleh Owner.

Aplikasi ini adalah alat operasional internal, bukan situs booking pelanggan.
Pelanggan tidak membuat akun, memesan, atau membayar melalui situs.

## 2. Pengguna dan Hak Akses

| Akun | Peran | Hak akses |
|---|---|---|
| Owner | `owner` | Membuat transaksi di Cafe atau Event; melihat semua transaksi; mengelola katalog kamera dan add-on; memverifikasi QRIS; membatalkan transaksi; melihat laporan dan mengunduh PDF; melihat audit log. |
| Kasir 1 | `kasir` | Membuat transaksi Cafe; melihat transaksi miliknya; memverifikasi QRIS miliknya; mencetak struk transaksi miliknya. |
| Kasir 2 | `kasir` | Membuat transaksi Event; melihat transaksi miliknya; memverifikasi QRIS miliknya; mencetak struk transaksi miliknya. |

Hak akses ditegakkan di backend. Kasir tidak dapat mengganti lokasi yang
ditetapkan untuk akunnya atau membaca transaksi kasir lain. Sesi login
berlangsung maksimal delapan jam.

## 3. Fitur yang Berjalan

### 3.1 Login dan sesi

- Login menggunakan username dan password untuk tiga akun staf.
- Sesi disimpan di server dan menggunakan cookie `HttpOnly`, `SameSite=Strict`,
  serta perlindungan CSRF untuk permintaan yang mengubah data.
- Login dibatasi untuk mengurangi percobaan berulang.
- Password awal berasal dari environment variable saat database dan akun
  pertama kali dibuat. Mengubah variable setelah inisialisasi tidak otomatis
  mengubah password akun yang sudah ada.

### 3.2 Katalog kamera

Owner dapat:

- Menambahkan kamera dengan nama dan tarif sewa 1 jam serta 2 jam.
- Mengubah nama dan tarif kamera.
- Mengunggah atau mengganti foto kamera.
- Mengaktifkan/menonaktifkan kamera.
- Menghapus kamera.

Kasir hanya melihat kamera aktif. Foto kamera harus JPG, PNG, atau WebP dan
berukuran maksimal 3 MB. Penghapusan atau perubahan katalog tidak mengubah nama
dan tarif yang sudah disimpan sebagai snapshot pada transaksi lama.

### 3.3 Katalog add-on

Kategori add-on yang tersedia adalah properti, fotografer, print foto, dan
pemindahan file. Owner dapat menambahkan pilihan baru, mengubah label dan harga,
mengaktifkan/menonaktifkan pilihan katalog, serta menghapus pilihan. Kasir hanya
melihat pilihan aktif. Harga dan label yang dipilih disimpan sebagai snapshot
pada transaksi.

Add-on dapat dipilih secara opsional pada transaksi. Beberapa pilihan properti
dapat digunakan bersamaan; kategori fotografer, print, dan pemindahan file
masing-masing dibatasi paling banyak satu pilihan per transaksi. Tarif
pemindahan file mengikuti harga yang tertera di katalog; harga awal pilihan
transfer yang disediakan adalah Rp5.000 dan Rp10.000.

### 3.4 Pembuatan transaksi

Satu transaksi dapat berisi satu atau lebih kamera, dengan durasi dan tarif
masing-masing, serta pilihan add-on. Formulir mencakup:

- Lokasi (dipilih Owner; otomatis ditentukan untuk kasir).
- Nama penyewa dan nomor WhatsApp wajib; nomor WhatsApp dinormalisasi sebelum
  disimpan.
- Nomor pager opsional.
- Jaminan opsional: tidak ada, foto, atau nomor ID.
- Kamera, durasi, jam mulai, dan tarif setiap item.
- Add-on opsional.
- Metode pembayaran tunai atau QRIS DANA.
- Uang diterima dan kembalian untuk transaksi tunai.

Jam selesai dihitung berdasarkan jam mulai dan durasi item terlama. Tarif 1 jam
dan 2 jam harus sesuai katalog. Durasi lebih dari 2 jam menggunakan durasi dan
tarif manual yang dimasukkan kasir; sistem tidak memperkirakan tarif. Catatan
untuk tarif manual tersedia secara opsional. Total transaksi dihitung dari
seluruh tarif kamera dan add-on, lalu divalidasi kembali oleh backend.

Untuk jaminan foto, unggahan harus JPG, PNG, atau WebP dan maksimal 2 MB. Foto
jaminan disimpan di area privat dan hanya dapat dibaca oleh Owner atau kasir
pembuat transaksi. Data jaminan tidak dicetak pada struk.

Nomor struk dibuat unik oleh server dengan format `CAF-YYYYMMDD-NNN` untuk Cafe
dan `EVT-YYYYMMDD-NNN` untuk Event. Nama kamera, durasi, tarif, serta add-on
disalin ke transaksi agar perubahan katalog berikutnya tidak mengubah riwayat.

### 3.5 Pembayaran dan status

- **Tunai:** jumlah diterima wajib menutup total; kembalian dihitung otomatis.
  Transaksi berstatus lunas saat disimpan.
- **QRIS DANA:** transaksi disimpan sebagai menunggu verifikasi. Kasir pembuat
  atau Owner memeriksa pembayaran secara manual lalu mengubah status menjadi
  lunas.
- Aplikasi tidak menyediakan aset QRIS DANA dan tidak mengirim atau menerima
  konfirmasi otomatis dari penyedia pembayaran.
- Owner dapat membatalkan transaksi dengan alasan. Transaksi tidak dihapus dari
  riwayat; status, alasan, pelaku, dan waktu pembatalan disimpan.
- Transaksi yang sudah tersimpan tidak dapat diedit. Koreksi dilakukan dengan
  membatalkan transaksi lalu membuat transaksi baru.

Status yang digunakan: `paid`, `pending_verification`, dan `void`.

### 3.6 Struk dan pencetakan

- Menampilkan pratinjau, lalu mencetak melalui dialog cetak browser pada kertas
  thermal 58 mm.
- Menyediakan dua format: **Struk Admin** dan **Struk Pelanggan**.
- Struk dapat dicetak setelah transaksi lunas dan dapat dicetak ulang dari
  riwayat. Jumlah cetak ulang dicatat di audit log.
- Struk memuat data transaksi yang relevan, kamera, add-on, total, dan informasi
  pembayaran. Data jaminan tidak dicetak.
- Aplikasi tidak menyediakan unduhan PDF untuk struk individual.

Hasil cetak dapat berbeda sesuai browser, perangkat, dan printer; pengaturan
serta kompatibilitas Bluetooth/USB perlu diuji pada perangkat operasional.

### 3.7 Riwayat, dashboard, dan laporan

- Dashboard menampilkan ringkasan operasional hari ini dan transaksi terbaru.
- Riwayat kasir hanya memuat transaksi miliknya. Owner dapat melihat semua
  transaksi dan memfilter berdasarkan kasir, lokasi, dan tanggal. Status dan
  penanda tarif manual ditampilkan pada transaksi.
- Riwayat mendukung pencarian berdasarkan nomor struk, nama penyewa, atau nomor
  WhatsApp pada antarmuka.
- Detail transaksi dapat diakses oleh Owner atau kasir pembuatnya.
- Ringkasan laporan mencakup jumlah/status transaksi, pendapatan, metode
  pembayaran, lokasi, kasir, kamera populer, dan tren tanggal.
- Laporan menerima periode harian, mingguan, bulanan, maupun rentang tanggal.
  Data kasir dibatasi ke transaksi miliknya; Owner dapat memfilter kasir dan
  lokasi.
- PDF yang tersedia adalah PDF ringkasan transaksi. Unduhan PDF hanya tersedia
  untuk Owner.

### 3.8 Audit log

Backend mencatat tindakan sensitif yang tersedia, termasuk pembuatan transaksi
dengan tarif manual, verifikasi QRIS, pembatalan transaksi, dan cetak ulang.
Endpoint audit log hanya dapat diakses Owner.

## 4. Aturan Bisnis dan Privasi

1. Tarif standar 1 jam dan 2 jam berasal dari katalog; tarif durasi lebih dari
   2 jam diinput manual oleh kasir.
2. Total merupakan jumlah tarif semua kamera dan add-on. Tidak ada diskon atau
   pajak yang diterapkan aplikasi.
3. Transaksi tunai hanya dapat disimpan jika uang diterima setidaknya sebesar
   total.
4. Transaksi QRIS hanya dapat dicetak setelah ditandai lunas melalui verifikasi
   manual.
5. Pembatalan tidak menghapus transaksi dan tidak dapat dibalik melalui
   antarmuka.
6. Nomor WhatsApp, data jaminan, dan foto jaminan adalah data sensitif.
   Akses transaksi dibatasi untuk Owner dan kasir pembuatnya; foto jaminan tidak
   tersedia secara publik.
7. Kebijakan denda keterlambatan dan tanggung jawab kerusakan/kehilangan dapat
   dicantumkan di footer struk, tetapi aplikasi tidak menghitung atau mencatat
   denda.
8. Aplikasi tidak mengelola stok atau ketersediaan fisik kamera.

## 5. Teknologi dan Struktur

- **Frontend:** React 18, Vite, Lucide icons.
- **Backend:** Node.js 20+, Express, SQLite (`better-sqlite3`).
- **Validasi:** Zod.
- **PDF laporan:** PDFKit.
- **Pengujian API:** Node.js Test Runner dan Supertest.

```text
.
├── Front-end/          # Aplikasi React/Vite
├── back-end/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── tests/
│   └── uploads/        # Foto kamera dan foto jaminan privat
├── .data/              # Database SQLite (default)
├── PRD-evarti.md
├── README-hosting.md
└── README.md
```

## 6. API yang Digunakan

Semua endpoint selain `GET /api/health` dan `POST /api/auth/login` memerlukan
sesi. Permintaan yang mengubah data memerlukan token CSRF. Endpoint yang
dibatasi Owner ditandai berikut.

| Method | Endpoint | Akses | Kegunaan |
|---|---|---|---|
| `GET` | `/api/health` | Publik | Pemeriksaan kesehatan API. |
| `POST` | `/api/auth/login` | Publik | Login dan membuat sesi. |
| `GET` | `/api/auth/me` | Login | Membaca akun dan sesi aktif. |
| `POST` | `/api/auth/logout` | Login + CSRF | Mengakhiri sesi. |
| `GET` | `/api/cameras` | Login | Daftar kamera aktif; Owner juga melihat kamera nonaktif. |
| `POST` | `/api/cameras` | Owner + CSRF | Membuat kamera. |
| `PUT` | `/api/cameras/:id` | Owner + CSRF | Mengubah nama dan tarif kamera. |
| `PATCH` | `/api/cameras/:id/active` | Owner + CSRF | Mengaktifkan atau menonaktifkan kamera. |
| `DELETE` | `/api/cameras/:id` | Owner + CSRF | Menghapus kamera. |
| `POST` | `/api/cameras/:id/image` | Owner + CSRF | Mengunggah atau mengganti foto kamera. |
| `GET` | `/api/cameras/:id/image` | Login | Membaca foto kamera yang dapat diakses. |
| `GET` | `/api/addons` | Login | Daftar add-on aktif; Owner juga melihat yang nonaktif. |
| `POST` | `/api/addons` | Owner + CSRF | Membuat pilihan add-on. |
| `PUT` | `/api/addons` | Owner + CSRF | Memperbarui label, harga, dan status seluruh katalog add-on. |
| `DELETE` | `/api/addons/:id` | Owner + CSRF | Menghapus pilihan add-on. |
| `POST` | `/api/transactions` | Login + CSRF | Membuat transaksi. |
| `GET` | `/api/transactions` | Login | Daftar transaksi; kasir hanya miliknya. |
| `GET` | `/api/transactions/:id` | Owner atau pembuat | Membaca detail transaksi. |
| `GET` | `/api/transactions/:id/guarantee-photo` | Owner atau pembuat | Membaca foto jaminan privat. |
| `PATCH` | `/api/transactions/:id/verify` | Owner atau pembuat + CSRF | Memverifikasi QRIS yang menunggu. |
| `PATCH` | `/api/transactions/:id/void` | Owner + CSRF | Membatalkan transaksi dengan alasan. |
| `POST` | `/api/transactions/:id/print` | Owner atau pembuat + CSRF | Mencatat cetak atau cetak ulang. |
| `GET` | `/api/reports/summary` | Login | Membaca ringkasan sesuai cakupan peran. |
| `GET` | `/api/reports/summary/pdf` | Owner | Mengunduh PDF ringkasan. |
| `GET` | `/api/audit-logs` | Owner | Membaca audit log. |

Tidak ada endpoint update/delete transaksi. Perubahan catatan katalog tidak
mengubah snapshot transaksi yang sudah tersimpan.

## 7. Batasan dan Pengembangan Berikutnya

Fitur berikut belum tersedia dan bukan bagian dari perilaku aplikasi saat ini:

- Booking pelanggan atau pembayaran online.
- QRIS dinamis, generator QR pembayaran, atau verifikasi pembayaran otomatis.
- Edit transaksi yang telah disimpan.
- Manajemen stok/ketersediaan unit kamera.
- Perhitungan denda keterlambatan.
- Verifikasi nomor WhatsApp.
- Unduhan PDF per transaksi.
