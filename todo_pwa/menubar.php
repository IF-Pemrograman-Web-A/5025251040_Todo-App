<?php
/** menubar.php : sidebar dengan menu Personal & Shared + pemilih pengguna. */
$self = $_SERVER['PHP_SELF'];
?>
<aside class="sidebar" aria-label="Menu utama">
    <nav>
        <ul class="menu">
            <li>
                <a href="index.php?page=personal"
                   class="<?= $page === 'personal' ? 'active' : '' ?>"
                   <?= $page === 'personal' ? 'aria-current="page"' : '' ?>>
                    👤 Personal
                </a>
            </li>
            <li>
                <a href="index.php?page=shared"
                   class="<?= $page === 'shared' ? 'active' : '' ?>"
                   <?= $page === 'shared' ? 'aria-current="page"' : '' ?>>
                    👥 Shared
                </a>
            </li>
        </ul>
    </nav>

    <form method="post" action="index.php" class="user-switch">
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="switch_user">
        <input type="hidden" name="return" value="index.php?page=<?= e($page) ?>">
        <label for="user_id">Masuk sebagai:</label>
        <select id="user_id" name="user_id" onchange="this.form.submit()">
            <?php foreach (all_users() as $u): ?>
                <option value="<?= (int) $u['id'] ?>" <?= $u['id'] == $user['id'] ? 'selected' : '' ?>>
                    <?= e($u['name']) ?>
                </option>
            <?php endforeach; ?>
        </select>
        <noscript><button type="submit" class="secondary-btn">Ganti</button></noscript>
    </form>
</aside>
