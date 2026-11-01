-- data.sql : struktur database + data dummy untuk Todo App
-- Cara import: mysql -u root -p < data.sql   (atau lewat phpMyAdmin > Import)

CREATE DATABASE IF NOT EXISTS todo_app
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE todo_app;

DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE tasks (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id           INT UNSIGNED NOT NULL,                 -- pembuat tugas
  scope             ENUM('personal','shared') NOT NULL DEFAULT 'personal',
  title             VARCHAR(150) NOT NULL,
  description       TEXT NULL,
  deadline          DATE NULL,
  notification_time DATETIME NULL,
  image             VARCHAR(255) NULL,                     -- nama file di folder uploads/
  completed         TINYINT(1) NOT NULL DEFAULT 0,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_scope (scope),
  INDEX idx_user (user_id),
  CONSTRAINT fk_tasks_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO users (id, name, email) VALUES
  (1, 'Andi Pratama',  'andi@example.com'),
  (2, 'Budi Santoso',  'budi@example.com'),
  (3, 'Citra Lestari', 'citra@example.com');

-- Tugas personal (hanya terlihat oleh pemiliknya)
INSERT INTO tasks (user_id, scope, title, description, deadline, completed) VALUES
  (1, 'personal', 'Tugas Pemrograman Web',     'Membuat antarmuka web menggunakan HTML dan CSS.', '2026-10-25', 0),
  (1, 'personal', 'Tugas Matematika Diskrit',  'Mengerjakan latihan bab logika dan himpunan.',    '2026-10-28', 0),
  (1, 'personal', 'Tugas Teori Graf',          NULL,                                              NULL,         1),
  (2, 'personal', 'Tugas KKA',                 'Ringkasan materi kecerdasan buatan.',             '2026-10-30', 0),
  (3, 'personal', 'Tugas Jaringan Komputer',   'Simulasi topologi jaringan di Packet Tracer.',    '2026-11-02', 0);

-- Tugas bersama (terlihat oleh semua anggota organisasi)
INSERT INTO tasks (user_id, scope, title, description, deadline, completed) VALUES
  (1, 'shared', 'Proyek Kelompok KPPL',        'Menyusun dokumen SRS bersama tim.',               '2026-11-05', 0),
  (2, 'shared', 'Persiapan Seminar Informatika','Menyiapkan rundown dan konsumsi acara.',         '2026-11-10', 0),
  (3, 'shared', 'Rapat Mingguan Himpunan',     'Agenda: evaluasi program kerja bulan ini.',       '2026-10-23', 1);
