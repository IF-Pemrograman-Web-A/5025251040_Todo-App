# 5025251040_Todo-App
Nurmaida Intan Permadani
Teknik Informatika

## Deskripsi Soal
Merancang tampilan sebuah website daftar tugas, dimana dalam pembuatannya hanya diperbolehkan menggunakan HTML dan CSS saja. Sehingga website yang akan dibuat bersifat statis (hanya tampilan saja)

Struktur yang terdapat dalam rancangan website tersebut harus jelas, seperti :
- header
- main
- aside
- footer

Panel website terbagi menjadi 2
- Panel kiri untuk list mengenai tugas tugas yang harus dikerjakan
- Panel kanan berisi detail mengenai tugas yang harus dikerjakan

Menyertakan form yang digunakan untuk menambahkan daftar tugas terbaru

## Hasil Program 
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/14ef64c6-6357-4f0d-9877-6ed3708f23ac" />

## Penjelasan Program 
index.html
- Bagian <head> : berisi informasi teknis yang tidak tampil langsung di halaman utama web, bagian ini saya isi dengan judul dari website yang ingin dibuat, serta bagian yang bisa digunakan untuk menyantumkan tag untuk memanggil file ```style.css``` yang berisi warna, tata letak, dan desain yang ingin ditampilkan pada file ```index.html```
  
- Bagian <body> : paa bagian ini seluruh elemen dapat dilihat langsung oleh pengguna di layar, dimana saya membaginya menjadi 3 area
  1. header 
  2. main
  3. footer
    
- Membagi konten menjadi 2 panel menggunakan taq ```aside```, dengan memberikan atribut ```class``` agar mudah untuk diatur tata letaknya oleh css
  1. ```<aside class="panel-kiri">``` panel sebelah kiri yang didalamnya berisi 2 hal, yaitu daftar penugasan, dan juga form untuk menambahkan daftar penugasan yang baru
  2. ```<aside class="panel-kanan">``` panel sebelah kanan, dimana dibagian ini seharusnya jika memilih daftar tugas tertentu, maka akan muncul detail penugasan. Namun, pada tampilan yag saya buat masih berupa teks statis untuk penugasan "Pemrograman Web" saja
 

style.css
- Pengaturan dasar
  1. Bintang : ini merupakan aturan dasar untuk keseluruhan elemen
     a. ```margin : 0``` dan ```padding : 0``` digunakan untuk menghapus jarak bawaan dari browser
     b. ```box-sizing: border-box``` memastikan ukuran elemen tidak membengkak saat diberi jarak
  2. body : bagian ini digunakan untuk mengatur gaya umum untuk seluruh halaman web, saya menggunakan font Arial, tingga baris 1.6 dan warna teks yang saya gunakan berwarna abu abu
    
- Header dan Footer
Pada bagian ini saya menggunakan gaya yang sama, dengan memberikan latar belakang gelap, teks berada di tengah dan berwarna putih dan berada di dalam kotak sebesar 20px
  
- Tata letak 2 panel
Pada bagian ```main``` dibuat agar panel bisa berbaris menyamping, memberikan jarak antar panel, serta menempatkan keseluruhan panel di tengah layar
Kemudian saya menambahkan ketentuan perbandingan ukuran, dimana panel kann akan memiliki ruang 2 kali lebih besar daripad panel kiri. Kemudian diberi latar berwarna putih dengan sudut yang melengkung

- Merapikan daftar tugas dan formulir
1. Pada bagian ini, saya mencoba menghilangkan bullet yang berada di sekitar checkbox, serta membuat jarak agar setiap baris tugas tidak berdempetan
2. Pada kolom isian, saya membuat agar kolom input text dan date bisa melebar penuh mengikuti panel yang ada di sebelah kiri
3. Pada kotak checkbox, saya mengatur agar kotak centang ukurannya tetap kecil dan diberikan jarak di sisi kanan agar tidak menempel dengan text
4. Tombol (button), pada bagian ini saya memberikan latar berwarna biru, dengan teks tebal berwarna putih tanpa garis tepi

- Efek interaktif
1. Pada bagian button, ketika mouse diarahkan ke atas tombol warnanya akan berubah menjadi biru yang lebih tua
2. Kemudian saya juga menyantumkan fitur responsif yang daat memberi tahu browser jika lebar layar kurang dari 768px maka tampilannya akan berub menjadi column
