# Hosting di VPS / Server (Production)

Dokumen ini berisi panduan singkat untuk menjalankan aplikasi Evarti di VPS atau server agar bisa online. Fokusnya adalah deployment yang aman dan stabil untuk produksi, dengan HTTPS, reverse proxy Nginx, dan proses backend yang dijalankan dengan PM2.

## 1. Arsitektur yang direkomendasikan

Untuk deployment paling sederhana dan stabil, gunakan pola berikut:

- 1 VPS/Server
- Domain seperti: `https://app.example.com`
- Nginx sebagai reverse proxy
- Backend Node.js berjalan di port `3000`
- Frontend React/Vite dibangun menjadi file statis lalu disajikan oleh Nginx
- SSL dari Let's Encrypt

Konsepnya:

- Browser mengakses `https://app.example.com`
- Nginx melayani frontend statis
- Nginx meneruskan request `/api/*` ke backend di `http://localhost:3000`
- Backend menggunakan SQLite, jadi cukup satu server dan data tersimpan di local disk

## 2. Persiapan server

Login ke VPS Anda lalu jalankan:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl ca-certificates gnupg git nginx certbot python3-certbot-nginx

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

sudo npm install -g pm2
```

Verifikasi versi Node.js:

```bash
node -v
npm -v
```

Pastikan Node.js minimal versi `20`.

## 3. Clone repositori ke server

```bash
cd /var/www
sudo git clone https://github.com/<USERNAME>/<REPO>.git evarti-sewa-camera
cd evarti-sewa-camera
```

Ganti URL repo sesuai repositori Anda.

## 4. Siapkan environment variable

Buat file `.env` di root project:

```bash
cp back-end/.env.example .env
```

Edit file `.env` dengan konfigurasi produksi:

```env
NODE_ENV=production
PORT=3000
DATABASE_PATH=./.data/evarti.sqlite
SESSION_SECRET=<isi-dengan-string-random-minimal-32-karakter>
FRONTEND_ORIGIN=https://app.example.com
COOKIE_SECURE=true
OWNER_PASSWORD=<password-strong>
CASHIER1_PASSWORD=<password-strong>
CASHIER2_PASSWORD=<password-strong>
```

Catatan penting:

- `SESSION_SECRET` harus acak dan panjang minimal 32 karakter
- `FRONTEND_ORIGIN` harus sama dengan domain frontend yang dipakai
- `COOKIE_SECURE=true` wajib pada production agar cookie session hanya dikirim via HTTPS
- Password akun harus kuat dan minimal 12 karakter
- Jangan pernah commit file `.env` ke GitHub

Jika frontend dan API dipakai dari domain yang sama, maka file `Front-end/.env` bisa dibiarkan kosong atau dibuat seperti ini:

```env
VITE_API_URL=
```

Artinya frontend akan memakai API di origin yang sama.

Jika frontend dipisah dengan subdomain seperti `https://api.example.com` dan `https://app.example.com`, maka isi:

```env
VITE_API_URL=https://api.example.com
```

## 5. Install dependency dan build frontend

Di root project:

```bash
npm install
npm run build
```

Perintah `npm run build` akan membuat output frontend di folder:

```bash
Front-end/dist
```

Pastikan build berhasil tanpa error.

## 6. Jalankan backend dengan PM2

Pada production, backend sebaiknya dijalankan dalam proses yang terus hidup.

```bash
cd /var/www/evarti-sewa-camera
pm2 start back-end/src/server.js --name evarti-api --interpreter node --cwd /var/www/evarti-sewa-camera
```

Jika ingin PM2 menyala otomatis saat reboot server:

```bash
pm2 startup
pm2 save
```

Cek status:

```bash
pm2 status
pm2 logs evarti-api --lines 50
```

Jika ingin restart:

```bash
pm2 restart evarti-api
```

## 7. Konfigurasi Nginx

Buat file konfigurasi baru:

```bash
sudo nano /etc/nginx/sites-available/evarti
```

Isi dengan konfigurasi berikut:

```nginx
server {
    listen 80;
    server_name app.example.com;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        root /var/www/evarti-sewa-camera/Front-end/dist;
        try_files $uri /index.html;
    }
}
```

Aktifkan konfigurasi:

