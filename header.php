<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="To Do List Mahasiswa Informatika: tugas personal dan tugas bersama.">
    <meta name="theme-color" content="#2c3e50">
    <title><?= e($pageTitle ?? 'To Do List') ?> - To Do List Mahasiswa</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="sidebar.css">
</head>
<body>
    <a class="skip-link" href="#main-content">Lewati ke konten utama</a>

    <header>
        <h1>To Do List Mahasiswa</h1>
        <button id="theme-toggle" class="btn-theme" type="button"
                aria-label="Ubah tampilan terang atau gelap" aria-pressed="false">
            🌙 Mode Gelap
        </button>
    </header>

    <div class="layout">
