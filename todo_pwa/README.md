# To Do List Mahasiswa Informatika (PHP + MySQL + PWA)

Aplikasi To Do List yang dikembangkan dari versi HTML/JavaScript menjadi aplikasi web berbasis **PHP** dan **MySQL**, sehingga tidak hanya digunakan secara personal tetapi juga dapat dibagikan dalam sebuah organisasi. Pada tahap berikutnya aplikasi ditingkatkan menjadi **Progressive Web App (PWA)** agar dapat di-install seperti aplikasi asli dan tetap dapat dibuka saat offline.

## Daftar Isi

1. [Tugas 1: PHP, Database, dan CRUD](#tugas-1-php-database-dan-crud)
2. [Tugas 2: Progressive Web App](#tugas-2-progressive-web-app)
3. [Struktur File](#struktur-file)
4. [Cara Menjalankan](#cara-menjalankan)

---

## Tugas 1: PHP, Database, dan CRUD

Todo App yang sebelumnya menyimpan data di browser (IndexedDB) dikembangkan dengan ketentuan berikut:

1. Menambahkan **menu bar/sidebar** dengan dua menu: **Personal** dan **Shared**.
2. Memigrasikan HTML ke **PHP** dan membuatnya **modular** (`menubar.php`, `config.php`, `content.php`, dll).
3. Membuat struktur database beserta data dummy dan menyimpannya dalam **`data.sql`**.
4. Mengimplementasikan **CRUD** menggunakan PHP.
5. Menambahkan **file handling** (upload gambar tugas) menggunakan PHP.

### Fitur

- **Personal**: tugas pribadi, hanya terlihat oleh pemiliknya.
- **Shared**: tugas bersama, terlihat oleh semua anggota. Semua anggota dapat mengubah, tetapi hanya pembuat tugas yang dapat menghapus.
- CRUD tugas: tambah, lihat, ubah, hapus, dan tandai selesai.
- Upload gambar tugas (JPG/PNG/WEBP, maks. 2 MB), termasuk pengambilan foto lewat kamera.
- Notifikasi pengingat (aktif selama halaman terbuka).
- Mode terang/gelap dan tampilan responsif.
- Pemilih pengguna di sidebar ("Masuk sebagai") untuk mensimulasikan banyak pengguna tanpa sistem login.

### Struktur Database

**users**: `id`, `name`, `email`, `created_at`

**tasks**: `id`, `user_id` (relasi ke `users`), `scope` (`personal`/`shared`), `title`, `description`, `deadline`, `notification_time`, `image`, `completed`, `created_at`, `updated_at`

Relasi: satu pengguna dapat memiliki banyak tugas (`tasks.user_id` → `users.id`, `ON DELETE CASCADE`).

### Implementasi CRUD

| Operasi | Cara |
|---|---|
| Create | Form tambah tugas → `INSERT` di `actions.php` |
| Read | `SELECT` di `content.php` (difilter berdasarkan `scope` dan pengguna) |
| Update | Tombol **Edit** (`?edit=ID`) → `UPDATE` di `actions.php` |
| Delete | Tombol **Delete** dengan konfirmasi → `DELETE` di `actions.php` |

### Keamanan

- **Prepared statement (PDO)** untuk mencegah SQL Injection.
- **`htmlspecialchars`** (fungsi `e()`) untuk mencegah XSS.
- **Token CSRF** pada setiap form POST.
- Validasi upload: tipe file asli (`finfo`), batas ukuran, dan nama file acak.

---

## Tugas 2: Progressive Web App

Aplikasi ditingkatkan menjadi PWA dengan ketentuan berikut:

1. Membuat **web app manifest** beserta ikon, lalu menautkannya.
2. **Precache** app shell dan halaman offline dengan Service Worker.
3. Memilih **strategi caching** yang sesuai untuk tiap jenis resource.
4. Menambahkan **tombol install**.
5. Menguji dengan jaringan dimatikan (DevTools: Manifest, Cache Storage) dan melampirkan bukti.

### 1. Web App Manifest

File `manifest.webmanifest` ditautkan di `header.php` lewat `<link rel="manifest" href="manifest.webmanifest">`.

| Properti | Nilai | Fungsi |
|---|---|---|
| `name` / `short_name` | To Do List Mahasiswa Informatika / Todo Mahasiswa | Nama saat install dan di layar utama |
| `start_url` | `./index.php?page=personal&source=pwa` | Halaman yang dibuka saat aplikasi diluncurkan |
| `scope` | `./` | Batas URL yang dianggap bagian dari aplikasi |
| `display` | `standalone` | Tampil tanpa address bar seperti aplikasi asli |
| `background_color` / `theme_color` | `#2c3e50` | Warna splash screen dan toolbar |
| `icons` | 192 px, 512 px, 512 px *maskable* | Ikon aplikasi (folder `icons/`) |
| `shortcuts` | Personal, Shared | Pintasan saat ikon ditekan lama |

`header.php` juga memuat `apple-touch-icon` dan meta untuk iOS.

### 2. Precache App Shell dan Halaman Offline

Saat event `install`, `sw.js` menyimpan 11 file ke cache `todo-shell-v2`:

`offline.html`, `style.css`, `sidebar.css`, `pwa.css`, `script.js`, `pwa.js`, `manifest.webmanifest`, dan 4 file ikon.

`offline.html` ditulis mandiri (CSS di dalam file) sehingga tetap tampil walau file lain belum tersimpan. Saat event `activate`, cache versi lama dihapus otomatis. Naikkan `CACHE_VERSION` di `sw.js` setiap kali daftar file berubah.

### 3. Strategi Caching per Resource

| Resource | Strategi | Alasan |
|---|---|---|
| Halaman PHP (`index.php`) | **Network First** (batas 4 detik) → cache → `offline.html` | Data tugas harus terbaru saat online. Saat offline, halaman terakhir yang pernah dibuka tetap tampil. |
| CSS dan JS | **Stale-While-Revalidate** | Tampil cepat dari cache, lalu diperbarui di belakang layar. |
| Gambar (ikon dan `uploads/`) | **Cache First** (maks. 60 entri) | Jarang berubah, nama file upload unik. |
| Request POST (form tambah/edit/hapus) | **Tidak di-cache** | Perubahan data harus sampai ke server. |

Strategi ditulis langsung dengan Cache API (tanpa Workbox) agar tidak bergantung pada CDN dan mudah dipelajari.

### 4. Tombol Install

Tombol **⬇️ Install Aplikasi** ada di header dan tersembunyi secara bawaan. `pwa.js` menangkap event `beforeinstallprompt`, lalu menampilkan tombol. Setelah diklik, dialog install bawaan browser muncul. Tombol hilang setelah install (`appinstalled`). Tombol hanya muncul di browser yang mendukung (Chrome/Edge). Di iOS Safari, install dilakukan manual lewat **Share → Add to Home Screen**.

Ada pula banner kuning otomatis saat koneksi terputus.

### 5. Pengujian dan Bukti

Syarat: jalankan lewat `http://localhost/todo/` (localhost dianggap aman untuk Service Worker) atau HTTPS.

**Langkah pengujian di Chrome/Edge**

1. Buka `http://localhost/todo/` lalu tekan **F12**.
2. Tab **Application → Manifest**: pastikan nama, ikon, dan `start_url` terbaca tanpa error. Bagian *Installability* tidak menampilkan peringatan.
3. Tab **Application → Service Workers**: status `activated and is running`.
4. Tab **Application → Cache Storage**: ada `todo-shell-v2`, `todo-pages-v2`, dan `todo-images-v2`.
5. Buka halaman **Personal** dan **Shared** sekali agar tersimpan.
6. Tab **Network**, ubah *No throttling* menjadi **Offline** (atau matikan Wi-Fi), lalu muat ulang. Halaman tetap tampil lengkap dengan tampilan, dan banner offline muncul.
7. Buka alamat yang belum pernah dikunjungi (misalnya `index.php?page=lainnya`). Halaman **Anda sedang offline** tampil.
8. Klik tombol **Install Aplikasi** di header, lalu buka aplikasi dari desktop atau menu Start.

**Bukti (screenshot)**

| No | Bukti | Gambar |
|---|---|---|
| 1 | DevTools → Manifest | ![Manifest](docs/01-manifest.png) |
| 2 | DevTools → Service Workers (activated) | ![Service Worker](docs/02-service-worker.png) |
| 3 | DevTools → Cache Storage | ![Cache Storage](docs/03-cache-storage.png) |
| 4 | Halaman tetap tampil saat Network = Offline | ![Offline](docs/04-offline-halaman.png) |
| 5 | Halaman `offline.html` untuk alamat yang belum di-cache | ![Offline fallback](docs/05-offline-fallback.png) |
| 6 | Tombol install dan aplikasi terpasang | ![Install](docs/06-install.png) |

**Hasil pengujian otomatis (Chromium headless, server dimatikan untuk simulasi offline)**

| Pemeriksaan | Hasil |
|---|---|
| Service Worker mengontrol halaman | Berhasil |
| Precache 11 file app shell di `todo-shell-v2` | Berhasil |
| Halaman yang sudah dibuka tampil saat server mati | Berhasil |
| Alamat yang belum di-cache menampilkan `offline.html` | Berhasil |
| CSS tetap termuat saat offline | Berhasil |
| Tombol install muncul saat `beforeinstallprompt`, dan prompt terpanggil saat diklik | Berhasil |
| Error JavaScript di halaman | Tidak ada |

> Pengujian otomatis memakai halaman PHP sederhana tanpa MySQL untuk memeriksa lapisan PWA. Pengujian pada aplikasi lengkap dilakukan lewat langkah DevTools di atas.

### Batasan

- **Offline hanya untuk membaca.** Menambah, mengubah, dan menghapus tugas butuh server. Form yang dikirim saat offline akan gagal.
- Halaman yang tampil offline adalah salinan terakhir yang pernah dibuka. Cache halaman dibersihkan saat pengguna diganti lewat dropdown "Masuk sebagai".
- Notifikasi pengingat tetap hanya berjalan selama halaman terbuka.
- Setelah mengubah file CSS/JS, muat ulang dua kali (Stale-While-Revalidate menampilkan versi lama dulu), atau naikkan `CACHE_VERSION`.

---

## Struktur File

| File | Penjelasan |
|---|---|
| `index.php` | Front controller. Menentukan halaman (`personal`/`shared`) dan mode edit, lalu memanggil file lain secara berurutan. |
| `config.php` | Konfigurasi koneksi database (PDO), session, serta fungsi bantu: `e()` untuk escape output, token CSRF, flash message, dan pengambilan pengguna aktif. |
| `actions.php` | Memproses semua aksi POST: `create`, `update`, `delete`, `toggle`, dan `switch_user`, termasuk validasi dan penanganan upload file. |
| `header.php` | Pembuka HTML: `<head>`, tautan manifest dan ikon, tombol tema, tombol install, banner offline. |
| `menubar.php` | Sidebar berisi menu **Personal** dan **Shared** serta pemilih pengguna. |
| `content.php` | Konten utama: daftar tugas (Read) dan form tambah/edit (Create/Update). |
| `partial_image_input.php` | Potongan form upload gambar dan kamera, dipakai ulang di form tambah dan edit. |
| `footer.php` | Penutup layout, footer, dan pemanggilan `script.js` serta `pwa.js`. |
| `data.sql` | Struktur database (`users`, `tasks`) beserta data dummy. |
| `style.css` | Gaya utama aplikasi. |
| `sidebar.css` | Gaya tambahan untuk sidebar dan elemen baru. |
| `pwa.css` | Gaya tombol install dan banner offline. |
| `script.js` | JavaScript sisi klien: mode gelap, kamera, dan notifikasi pengingat. |
| `pwa.js` | Registrasi Service Worker, logika tombol install, indikator online/offline. |
| `sw.js` | Service Worker: precache app shell, strategi caching, fallback offline. |
| `manifest.webmanifest` | Web app manifest (nama, ikon, warna, mode tampilan, shortcut). |
| `offline.html` | Halaman cadangan saat offline dan halaman belum tersimpan. |
| `icons/` | Ikon aplikasi: 192 px, 512 px, maskable 512 px, dan apple-touch-icon. |
| `docs/` | Folder screenshot bukti pengujian untuk README. |
| `uploads/` | Folder penyimpanan gambar tugas (dibuat otomatis saat upload pertama). |

## Cara Menjalankan

1. Install **Laragon** atau **XAMPP**, lalu nyalakan Apache dan MySQL.
2. Salin seluruh file ke folder `www/todo` (Laragon) atau `htdocs/todo` (XAMPP).
3. Import `data.sql` melalui HeidiSQL atau phpMyAdmin.
4. Sesuaikan `DB_USER` dan `DB_PASS` di `config.php` bila perlu (bawaan: `root`, password kosong).
5. Buka `http://localhost/todo/` (wajib `localhost` atau HTTPS agar Service Worker aktif).

## Teknologi

PHP 8, MySQL, HTML, CSS, JavaScript (Service Worker, Cache API, Web App Manifest, Media Capture API, Notification API).
