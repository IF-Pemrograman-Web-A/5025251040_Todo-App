// pwa.js : registrasi Service Worker, tombol install, dan indikator offline.

(function () {
    "use strict";

    /* ---------- Registrasi Service Worker ---------- */
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", function () {
            navigator.serviceWorker.register("sw.js").then(
                function (reg) { console.log("Service Worker aktif. Scope:", reg.scope); },
                function (err) { console.error("Service Worker gagal didaftarkan:", err); }
            );
        });
    } else {
        console.warn("Browser tidak mendukung Service Worker.");
    }

    /* ---------- Tombol Install ---------- */
    var installBtn = document.getElementById("install-btn");
    var deferredPrompt = null;

    // Chrome/Edge memicu event ini saat aplikasi memenuhi syarat untuk di-install.
    window.addEventListener("beforeinstallprompt", function (event) {
        event.preventDefault();            // tahan prompt bawaan, kita tampilkan lewat tombol sendiri
        deferredPrompt = event;
        if (installBtn) installBtn.hidden = false;
    });

    if (installBtn) {
        installBtn.addEventListener("click", async function () {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            var choice = await deferredPrompt.userChoice;
            console.log("Pilihan install:", choice.outcome);
            deferredPrompt = null;
            installBtn.hidden = true;      // prompt hanya bisa dipakai sekali
        });
    }

    window.addEventListener("appinstalled", function () {
        deferredPrompt = null;
        if (installBtn) installBtn.hidden = true;
        console.log("Aplikasi berhasil di-install.");
    });

    /* ---------- Indikator online / offline ---------- */
    var banner = document.getElementById("offline-banner");

    function updateOnlineStatus() {
        if (!banner) return;
        banner.hidden = navigator.onLine;
    }
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    updateOnlineStatus();

    /* ---------- Bersihkan cache halaman saat ganti pengguna ---------- */
    // Halaman PHP berisi data milik pengguna aktif; jangan sampai tampil offline untuk pengguna lain.
    var switchForm = document.querySelector(".user-switch");
    if (switchForm && "serviceWorker" in navigator) {
        switchForm.addEventListener("submit", function () {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage("CLEAR_PAGES");
            }
        });
    }
})();
