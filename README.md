# 5025251040_Todo-App
Nurmaida Intan Permadani
Teknik Informatika

# Penjelasan Kode: The JavaScript Dungeon (To Do List)

Proyek ini dibangun menggunakan HTML, CSS, dan JavaScript murni (Vanilla JS). Berikut adalah penjelasan untuk setiap bagian utama dari kode yang telah diimplementasikan:

## 1. HTML (`index.html`)
HTML berfungsi sebagai kerangka struktur antarmuka web.

*   **Header & Tombol Tema:**
    Pada bagian `<header>`, terdapat judul aplikasi dan sebuah `<button id="theme-toggle">` yang nantinya akan ditangkap oleh JavaScript untuk memicu perubahan mode Gelap/Terang.
*   **Layout Utama (`<main>`):**
    Membungkus keseluruhan konten web ke dalam dua panel menggunakan tag `<aside>`.
*   **Panel Kiri (`.panel-kiri`):**
    *   Memiliki wadah kosong `<ul id="task-list"></ul>`. Elemen ini sengaja dikosongkan karena daftar tugas akan disuntikkan secara dinamis oleh JavaScript menggunakan DOM Manipulation[cite: 3].
    *   Memiliki `<form>` berisi input teks (`nama-tugas`, `deskripsi`), input kalender (`tanggal`), dan sebuah tombol pelatuk `<button id="add-btn">` untuk menambahkan tugas baru.
*   **Panel Kanan (`#panel-deskripsi`):**
    Berfungsi sebagai ruang dinamis. Secara bawaan hanya menampilkan teks instruksi, namun isi HTML-nya akan ditimpa (di-replace) oleh JavaScript menjadi "Formulir Edit" ketika tombol Edit ditekan.

## 2. CSS (`style.css`)
CSS berfungsi untuk mengatur tata letak, warna, dan responsivitas web.

*   **Layouting (Flexbox):**
    Bagian `main` menggunakan `display: flex; flex-direction: row;` untuk membuat panel kiri dan kanan berdampingan. Panel kiri diatur dengan `flex: 1` dan panel kanan `flex: 2` agar proporsi lebarnya sesuai[cite: 2].
*   **Styling List & Komponen:**
    Setiap `<li>` (baris tugas) diberikan style Flexbox agar teks tugas dan grup tombol (Action Buttons) posisinya sejajar ujung ke ujung (`justify-content: space-between`).
*   **Kelas Bantuan (Utility Classes):**
    *   `.completed-text`: Menambahkan efek coretan (`text-decoration: line-through`) dan warna abu-abu untuk tugas yang sudah selesai.
*   **Dark Mode (`body.dark-mode`):**
    Saat kelas `dark-mode` aktif pada elemen `<body>`, seluruh skema warna latar belakang diubah menjadi gelap (`#1a1a1a`, `#2c3e50`) dan teks menjadi terang. Efek transisi ditambahkan agar perubahannya halus.
*   **Responsivitas (`@media`):**
    Pada layar berukuran kecil (HP), susunan flex diubah menjadi `flex-direction: column` agar panel bertumpuk atas-bawah[cite: 2].

## 3. JavaScript (`script.js`)
JavaScript menangani seluruh logika, interaksi, dan manipulasi data[cite: 3].

*   **Deklarasi Variabel & Data Awal:**
    ```javascript
    let tasks = [ { id: 1, name: "...", ... } ];
    ```
    Data tugas disimpan di dalam variabel tipe Array yang berisi sekumpulan Objek (*Array of Objects*)[cite: 3]. Kita menggunakan `let` (bukan `const`) agar seluruh isi array ini bisa diubah atau ditimpa saat proses penghapusan tugas[cite: 3].

*   **Fungsi `renderTasks()` (Manipulasi DOM):**
    Fungsi ini bertugas "menggambar" data dari array `tasks` ke layar (HTML DOM)[cite: 3].
    *   Pertama, `taskList.innerHTML = ""` digunakan untuk mengosongkan daftar sebelumnya agar tidak terjadi duplikasi.
    *   Menggunakan perulangan `.forEach()`, fungsi ini membuat elemen HTML baru untuk setiap tugas (`createElement("li")`, `createElement("input")` tipe checkbox, dan tombol)[cite: 3].
    *   Setiap tombol yang dibuat langsung disisipkan Event Listener (sensor klik) yang memanggil fungsi spesifik (seperti edit atau hapus)[cite: 3].

*   **Menambah Tugas Baru (`addBtn.addEventListener`):**
    *   Fungsi ini dipicu saat tombol "Tambah" diklik[cite: 3].
    *   `event.preventDefault()` dipanggil agar browser tidak melakukan *refresh* halaman secara otomatis saat tombol form ditekan.
    *   Mengambil nilai dari elemen input, membuat objek tugas baru (dengan `id` unik menggunakan `Date.now()`), memasukkannya ke array `tasks` (`tasks.push()`), lalu memanggil `renderTasks()` agar tugas baru langsung muncul di layar.

*   **Fungsi Hapus (`deleteTask(id)`):**
    Menggunakan metode array `.filter()` untuk menyaring dan membuang objek tugas yang ID-nya cocok dengan tombol yang ditekan. Setelah array diperbarui, layar dirender ulang.

*   **Fungsi Checklist (`toggleComplete(id)`):**
    Mencari data tugas berdasarkan ID menggunakan `.find()`. Jika ketemu, nilai boolean `completed` akan dibalik (dari `false` ke `true`, atau sebaliknya), lalu layar dirender ulang agar CSS coretan (`.completed-text`) aktif.

*   **Fungsi Edit (`showEditPanel(id)`):**
    *   Saat tombol Edit ditekan, JavaScript mencari objek tugas tersebut[cite: 3].
    *   Lalu, JS mengubah isi elemen panel kanan (`panelDeskripsi.innerHTML`) menjadi kumpulan elemen *Formulir Edit*[cite: 3].
    *   Fungsi ini juga menyematkan fungsi klik pada tombol "Simpan Perubahan" di panel kanan. Saat disimpan, nilai dari input Form Edit akan dimasukkan kembali ke array `tasks`, panel kiri dirender ulang, dan panel kanan dikembalikan ke tampilan awal.

*   **Toggle Tema (`themeToggle.addEventListener`):**
    Mendeteksi klik pada tombol tema di header, lalu menjalankan perintah `document.body.classList.toggle("dark-mode")`[cite: 3]. Perintah ini berfungsi menambah atau menghapus kelas `dark-mode` pada tag `<body>`, yang kemudian akan memicu perubahan gaya pada CSS.
