<?php
/**
 * config.php
 * Konfigurasi aplikasi: koneksi database (PDO), session, dan fungsi bantu.
 */
session_start();

define('DB_HOST', 'localhost');
define('DB_NAME', 'todo_app');
define('DB_USER', 'root');
define('DB_PASS', '');

define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('UPLOAD_URL', 'uploads/');
define('MAX_UPLOAD_BYTES', 2 * 1024 * 1024); // 2 MB

/** Koneksi PDO (singleton). */
function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

/** Escape output HTML (mencegah XSS). */
function e($value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function redirect(string $url): void
{
    header('Location: ' . $url);
    exit;
}

/** Pesan sekali tampil (flash message). */
function flash(string $message, string $type = 'success'): void
{
    $_SESSION['flash'] = ['message' => $message, 'type' => $type];
}

function pull_flash(): ?array
{
    $f = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);
    return $f;
}

/** CSRF token. */
function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">';
}

function csrf_check(): void
{
    $token = $_POST['csrf'] ?? '';
    if (!hash_equals($_SESSION['csrf'] ?? '', $token)) {
        http_response_code(403);
        exit('Token CSRF tidak valid.');
    }
}

/** Pengguna aktif (tanpa login; dipilih lewat dropdown di sidebar). */
function current_user(): array
{
    $id = $_SESSION['user_id'] ?? 1;
    $stmt = db()->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$id]);
    $user = $stmt->fetch();
    if (!$user) {
        $user = db()->query('SELECT * FROM users ORDER BY id LIMIT 1')->fetch();
        $_SESSION['user_id'] = $user['id'];
    }
    return $user;
}

function all_users(): array
{
    return db()->query('SELECT id, name FROM users ORDER BY name')->fetchAll();
}

function format_date(?string $date): string
{
    if (!$date) return '';
    return date('d/m/Y', strtotime($date));
}
