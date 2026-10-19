# 5025251040_Todo-App
Nurmaida Intan Permadani
Teknik Informatika

# Deskripsi Tugas

# To Do List Mahasiswa Informatika (PHP + MySQL)

Aplikasi To Do List yang dikembangkan dari versi HTML/JavaScript menjadi aplikasi web berbasis **PHP** dan **MySQL**, sehingga tidak hanya digunakan secara personal tetapi juga dapat dibagikan dalam sebuah organisasi.

## Deskripsi Tugas

Pada tugas ini, Todo App yang sebelumnya menyimpan data di browser (IndexedDB) dikembangkan dengan ketentuan berikut:

1. Menambahkan **menu bar/sidebar** dengan dua menu: **Personal** dan **Shared**.
2. Mengubah HTML ke **PHP** dan membuatnya **modular** (`menubar.php`, `config.php`, `content.php`, dll).
3. Membuat struktur database beserta data dummy dan menyimpannya dalam **`data.sql`**.
4. Mengimplementasikan **CRUD** menggunakan PHP.
5. Menambahkan **file handling** (upload gambar tugas) menggunakan PHP.

## Fitur

- **Personal**: tugas pribadi, hanya terlihat oleh pemiliknya.
- **Shared**: tugas bersama, terlihat oleh semua anggota. Semua anggota dapat mengubah, tetapi hanya pembuat tugas yang dapat menghapus.
- CRUD tugas: tambah, lihat, ubah, hapus, dan tandai selesai.
- Upload gambar tugas (JPG/PNG/WEBP, maks. 2 MB), termasuk pengambilan foto lewat kamera.
- Notifikasi pengingat (aktif selama halaman terbuka).
- Mode terang/gelap dan tampilan responsif.
- Pemilih pengguna di sidebar ("Masuk sebagai") untuk mensimulasikan banyak pengguna tanpa sistem login.

## Struktur File

| File | Penjelasan |
|---|---|
| `index.php` | Front controller. Menentukan halaman (`personal`/`shared`) dan mode edit, lalu memanggil file lain secara berurutan. |
| `config.php` | Konfigurasi koneksi database (PDO), session, serta fungsi bantu: `e()` untuk escape output, token CSRF, flash message, dan pengambilan pengguna aktif. |
| `actions.php` | Memproses semua aksi POST: `create`, `update`, `delete`, `toggle`, dan `switch_user`, termasuk validasi dan penanganan upload file. |
| `header.php` | Bagian pembuka HTML (`<head>`, judul, tombol tema) dan pembuka layout. |
| `menubar.php` | Sidebar berisi menu **Personal** dan **Shared** serta pemilih pengguna. |
| `content.php` | Konten utama: daftar tugas (Read) dan form tambah/edit (Create/Update). |
| `partial_image_input.php` | Potongan form upload gambar dan kamera, dipakai ulang di form tambah dan edit. |
| `footer.php` | Penutup layout, footer, dan pemanggilan `script.js`. |
| `data.sql` | Struktur database (`users`, `tasks`) beserta data dummy. |
| `style.css` | Gaya utama aplikasi (dari versi sebelumnya). |
| `sidebar.css` | Gaya tambahan untuk sidebar dan elemen baru. |
| `script.js` | JavaScript sisi klien: mode gelap, kamera, dan notifikasi pengingat. |
| `uploads/` | Folder penyimpanan gambar tugas (dibuat otomatis saat upload pertama). |

## Struktur Database

**users**: `id`, `name`, `email`, `created_at`

**tasks**: `id`, `user_id` (relasi ke `users`), `scope` (`personal`/`shared`), `title`, `description`, `deadline`, `notification_time`, `image`, `completed`, `created_at`, `updated_at`

Relasi: satu pengguna dapat memiliki banyak tugas (`tasks.user_id` → `users.id`, `ON DELETE CASCADE`).

## Implementasi CRUD

| Operasi | Cara |
|---|---|
| Create | Form tambah tugas → `INSERT` di `actions.php` |
| Read | `SELECT` di `content.php` (difilter berdasarkan `scope` dan pengguna) |
| Update | Tombol **Edit** (`?edit=ID`) → `UPDATE` di `actions.php` |
| Delete | Tombol **Delete** dengan konfirmasi → `DELETE` di `actions.php` |

## Keamanan

- **Prepared statement (PDO)** untuk mencegah SQL Injection.
- **`htmlspecialchars`** (fungsi `e()`) untuk mencegah XSS.
- **Token CSRF** pada setiap form POST.
- Validasi upload: tipe file asli (`finfo`), batas ukuran, dan nama file acak.

## Cara Menjalankan

1. Install **Laragon** atau **XAMPP**, lalu nyalakan Apache dan MySQL.
2. Salin seluruh file ke folder `www/todo` (Laragon) atau `htdocs/todo` (XAMPP).
3. Import `data.sql` melalui HeidiSQL atau phpMyAdmin.
4. Sesuaikan `DB_USER` dan `DB_PASS` di `config.php` bila perlu (bawaan: `root`, password kosong).
5. Buka `http://localhost/todo/`.

## Teknologi

PHP 8, MySQL, HTML, CSS, JavaScript (Media Capture API, Notification API).
