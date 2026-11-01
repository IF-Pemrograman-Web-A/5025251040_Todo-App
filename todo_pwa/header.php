<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="To Do List Mahasiswa Informatika: tugas personal dan tugas bersama.">
    <meta name="theme-color" content="#2c3e50">
    <title><?= e($pageTitle ?? 'To Do List') ?> - To Do List Mahasiswa</title>

    <!-- PWA -->
    <link rel="manifest" href="manifest.webmanifest">
    <link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
    <link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="Todo Mahasiswa">

    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="sidebar.css">
    <link rel="stylesheet" href="pwa.css">
</head>
<body>
    <a class="skip-link" href="#main-content">Lewati ke konten utama</a>

    <header>
        <h1>To Do List Mahasiswa</h1>
        <div class="header-actions">
            <button id="theme-toggle" class="btn-theme" type="button"
                    aria-label="Ubah tampilan terang atau gelap" aria-pressed="false">
                🌙 Mode Gelap
            </button>
            <!-- Tersembunyi sampai browser menyatakan aplikasi siap di-install (lihat pwa.js) -->
            <button id="install-btn" class="btn-install" type="button" hidden>
                ⬇️ Install Aplikasi
            </button>
        </div>
    </header>

    <p id="offline-banner" class="offline-banner" role="status" hidden>
        Anda sedang offline. Halaman yang pernah dibuka tetap tersedia, tetapi perubahan data belum dapat disimpan.
    </p>

    <div class="layout">
