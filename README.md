# Evarti Sewa Kamera

Frontend React/Vite dan API Express/SQLite dikelola sebagai satu npm workspace.
Database tetap berjalan di folder `back-end/.data/`; frontend development server
tersedia di `http://localhost:5173` dan API di `http://localhost:3000`.

## Menjalankan aplikasi

Persyaratan: Node.js 20 atau lebih baru dan npm.

1. Dari folder proyek, siapkan konfigurasi lokal:

   ```sh
   cp .env.example .env
   ```

2. Ganti `SESSION_SECRET` dengan nilai acak minimal 32 karakter dan atur password
   Owner, Kasir 1, serta Kasir 2 yang unik dan minimal 12 karakter. Jangan gunakan
   nilai contoh untuk pemakaian nyata.
3. Pasang dependensi seluruh workspace satu kali:

   ```sh
   npm install
   ```

4. Jalankan frontend dan backend bersama-sama:

   ```sh
   npm run dev
   ```

Buka `http://localhost:5173`. Gunakan `Ctrl+C` untuk menghentikan kedua server.
Frontend meneruskan request `/api` ke backend lokal secara otomatis.

Environment dibaca dari `.env` di folder proyek. `DATABASE_PATH` relatif terhadap
folder `back-end`, sehingga nilai bawaan membuat database di `back-end/.data/`.
Pada production wajib gunakan HTTPS dan `COOKIE_SECURE=true`.

## Perintah lain

```sh
npm run build          # build frontend
npm test               # test API backend
npm run dev:backend    # jalankan hanya API
npm run dev:frontend   # jalankan hanya frontend
```

Untuk detail endpoint API dan model keamanan, lihat [back-end/README.md](./back-end/README.md).
