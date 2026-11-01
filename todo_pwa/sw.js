/**
 * sw.js : Service Worker Todo App (PWA)
 *
 * Strategi cache per jenis resource:
 *  1. Navigasi halaman (index.php)  -> Network First (data selalu terbaru, cadangan dari cache,
 *                                      terakhir halaman offline.html)
 *  2. CSS & JS (app shell)          -> Stale-While-Revalidate (cepat, lalu diperbarui di belakang layar)
 *  3. Gambar (ikon + uploads/)      -> Cache First (jarang berubah), dibatasi jumlahnya
 *  4. Selain GET (POST/form)        -> tidak disentuh, langsung ke jaringan
 *
 * Naikkan CACHE_VERSION setiap kali daftar APP_SHELL berubah agar cache lama dibersihkan.
 */
const CACHE_VERSION = "v2";
const SHELL_CACHE = `todo-shell-${CACHE_VERSION}`;   // app shell hasil precache
const PAGES_CACHE = `todo-pages-${CACHE_VERSION}`;   // halaman PHP yang pernah dibuka
const IMAGE_CACHE = `todo-images-${CACHE_VERSION}`;  // gambar tugas & ikon

const OFFLINE_URL = "offline.html";
const NETWORK_TIMEOUT_MS = 4000;
const MAX_IMAGES = 60;
const MAX_PAGES = 20;

// Path relatif terhadap lokasi sw.js, jadi aman dipakai di http://localhost/todo/
const APP_SHELL = [
    "offline.html",
    "style.css",
    "sidebar.css",
    "pwa.css",
    "script.js",
    "pwa.js",
    "manifest.webmanifest",
    "icons/icon-192.png",
    "icons/icon-512.png",
    "icons/icon-maskable-512.png",
    "icons/apple-touch-icon.png"
];

/* ---------- Install: precache app shell ---------- */
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(SHELL_CACHE)
            // cache: "reload" memastikan file diambil dari server, bukan dari cache HTTP browser.
            .then((cache) => cache.addAll(APP_SHELL.map((url) => new Request(url, { cache: "reload" }))))
            .then(() => self.skipWaiting())
    );
});

/* ---------- Activate: hapus cache versi lama ---------- */
self.addEventListener("activate", (event) => {
    const keep = [SHELL_CACHE, PAGES_CACHE, IMAGE_CACHE];
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((key) => key.startsWith("todo-") && !keep.includes(key))
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

/* ---------- Fetch: pilih strategi sesuai jenis request ---------- */
self.addEventListener("fetch", (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (request.method !== "GET") return;                 // form POST dsb. tidak di-cache
    if (url.origin !== self.location.origin) return;      // hanya same-origin

    if (request.mode === "navigate") {
        event.respondWith(networkFirstPage(request));
    } else if (request.destination === "image") {
        event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGES));
    } else if (["style", "script", "manifest", "font"].includes(request.destination)) {
        event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
    }
});

/* ---------- Strategi ---------- */

// Network First untuk halaman: coba jaringan dulu (maks. 4 detik), jika gagal pakai cache.
async function networkFirstPage(request) {
    const cache = await caches.open(PAGES_CACHE);
    try {
        const response = await fetchWithTimeout(request, NETWORK_TIMEOUT_MS);
        // Simpan hanya respons normal (bukan redirect / error) agar aman dipakai ulang.
        if (response.ok && !response.redirected) {
            cache.put(request, response.clone()).then(() => trimCache(PAGES_CACHE, MAX_PAGES));
        }
        return response;
    } catch (error) {
        const cached = await cache.match(request);
        if (cached) return cached;
        const offline = await caches.match(OFFLINE_URL);
        return offline || new Response("Anda sedang offline.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
    }
}

// Stale-While-Revalidate: tampilkan cache langsung, sambil memperbarui cache dari jaringan.
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const refresh = fetch(request)
        .then((response) => {
            if (response && response.ok) cache.put(request, response.clone());
            return response;
        })
        .catch(() => undefined);

    return cached || (await refresh) || Response.error();
}

// Cache First: pakai cache jika ada, kalau belum ada ambil dari jaringan lalu simpan.
async function cacheFirst(request, cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone()).then(() => trimCache(cacheName, maxEntries));
        }
        return response;
    } catch (error) {
        return Response.error();
    }
}

/* ---------- Fungsi bantu ---------- */

function fetchWithTimeout(request, ms) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("timeout")), ms);
        fetch(request).then(
            (response) => { clearTimeout(timer); resolve(response); },
            (error) => { clearTimeout(timer); reject(error); }
        );
    });
}

// Hapus entri paling lama bila jumlah melebihi batas.
async function trimCache(cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxEntries) {
        await cache.delete(keys[0]);
        return trimCache(cacheName, maxEntries);
    }
}

/* ---------- Pesan dari halaman ---------- */
self.addEventListener("message", (event) => {
    if (event.data === "SKIP_WAITING") self.skipWaiting();
    // Dipakai saat ganti pengguna agar halaman milik pengguna sebelumnya tidak tampil offline.
    if (event.data === "CLEAR_PAGES") event.waitUntil(caches.delete(PAGES_CACHE));
});

/* ---------- Klik notifikasi ---------- */
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
            for (const client of list) {
                if ("focus" in client) return client.focus();
            }
            return clients.openWindow ? clients.openWindow("./") : undefined;
        })
    );
});
