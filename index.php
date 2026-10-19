<?php
/**
 * index.php : front controller.
 * Urutan: config -> actions (POST) -> header -> menubar -> content -> footer
 *
 * Halaman: index.php?page=personal | index.php?page=shared
 */
require_once 'config.php';
require_once 'actions.php';

$page = ($_GET['page'] ?? 'personal') === 'shared' ? 'shared' : 'personal';
$user = current_user();

// Mode edit: ?edit=ID (hanya jika pengguna berhak)
$editTask = null;
if (isset($_GET['edit'])) {
    $editTask = find_accessible_task((int) $_GET['edit'], (int) $user['id']);
}

$pageTitle = $page === 'shared' ? 'Shared' : 'Personal';

include 'header.php';
include 'menubar.php';
include 'content.php';
include 'footer.php';