```bash
sudo ln -s /etc/nginx/sites-available/evarti /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Jika Anda punya domain yang berbeda, ganti `server_name` sesuai domain Anda.

## 8. Enable HTTPS dengan Let's Encrypt

Setelah domain sudah mengarah ke VPS (A record / DNS), jalankan:

```bash
sudo certbot --nginx -d app.example.com
```

Certbot akan otomatis mengubah konfigurasi Nginx dan mengaktifkan HTTPS. Jika berhasil, domain akan memakai HTTPS dan Nginx akan redirect dari HTTP ke HTTPS.

## 9. Pastikan CORS dan origin benar

Pada backend, variabel `FRONTEND_ORIGIN` harus mencantumkan domain frontend yang diizinkan. Untuk satu domain yang sama, contoh:

```env
FRONTEND_ORIGIN=https://app.example.com
```

Jika API dan frontend dipisah domain, misalnya:

```env
FRONTEND_ORIGIN=https://app.example.com
```

dan frontend `.env`:

```env
VITE_API_URL=https://api.example.com
```

## 10. Jalankan pengecekan produksi

Setelah deployment, cek beberapa hal berikut:

```bash
curl -I https://app.example.com
curl https://app.example.com/api/health
```

Jika API sehat, respon yang diharapkan biasanya seperti:

```json
{"status":"ok"}
```

Cek status PM2:

```bash
pm2 status
```

Cek log backend:

```bash
pm2 logs evarti-api --lines 100
```

## 11. Persiapan data dan backup

Karena aplikasi memakai SQLite, file database utama disimpan di path yang didefinisikan pada `DATABASE_PATH`.

Contoh default:

```bash
/var/www/evarti-sewa-camera/.data/evarti.sqlite
```

Direkomendasikan:

- backup database rutin via cron
- backup file `.env`
- backup folder `uploads/`
- simpan backup di lokasi lain (S3, Dropbox, atau server backup lain)

Contoh backup sederhana:

```bash
mkdir -p /var/backups/evarti
cp /var/www/evarti-sewa-camera/.data/evarti.sqlite /var/backups/evarti/
cp /var/www/evarti-sewa-camera/.env /var/backups/evarti/
```

## 12. Troubleshooting umum

### Error: `COOKIE_SECURE=true wajib di production`

Solusi:

- Pastikan `.env` punya `COOKIE_SECURE=true`
- Pastikan aplikasi berjalan dengan `NODE_ENV=production`
- Pastikan domain memakai HTTPS

### Frontend tidak bisa login / CORS error

Solusi:

- Pastikan `FRONTEND_ORIGIN` di `.env` sesuai dengan domain frontend
- Pastikan Nginx mem-forward `/api` ke backend
- Jika frontend dan API beda origin, set `VITE_API_URL` dengan URL API yang benar

### 502 Bad Gateway dari Nginx

Solusi:

- Pastikan backend sedang berjalan:

```bash
pm2 status
pm2 logs evarti-api
```

- Pastikan port `3000` tersedia
- Cek konfigurasi Nginx: `sudo nginx -t`

### App tampil, tapi API 404/401

Solusi:

- Cek apakah route API tersedia di backend
- Pastikan cookie dan CSRF berlaku dengan origin yang benar
- Pastikan `SESSION_SECRET` valid dan tidak kosong

## 13. Struktur file penting di server

```text
/var/www/evarti-sewa-camera/
├── .env
├── .data/
│   └── evarti.sqlite
├── Front-end/
│   └── dist/
├── back-end/
│   └── src/
├── uploads/
└── package.json
```

## 14. Skenario deploy yang paling umum

### A. Frontend + API di domain yang sama

- Domain: `https://app.example.com`
- Nginx serve frontend dan proxy `/api/*` ke backend
- `VITE_API_URL=` kosong
- `FRONTEND_ORIGIN=https://app.example.com`

### B. API dan frontend dipisah

- Frontend: `https://app.example.com`
- API: `https://api.example.com`
- `VITE_API_URL=https://api.example.com`
- `FRONTEND_ORIGIN=https://app.example.com`

## 15. Catatan tambahan

- Aplikasi ini memerlukan SSL di production agar cookie session aman
- Database SQLite cocok untuk deployment kecil hingga menengah
- Untuk kebutuhan skala besar, pertimbangkan migrasi ke PostgreSQL/MySQL di masa depan
- Pastikan selalu backup konfigurasi `.env` dan file uploads sebelum perubahan besar

## 16. Contoh workflow deploy singkat

```bash
cd /var/www/evarti-sewa-camera
git pull origin main
npm install
npm run build
pm2 restart evarti-api
sudo nginx -t && sudo systemctl reload nginx
```

Jika semua langkah di atas sudah berhasil, aplikasi Anda sudah dapat diakses dari domain yang sudah dikonfigurasi.

---

Jika Anda ingin, saya juga bisa bantu membuat versi dokumen yang lebih spesifik untuk:

- VPS Ubuntu 22.04
- DigitalOcean
- Linode / Vultr
- Plesk / cPanel
- atau deployment dengan Docker
