# Evarti Rental

Aplikasi web internal untuk membantu tim Evarti mengelola penyewaan kamera,
mencatat transaksi, membuat dan mencetak struk, serta memantau laporan usaha.
Antarmuka dibuat responsif agar dapat digunakan dari ponsel, tablet, maupun
desktop.

## Fitur

- Login dengan peran **Owner**, **Kasir 1**, dan **Kasir 2**.
- Katalog kamera dengan harga sewa 1 jam dan 2 jam; Owner dapat mengelola
  kamera, harga, foto, dan status aktif.
- Pembuatan transaksi dengan satu atau lebih kamera; durasi dan tarif dapat
  diatur per kamera, lalu dijumlahkan dalam satu pembayaran dan struk.
- Data penyewa, nomor WhatsApp, nomor pager opsional sebagai pengingat waktu
  sewa, lokasi, metode pembayaran, dan informasi jaminan opsional.
- Tarif dan durasi manual untuk penyewaan lebih dari 2 jam.
- Pratinjau, penyimpanan, cetak, dan cetak ulang struk thermal 58 mm.
- Pilihan cetak struk Admin (format `NEW ORDER`) atau struk Pelanggan, masing-masing dengan tampilan cetak tersendiri.
- Nomor pager yang dimasukkan ikut tersimpan dan dicetak pada struk.
- Riwayat transaksi dengan akses sesuai peran, serta fitur verifikasi
  pembayaran, pembatalan (void), dan pencatatan audit untuk aksi penting.
- Dashboard dan ringkasan laporan; Owner dapat mengunduh ringkasan dalam PDF.
- Foto kamera dan foto jaminan disimpan melalui API, dengan foto jaminan
  bersifat privat.

**Catatan pembayaran QRIS:** verifikasi pembayaran QRIS dilakukan secara
manual. Aset QRIS resmi DANA belum disertakan, sehingga aplikasi tidak
menampilkan atau membuat QR pembayaran palsu.

## Teknologi

- **Frontend:** React 18 dan Vite
- **Backend:** Node.js, Express, dan SQLite
- **Pengujian API:** Node.js Test Runner dan Supertest

## Persyaratan

- Node.js **20 atau lebih baru**
- npm

## Menjalankan secara lokal

Jalankan perintah berikut dari direktori utama repositori:

```sh
cp back-end/.env.example .env
```

Sebelum menjalankan aplikasi, edit `.env`:

- Ganti `SESSION_SECRET` dengan nilai acak minimal 32 karakter. Contoh untuk
  membuat nilai:

  ```sh
  openssl rand -base64 48
  ```

- Ganti `OWNER_PASSWORD`, `CASHIER1_PASSWORD`, dan `CASHIER2_PASSWORD` dengan
  password berbeda yang masing-masing minimal 12 karakter.
- Jangan unggah atau commit file `.env` ke GitHub.

Kemudian pasang dependensi dan jalankan frontend bersama API:

```sh
npm install
npm run dev
```

Buka alamat frontend yang ditampilkan Vite (secara default
`http://localhost:5173`). API berjalan pada `http://localhost:3000`; frontend
mengakses API melalui proxy Vite.

Pada peluncuran pertama, backend membuat database SQLite dan menyiapkan akun
serta katalog kamera awal. Gunakan username berikut dan password yang sudah
diatur pada `.env`:

| Peran | Username | Variabel password |
|---|---|---|
| Owner | `owner` | `OWNER_PASSWORD` |
| Kasir 1 | `kasir1` | `CASHIER1_PASSWORD` |
| Kasir 2 | `kasir2` | `CASHIER2_PASSWORD` |

Lokasi transaksi Kasir 1 ditetapkan oleh server ke Cafe, sedangkan Kasir 2 ke
Event. Owner dapat memilih lokasi transaksi. Mengubah variabel password setelah
database dibuat tidak mengganti password yang sudah tersimpan.

### Menjalankan bagian aplikasi secara terpisah

```sh
npm run dev:backend
npm run dev:frontend
```

Jalankan setiap perintah pada terminal terpisah. Frontend development server
menggunakan proxy API ke `http://localhost:3000`.

## Pengujian dan build

Jalankan pengujian backend dari direktori utama:

```sh
npm test
```

Buat build produksi frontend:

```sh
npm run build
```

## Konfigurasi

Konfigurasi backend dibaca dari `.env` di direktori utama (atau dari
`back-end/.env` jika file root tidak tersedia).

| Variabel | Fungsi | Nilai default |
|---|---|---|
| `NODE_ENV` | Mode aplikasi | `development` |
| `PORT` | Port API | `3000` |
| `DATABASE_PATH` | Lokasi file database SQLite | `./.data/evarti.sqlite` |
| `SESSION_SECRET` | Secret sesi acak, minimal 32 karakter | Wajib diisi |
| `FRONTEND_ORIGIN` | Origin frontend yang diizinkan; pisahkan beberapa origin dengan koma | `http://localhost:5173` |
| `COOKIE_SECURE` | Kirim cookie sesi hanya melalui HTTPS | `false` |
| `OWNER_PASSWORD` | Password awal Owner | Wajib diisi |
| `CASHIER1_PASSWORD` | Password awal Kasir 1 | Wajib diisi |
| `CASHIER2_PASSWORD` | Password awal Kasir 2 | Wajib diisi |

Untuk production, gunakan HTTPS, set `NODE_ENV=production` dan
`COOKIE_SECURE=true`, gunakan secret serta password yang kuat, dan sesuaikan
`FRONTEND_ORIGIN` dengan domain frontend.

Frontend menggunakan origin API yang sama secara default. Jika API ditempatkan
pada origin terpisah, atur `VITE_API_URL` di `Front-end/.env` dan izinkan origin
frontend tersebut melalui `FRONTEND_ORIGIN` backend.

## Struktur proyek

```text
.
├── Front-end/
│   ├── src/
│   │   ├── services/       # Klien API
│   │   ├── App.jsx         # Antarmuka aplikasi
│   │   └── styles.css
│   └── vite.config.js
├── back-end/
│   ├── src/
│   │   ├── config/         # Konfigurasi environment
│   │   ├── middleware/     # Autentikasi, CSRF, dan upload
│   │   ├── routes/         # Endpoint API
│   │   ├── utils/
│   │   ├── app.js
│   │   ├── db.js
│   │   └── server.js
│   ├── tests/
│   └── uploads/            # Unggahan kamera dan file privat
├── PRD-everti.md
├── package.json
└── README.md
```

Database dan file upload lokal merupakan data operasional; siapkan penyimpanan
dan pencadangan yang sesuai sebelum deployment.
