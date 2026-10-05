# 5025251040_Todo-App
Nurmaida Intan Permadani
Teknik Informatika

# Deskripsi Tugas

Pada tugas ini, aplikasi **To Do List Mahasiswa Informatika** dikembangkan dengan menambahkan beberapa fitur sesuai dengan kriteria Web API dan accessibility. Data todo yang sebelumnya hanya disimpan sementara pada JavaScript kini disimpan menggunakan **IndexedDB**, sedangkan preferensi pengguna seperti mode terang dan gelap disimpan menggunakan **localStorage**. Aplikasi juga dilengkapi fitur pengambilan gambar tugas menggunakan kamera melalui **Media Capture API** serta fitur waktu pengingat tugas menggunakan **Notification API dan Service Worker**.

Selain itu, tampilan dan komponen aplikasi diperbaiki agar lebih **accessible**, seperti penggunaan semantic HTML, label pada input, ARIA attributes, keyboard focus, skip link, alternative text pada gambar, serta responsive design. Dengan penambahan tersebut, aplikasi tidak hanya dapat digunakan untuk mengelola tugas, tetapi juga memiliki penyimpanan data yang lebih baik, fitur kamera dan notifikasi, serta lebih mudah digunakan oleh berbagai pengguna.

# Pembahasan Kode

## 1. IndexedDB untuk Penyimpanan Data Todo

Pada implementasi sebelumnya, data tugas disimpan dalam variabel `tasks`. Pada versi terbaru, penyimpanan tersebut diganti menggunakan IndexedDB agar data tetap tersimpan meskipun halaman di-refresh.

```javascript
const DB_NAME = "todo-mahasiswa-db";
const DB_VERSION = 1;
const STORE_NAME = "tasks";
```

Database dibuka menggunakan `indexedDB.open()`, kemudian dibuat object store `tasks` dengan `id` sebagai key. Fungsi seperti `saveTask()`, `getAllTasks()`, dan `removeTaskFromDB()` digunakan untuk menambah, mengambil, dan menghapus data tugas.

Setiap tugas sekarang menyimpan beberapa informasi, yaitu `name`, `deadline`, `desc`, `completed`, `image`, dan `notificationTime`.

---

## 2. localStorage untuk Light/Dark Mode

Preferensi tampilan pengguna disimpan menggunakan `localStorage`. Key yang digunakan adalah:

```javascript
const THEME_KEY = "todo-theme";
```

Ketika pengguna mengganti mode tampilan, nilai tema disimpan menggunakan:

```javascript
localStorage.setItem(THEME_KEY, "dark");
```

atau:

```javascript
localStorage.setItem(THEME_KEY, "light");
```

Kemudian ketika halaman dibuka kembali, aplikasi membaca nilai tersebut sehingga pilihan Light/Dark Mode pengguna tetap tersimpan.

---

## 3. Media Capture API untuk Mengambil Gambar

Pada form todo ditambahkan bagian **Gambar Tugas**. Kamera perangkat diakses menggunakan Media Capture API melalui:

```javascript
navigator.mediaDevices.getUserMedia()
```

Ketika pengguna memilih **Buka Kamera**, stream kamera ditampilkan pada elemen `<video>`. Setelah itu pengguna dapat menekan **Ambil Gambar**.

Frame dari video kemudian digambar ke `<canvas>` menggunakan:

```javascript
context.drawImage(
    cameraPreview,
    0,
    0,
    width,
    height
);
```

Hasil gambar dikonversi menjadi data URL menggunakan:

```javascript
photoCanvas.toDataURL("image/jpeg", 0.8);
```

Gambar tersebut kemudian disimpan sebagai bagian dari data todo dan disimpan di IndexedDB.

---

## 4. Service Worker

Service Worker ditambahkan melalui file baru bernama `sw.js`. File tersebut didaftarkan pada `script.js` menggunakan:

```javascript
navigator.serviceWorker.register("./sw.js");
```

Service Worker digunakan untuk melakukan caching terhadap file utama aplikasi seperti `index.html`, `style.css`, dan `script.js`.

```javascript
const CACHE_NAME = "todo-mahasiswa-v1";
```

Dengan adanya Service Worker, aplikasi memiliki mekanisme caching sehingga resource yang sudah disimpan dapat digunakan kembali oleh browser.

---

## 5. Waktu Notifikasi Todo

Pada form todo ditambahkan input:

```html
<input
    type="datetime-local"
    id="notifikasi"
    name="notifikasi">
```

Input tersebut digunakan untuk menentukan waktu pengingat tugas. Nilainya kemudian disimpan pada properti `notificationTime`.

Aplikasi menggunakan Notification API untuk meminta izin notifikasi:

```javascript
Notification.requestPermission();
```

Jika izin diberikan, notifikasi ditampilkan melalui Service Worker menggunakan:

```javascript
registration.showNotification(...)
```

Dengan demikian, pengguna dapat memperoleh pengingat ketika waktu yang telah ditentukan untuk tugas telah tercapai.

---

## 6. Accessibility

Beberapa perbaikan accessibility ditambahkan pada aplikasi. Salah satunya adalah **skip link**:

```html
<a class="skip-link" href="#main-content">
    Lewati ke konten utama
</a>
```

Skip link membantu pengguna keyboard langsung menuju bagian utama halaman.

Setiap input juga diberikan label yang sesuai, misalnya:

```html
<label for="nama-tugas">Nama Tugas</label>
<input id="nama-tugas">
```

Selain itu digunakan atribut ARIA seperti `aria-label`, `aria-live`, dan `aria-pressed` untuk memberikan informasi tambahan kepada assistive technology.

CSS juga memberikan indikator ketika elemen mendapatkan focus:

```css
button:focus-visible,
input:focus-visible,
textarea:focus-visible {
    outline: 3px solid #005fcc;
    outline-offset: 2px;
}
```

Aplikasi juga menerapkan `prefers-reduced-motion` untuk pengguna yang memilih mengurangi animasi serta menggunakan `alt` pada gambar agar informasi gambar dapat dipahami oleh screen reader.

---

## 7. Responsive Design

CSS juga diperbarui agar aplikasi dapat digunakan pada berbagai ukuran layar. Pada layar dengan lebar maksimal 768px, layout utama diubah dari dua kolom menjadi satu kolom:

```css
@media (max-width: 768px) {
    main {
        flex-direction: column;
    }
}
```

Dengan demikian, aplikasi tetap nyaman digunakan pada laptop maupun perangkat mobile.
