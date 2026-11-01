<?php
/**
 * actions.php
 * Menangani semua aksi POST: tambah, ubah, hapus, toggle selesai, ganti pengguna.
 * Dipanggil dari index.php sebelum ada output HTML.
 */

/** Simpan gambar upload; return nama file atau null. Melempar RuntimeException bila gagal. */
function handle_upload(string $field): ?string
{
    if (empty($_FILES[$field]) || $_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    $file = $_FILES[$field];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Upload gambar gagal (kode ' . $file['error'] . ').');
    }
    if ($file['size'] > MAX_UPLOAD_BYTES) {
        throw new RuntimeException('Ukuran gambar maksimal 2 MB.');
    }

    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    if (!isset($allowed[$mime])) {
        throw new RuntimeException('Format gambar harus JPG, PNG, atau WEBP.');
    }

    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }
    $name = bin2hex(random_bytes(12)) . '.' . $allowed[$mime];
    if (!move_uploaded_file($file['tmp_name'], UPLOAD_DIR . $name)) {
        throw new RuntimeException('Gagal menyimpan file ke server.');
    }
    return $name;
}

function delete_image(?string $name): void
{
    if ($name && is_file(UPLOAD_DIR . basename($name))) {
        unlink(UPLOAD_DIR . basename($name));
    }
}

/** Ambil tugas jika pengguna berhak mengaksesnya. */
function find_accessible_task(int $id, int $userId): ?array
{
    $stmt = db()->prepare(
        "SELECT * FROM tasks WHERE id = ? AND (scope = 'shared' OR user_id = ?)"
    );
    $stmt->execute([$id, $userId]);
    return $stmt->fetch() ?: null;
}

function clean_datetime(?string $v): ?string
{
    return $v ? str_replace('T', ' ', $v) . ':00' : null;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();

    $action = $_POST['action'] ?? '';
    $user   = current_user();
    $scope  = ($_POST['scope'] ?? 'personal') === 'shared' ? 'shared' : 'personal';
    $back   = 'index.php?page=' . $scope;

    try {
        switch ($action) {

            case 'switch_user':
                $_SESSION['user_id'] = (int) ($_POST['user_id'] ?? 1);
                redirect($_POST['return'] ?? 'index.php');

            case 'create':
                $title = trim($_POST['title'] ?? '');
                if ($title === '') {
                    throw new RuntimeException('Nama tugas tidak boleh kosong.');
                }
                $image = handle_upload('image');
                $stmt = db()->prepare(
                    'INSERT INTO tasks (user_id, scope, title, description, deadline, notification_time, image)
                     VALUES (?, ?, ?, ?, ?, ?, ?)'
                );
                $stmt->execute([
                    $user['id'], $scope, $title,
                    trim($_POST['description'] ?? '') ?: null,
                    $_POST['deadline'] ?: null,
                    clean_datetime($_POST['notification_time'] ?? null),
                    $image,
                ]);
                flash('Tugas berhasil ditambahkan.');
                redirect($back);

            case 'update':
                $id   = (int) $_POST['id'];
                $task = find_accessible_task($id, (int) $user['id']);
                if (!$task) throw new RuntimeException('Tugas tidak ditemukan.');

                $title = trim($_POST['title'] ?? '');
                if ($title === '') throw new RuntimeException('Nama tugas tidak boleh kosong.');

                $image = $task['image'];
                if (!empty($_POST['remove_image'])) {
                    delete_image($image);
                    $image = null;
                }
                $new = handle_upload('image');
                if ($new) {
                    delete_image($image);
                    $image = $new;
                }

                $stmt = db()->prepare(
                    'UPDATE tasks SET title=?, description=?, deadline=?, notification_time=?, image=? WHERE id=?'
                );
                $stmt->execute([
                    $title,
                    trim($_POST['description'] ?? '') ?: null,
                    $_POST['deadline'] ?: null,
                    clean_datetime($_POST['notification_time'] ?? null),
                    $image,
                    $id,
                ]);
                flash('Perubahan berhasil disimpan.');
                redirect('index.php?page=' . $task['scope']);

            case 'toggle':
                $id   = (int) $_POST['id'];
                $task = find_accessible_task($id, (int) $user['id']);
                if (!$task) throw new RuntimeException('Tugas tidak ditemukan.');
                db()->prepare('UPDATE tasks SET completed = 1 - completed WHERE id = ?')->execute([$id]);
                redirect('index.php?page=' . $task['scope']);

            case 'delete':
                $id   = (int) $_POST['id'];
                $task = find_accessible_task($id, (int) $user['id']);
                if (!$task) throw new RuntimeException('Tugas tidak ditemukan.');
                // Hanya pembuat tugas yang boleh menghapus (termasuk tugas shared).
                if ((int) $task['user_id'] !== (int) $user['id']) {
                    throw new RuntimeException('Hanya pembuat tugas yang dapat menghapusnya.');
                }
                delete_image($task['image']);
                db()->prepare('DELETE FROM tasks WHERE id = ?')->execute([$id]);
                flash('Tugas berhasil dihapus.');
                redirect('index.php?page=' . $task['scope']);
        }
    } catch (RuntimeException $ex) {
        flash($ex->getMessage(), 'error');
        redirect($back);
    }
}
