# Absensi Tools - Frontend User Interface

Frontend ini dibangun menggunakan **Next.js 14+** dengan antarmuka yang modern, reaktif, dan ramah pengguna. Aplikasi ini terdiri dari dua bagian utama: halaman publik untuk mentee dan dashboard admin untuk manajemen dan sinkronisasi data absensi.

## Teknologi Utama (Tech Stack)

Berikut adalah daftar lengkap stack teknologi yang digunakan dalam frontend:

- **Framework & Bahasa:**
  - **Next.js 14 (App Router)**: Framework React untuk rendering halaman server-side (SSR) dan static generation.
  - **React 18**: Library JavaScript untuk membangun antarmuka pengguna.
  - **TypeScript**: Superset dari JavaScript yang menambahkan tipe data statis untuk meningkatkan keamanan kode.

- **Styling & UI Kit:**
  - **Tailwind CSS**: Framework CSS utility-first untuk styling cepat dan responsif.
  - **Shadcn/ui**: Koleksi komponen UI yang dapat disesuaikan (berbasis Radix UI) untuk elemen antarmuka yang konsisten dan aksesibel.
  - **Radix UI Primitive**: Komponen dasar tak bergaya untuk aksesibilitas tinggi.

- **Animasi & Ikon:**
  - **Framer Motion**: Library animasi untuk transisi halaman dan efek visual yang halus.
  - **Lucide React**: Paket ikon open-source yang konsisten dan modern.

- **Manajemen State & HTTP:**
  - **React Hooks**: `useState`, `useEffect` untuk manajemen state lokal.
  - **Fetch API / Custom Hooks**: Abstraksi untuk komunikasi dengan backend API.

## Panduan Penggunaan

Berikut adalah cara menggunakan fitur-fitur utama aplikasi:

### 1. Halaman Publik (Pengecekan Absensi)

Halaman ini dapat diakses oleh siapa saja (terutama mentee) tanpa perlu login.
- **Akses**: Buka halaman utama (`/`).
- **Input Data**: Masukkan Nomor WhatsApp yang terdaftar di Infinite Learning.
- **Halaman Hasil**:
  - Menampilkan profil mentee, program, dan mentor.
  - Menampilkan ringkasan kehadiran (Hadir, Izin, Alpha) dan persentase kehadiran bulanan.
  - **Tampilan Khusus**: Status kehadiran "Hadir On-cam" atau "Hadir Off-cam" disederhanakan menjadi **"Hadir"** untuk kemudahan pembacaan.
  - **Jadwal Kosong**: Hari yang dijadwalkan tetapi belum dimulai akan ditandai dengan badge "Kelas belum dimulai".

### 2. Dashboard Admin

Dashboard ini hanya dapat diakses oleh admin menggunakan kredensial yang valid.

#### a. Login
- Gunakan username dan password yang telah ditentukan. Sistem menggunakan autentikasi berbasis sesi aman.

#### b. Overview (Ringkasan)
- Menampilkan kartu statistik utama: Total Mentee, Total Hadir, Izin, dan Alpha hari ini.
- Melakukan pencarian data mentee secara real-time.

#### c. Tab History (Riwayat Harian)
- Menampilkan tabel kehadiran harian untuk seluruh bulan yang dipilih.
- Kolom **"Belum Diisi"** menunjukkan jumlah mentee yang belum memiliki data absensi pada hari tersebut.
- Persentase kehadiran dihitung berdasarkan total hari dalam satu bulan (termasuk jadwal yang belum terlaksana).

#### d. Data Viewer (Pencarian Detail)
- Fitur pencarian lanjutan untuk menemukan data spesifik mentee.
- Menampilkan detail per mentee termasuk ringkasan performa individu.

#### e. Sinkronisasi Data (Sync)
- Tombol **Sync Data** (pojok kanan atas dashboard) digunakan untuk menarik data terbaru dari Airtable.
- Proses ini akan memperbarui database lokal dengan data terkini, termasuk jadwal baru atau perubahan status kehadiran.

## Instalasi dan Pengembangan

1. **Pastikan Backend Berjalan**: Frontend membutuhkan backend API yang aktif di port yang sesuai (default: 5000).
2. **Instalasi Dependensi**:
   ```bash
   npm install
   ```
3. **Konfigurasi Environment**:
   Untuk menjalankan aplikasi, salin file `.env.example` menjadi `.env.local` dan isi URL backend yang sesuai (baik lokal maupun live):
   ```bash
   cp .env.example .env.local
   ```
   **Daftar Variabel (`.env.example`):**
   - `NEXT_PUBLIC_API_URL`: URL API Backend. 
     - Contoh Lokal: `http://localhost:5000`
     - Contoh Live: `https://api.domain-anda.com`
4. **Menjalankan Server Development**:
   ```bash
   npm run dev
   ```
   Akses aplikasi di `http://localhost:3000`.

## Struktur Proyek Utama

- `app/`: Mengandung semua halaman (routes) aplikasi (Next.js App Router).
  - `admin/`: Halaman dashboard dan login admin.
  - `absen/`: Halaman detail absensi publik.
  - `components/`: Komponen UI yang dapat digunakan kembali (Button, Card, Input, Tables).
- `lib/`: Utilitas dan konfigurasi API global.
