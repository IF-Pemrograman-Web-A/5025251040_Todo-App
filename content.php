<?php
/**
 * content.php : daftar tugas (kiri) + form tambah / edit (kanan).
 * Variabel dari index.php: $page, $user, $editTask
 */

if ($page === 'shared') {
    $stmt = db()->prepare(
        "SELECT t.*, u.name AS owner_name FROM tasks t
         JOIN users u ON u.id = t.user_id
         WHERE t.scope = 'shared' ORDER BY t.completed, t.deadline IS NULL, t.deadline, t.id"
    );
    $stmt->execute();
} else {
    $stmt = db()->prepare(
        "SELECT t.*, u.name AS owner_name FROM tasks t
         JOIN users u ON u.id = t.user_id
         WHERE t.scope = 'personal' AND t.user_id = ?
         ORDER BY t.completed, t.deadline IS NULL, t.deadline, t.id"
    );
    $stmt->execute([$user['id']]);
}
$tasks = $stmt->fetchAll();
$flash = pull_flash();
?>
<main id="main-content">
    <section class="panel-kiri" aria-labelledby="task-heading">
        <h2 id="task-heading">
            <?= $page === 'shared' ? 'Tugas Bersama (Shared)' : 'Tugas Personal' ?>
        </h2>
        <p>
            <?= $page === 'shared'
                ? 'Tugas ini terlihat oleh semua anggota. Semua dapat mengubah, hanya pembuat yang dapat menghapus.'
                : 'Tugas ini hanya terlihat oleh Anda (' . e($user['name']) . ').' ?>
        </p>

        <?php if ($flash): ?>
            <p class="status-message <?= $flash['type'] === 'error' ? 'error' : 'ok' ?>" role="status">
                <?= e($flash['message']) ?>
            </p>
        <?php endif; ?>

        <ul id="task-list" aria-label="Daftar tugas">
            <?php if (!$tasks): ?>
                <li>Belum ada tugas.</li>
            <?php endif; ?>

            <?php foreach ($tasks as $t):
                $isOwner = (int) $t['user_id'] === (int) $user['id']; ?>
                <li class="task-item <?= $t['completed'] ? 'completed' : '' ?>"
                    <?= (!$t['completed'] && $t['notification_time'])
                        ? 'data-notify="' . e($t['notification_time']) . '" data-title="' . e($t['title']) . '"' : '' ?>>
                    <div class="task-info">
                        <form method="post" action="index.php" class="inline-form">
                            <?= csrf_field() ?>
                            <input type="hidden" name="action" value="toggle">
                            <input type="hidden" name="id" value="<?= (int) $t['id'] ?>">
                            <input type="checkbox" <?= $t['completed'] ? 'checked' : '' ?>
                                   aria-label="Tandai <?= e($t['title']) ?> sebagai selesai"
                                   onchange="this.form.submit()">
                        </form>
                        <div class="task-text">
                            <span class="task-title"><?= e($t['title']) ?></span>
                            <?php if ($t['deadline']): ?>
                                <span class="task-deadline">Deadline: <?= e(format_date($t['deadline'])) ?></span>
                            <?php endif; ?>
                            <?php if ($page === 'shared'): ?>
                                <span class="task-deadline">Dibuat oleh: <?= e($t['owner_name']) ?></span>
                            <?php endif; ?>
                        </div>
                    </div>

                    <div class="action-buttons">
                        <a class="btn-edit btn-link"
                           href="index.php?page=<?= e($page) ?>&amp;edit=<?= (int) $t['id'] ?>"
                           aria-label="Edit tugas <?= e($t['title']) ?>">Edit</a>

                        <?php if ($isOwner): ?>
                            <form method="post" action="index.php" class="inline-form"
                                  onsubmit="return confirm('Hapus tugas ini?')">
                                <?= csrf_field() ?>
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= (int) $t['id'] ?>">
                                <button type="submit" class="btn-delete"
                                        aria-label="Hapus tugas <?= e($t['title']) ?>">Delete</button>
                            </form>
                        <?php endif; ?>
                    </div>
                </li>
            <?php endforeach; ?>
        </ul>
    </section>

    <section class="panel-kanan" id="panel-form" aria-labelledby="detail-heading">
        <?php if ($editTask): ?>
            <h2 id="detail-heading">Detail &amp; Edit Tugas</h2>
            <form method="post" action="index.php" enctype="multipart/form-data">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="update">
                <input type="hidden" name="id" value="<?= (int) $editTask['id'] ?>">
                <input type="hidden" name="scope" value="<?= e($editTask['scope']) ?>">

                <div class="form-group">
                    <label for="title">Nama Tugas</label>
                    <input type="text" id="title" name="title" value="<?= e($editTask['title']) ?>" required>
                </div>
                <div class="form-group">
                    <label for="deadline">Deadline</label>
                    <input type="date" id="deadline" name="deadline" value="<?= e($editTask['deadline']) ?>">
                </div>
                <div class="form-group">
                    <label for="description">Deskripsi</label>
                    <textarea id="description" name="description" rows="5"><?= e($editTask['description']) ?></textarea>
                </div>
                <div class="form-group">
                    <label for="notification_time">Waktu Notifikasi</label>
                    <input type="datetime-local" id="notification_time" name="notification_time"
                           value="<?= e($editTask['notification_time'] ? date('Y-m-d\TH:i', strtotime($editTask['notification_time'])) : '') ?>">
                </div>

                <?php if ($editTask['image']): ?>
                    <div class="edit-image">
                        <p><strong>Gambar tugas saat ini:</strong></p>
                        <img src="<?= e(UPLOAD_URL . $editTask['image']) ?>"
                             alt="Gambar tugas <?= e($editTask['title']) ?>">
                        <label class="check-label">
                            <input type="checkbox" name="remove_image" value="1"> Hapus gambar ini
                        </label>
                    </div>
                <?php endif; ?>

                <?php include 'partial_image_input.php'; ?>

                <button type="submit" class="primary-btn">Simpan Perubahan</button>
                <p><a href="index.php?page=<?= e($page) ?>">Batal</a></p>
            </form>

        <?php else: ?>
            <h2 id="detail-heading">Tambah Tugas <?= $page === 'shared' ? 'Bersama' : 'Personal' ?></h2>
            <form method="post" action="index.php" enctype="multipart/form-data">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="create">
                <input type="hidden" name="scope" value="<?= e($page) ?>">

                <div class="form-group">
                    <label for="title">Nama Tugas <span aria-hidden="true">*</span></label>
                    <input type="text" id="title" name="title" placeholder="Masukkan nama tugas"
                           autocomplete="off" required>
                </div>
                <div class="form-group">
                    <label for="deadline">Deadline</label>
                    <input type="date" id="deadline" name="deadline">
                </div>
                <div class="form-group">
                    <label for="description">Deskripsi</label>
                    <textarea id="description" name="description" rows="4"
                              placeholder="Masukkan deskripsi tugas"></textarea>
                </div>
                <div class="form-group">
                    <label for="notification_time">Waktu Notifikasi</label>
                    <input type="datetime-local" id="notification_time" name="notification_time">
                    <small>Notifikasi muncul selama halaman ini terbuka. Izin notifikasi browser diperlukan.</small>
                </div>

                <?php include 'partial_image_input.php'; ?>

                <button type="submit" class="primary-btn">Tambah Daftar Tugas</button>
            </form>
        <?php endif; ?>
    </section>
</main>
