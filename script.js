// script.js : sisi klien (tema, kamera -> input file, notifikasi pengingat).
// Seluruh data kini disimpan di database lewat PHP, bukan IndexedDB.

const THEME_KEY = "todo-theme";
const $ = (id) => document.getElementById(id);

/* ---------- Tema terang / gelap ---------- */
const themeToggle = $("theme-toggle");

function setTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.textContent = isDark ? "☀️ Mode Terang" : "🌙 Mode Gelap";
    localStorage.setItem(THEME_KEY, theme);
}

const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
setTheme(localStorage.getItem(THEME_KEY) || (prefersDark ? "dark" : "light"));
themeToggle.addEventListener("click", () =>
    setTheme(document.body.classList.contains("dark-mode") ? "light" : "dark")
);

/* ---------- Kamera: hasil foto dimasukkan ke <input type="file"> ---------- */
const fileInput = $("image");
const video = $("camera-preview");
const canvas = $("photo-canvas");
const preview = $("photo-preview");
const camStatus = $("camera-status");
const btnStart = $("start-camera");
const btnShot = $("capture-photo");
const btnStop = $("stop-camera");
let stream = null;

function say(msg, isError = false) {
    camStatus.textContent = msg;
    camStatus.classList.toggle("error", isError);
}

function showPreview(file) {
    if (!file) { preview.hidden = true; return; }
    preview.src = URL.createObjectURL(file);
    preview.hidden = false;
}

async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
        say("Browser tidak mendukung kamera.", true);
        return;
    }
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } },
            audio: false,
        });
        video.srcObject = stream;
        video.hidden = false;
        btnStart.disabled = true;
        btnShot.disabled = false;
        btnStop.disabled = false;
        say("Kamera aktif. Pilih Ambil Gambar.");
    } catch (err) {
        say("Kamera tidak dapat digunakan. Pastikan izin diberikan dan gunakan HTTPS atau localhost.", true);
    }
}

function stopCamera() {
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    video.srcObject = null;
    video.hidden = true;
    btnStart.disabled = false;
    btnShot.disabled = true;
    btnStop.disabled = true;
}

function capturePhoto() {
    if (!stream) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
        if (!blob) { say("Gagal mengambil gambar.", true); return; }
        const file = new File([blob], "foto-tugas.jpg", { type: "image/jpeg" });
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;   // ikut terkirim saat form disubmit
        showPreview(file);
        say("Gambar diambil dan akan disimpan bersama tugas.");
    }, "image/jpeg", 0.8);
}

if (fileInput) {
    btnStart.addEventListener("click", startCamera);
    btnShot.addEventListener("click", capturePhoto);
    btnStop.addEventListener("click", stopCamera);
    fileInput.addEventListener("change", () => showPreview(fileInput.files[0]));
    window.addEventListener("beforeunload", stopCamera);
}

/* ---------- Notifikasi pengingat (aktif selama halaman terbuka) ---------- */
const MAX_DELAY = 2147483647;

function scheduleNotifications() {
    const items = document.querySelectorAll("[data-notify]");
    if (!items.length || !("Notification" in window)) return;

    if (Notification.permission === "default") Notification.requestPermission();

    items.forEach((el) => {
        const when = new Date(el.dataset.notify.replace(" ", "T")).getTime();
        const delay = when - Date.now();
        if (delay <= 0 || delay > MAX_DELAY) return;

        setTimeout(() => {
            if (Notification.permission === "granted") {
                new Notification("Pengingat: " + el.dataset.title, {
                    body: "Jangan lupa mengerjakan tugas ini.",
                });
            }
        }, delay);
    });
}
scheduleNotifications();
