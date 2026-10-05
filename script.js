const DB_NAME = "todo-mahasiswa-db";
const DB_VERSION = 1;
const STORE_NAME = "tasks";
const THEME_KEY = "todo-theme";

let tasks = [];
let db = null;
let cameraStream = null;
let capturedImage = null;
let notificationTimers = new Map();

const taskList = document.getElementById("task-list");
const taskForm = document.getElementById("task-form");
const themeToggle = document.getElementById("theme-toggle");
const panelDeskripsi = document.getElementById("panel-deskripsi");
const formStatus = document.getElementById("form-status");
const cameraStatus = document.getElementById("camera-status");
const storageStatus = document.getElementById("storage-status");

const nameInput = document.getElementById("nama-tugas");
const dateInput = document.getElementById("tanggal");
const descInput = document.getElementById("deskripsi");
const notificationInput = document.getElementById("notifikasi");

const startCameraBtn = document.getElementById("start-camera");
const capturePhotoBtn = document.getElementById("capture-photo");
const stopCameraBtn = document.getElementById("stop-camera");
const cameraPreview = document.getElementById("camera-preview");
const photoCanvas = document.getElementById("photo-canvas");
const photoPreviewContainer = document.getElementById("photo-preview-container");
const photoPreview = document.getElementById("photo-preview");
const removePhotoBtn = document.getElementById("remove-photo");

document.addEventListener("DOMContentLoaded", init);

async function init() {
    applySavedTheme();
    await initIndexedDB();
    await loadTasks();
    renderTasks();
    registerServiceWorker();
    setMinimumNotificationTime();
    updateNotificationTimers();
}

function initIndexedDB() {
    return new Promise((resolve, reject) => {
        if (!("indexedDB" in window)) {
            reject(new Error("IndexedDB tidak didukung browser ini."));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
                store.createIndex("deadline", "deadline", { unique: false });
                store.createIndex("completed", "completed", { unique: false });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            db.onversionchange = () => db.close();
            storageStatus.textContent = "Data tersimpan menggunakan IndexedDB.";
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

function dbRequest(mode, operation) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error("Database belum siap."));
            return;
        }

        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = operation(store);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getAllTasks() {
    return dbRequest("readonly", (store) => store.getAll());
}

async function saveTask(task) {
    await dbRequest("readwrite", (store) => store.put(task));
}

async function removeTaskFromDB(id) {
    await dbRequest("readwrite", (store) => store.delete(id));
}

async function loadTasks() {
    try {
        tasks = await getAllTasks();

        // Data awal hanya dibuat jika IndexedDB masih kosong.
        if (tasks.length === 0) {
            tasks = [
                {
                    id: 1,
                    name: "Tugas Pemrograman Web",
                    deadline: "",
                    desc: "Membuat antarmuka web statis menggunakan HTML dan CSS.",
                    completed: false,
                    image: null,
                    notificationTime: null
                },
                {
                    id: 2,
                    name: "Tugas Matematika Diskrit",
                    deadline: "",
                    desc: "",
                    completed: false,
                    image: null,
                    notificationTime: null
                },
                {
                    id: 3,
                    name: "Tugas Teori Graf",
                    deadline: "",
                    desc: "",
                    completed: false,
                    image: null,
                    notificationTime: null
                },
                {
                    id: 4,
                    name: "Tugas KKA",
                    deadline: "",
                    desc: "",
                    completed: false,
                    image: null,
                    notificationTime: null
                },
                {
                    id: 5,
                    name: "Tugas KPPL",
                    deadline: "",
                    desc: "",
                    completed: false,
                    image: null,
                    notificationTime: null
                },
                {
                    id: 6,
                    name: "Tugas Jaringan Komputer",
                    deadline: "",
                    desc: "",
                    completed: false,
                    image: null,
                    notificationTime: null
                }
            ];

            for (const task of tasks) {
                await saveTask(task);
            }
        }
    } catch (error) {
        console.error(error);
        storageStatus.textContent = "Terjadi masalah saat membuka penyimpanan data.";
        showStatus(formStatus, "Penyimpanan lokal tidak dapat digunakan.", true);
    }
}

function renderTasks() {
    taskList.innerHTML = "";

    if (tasks.length === 0) {
        const empty = document.createElement("li");
        empty.textContent = "Belum ada tugas.";
        taskList.appendChild(empty);
        return;
    }

    tasks
        .sort((a, b) => a.id - b.id)
        .forEach((task) => {
            const li = document.createElement("li");
            li.className = task.completed ? "task-item completed" : "task-item";

            const taskInfo = document.createElement("div");
            taskInfo.className = "task-info";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `task-${task.id}`;
            checkbox.checked = task.completed;
            checkbox.setAttribute("aria-label", `Tandai ${task.name} sebagai selesai`);
            checkbox.addEventListener("change", () => toggleComplete(task.id));

            const label = document.createElement("label");
            label.htmlFor = checkbox.id;

            const title = document.createElement("span");
            title.className = "task-title";
            title.textContent = task.name;

            if (task.deadline) {
                const deadline = document.createElement("span");
                deadline.className = "task-deadline";
                deadline.textContent = `Deadline: ${formatDate(task.deadline)}`;
                label.append(title, deadline);
            } else {
                label.appendChild(title);
            }

            if (task.completed) {
                label.setAttribute("aria-label", `${task.name}, sudah selesai`);
            }

            taskInfo.append(checkbox, label);

            const actionDiv = document.createElement("div");
            actionDiv.className = "action-buttons";

            const editBtn = document.createElement("button");
            editBtn.type = "button";
            editBtn.textContent = "Edit";
            editBtn.className = "btn-edit";
            editBtn.setAttribute("aria-label", `Edit tugas ${task.name}`);
            editBtn.addEventListener("click", () => showEditPanel(task.id));

            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.textContent = "Delete";
            deleteBtn.className = "btn-delete";
            deleteBtn.setAttribute("aria-label", `Hapus tugas ${task.name}`);
            deleteBtn.addEventListener("click", () => deleteTask(task.id));

            actionDiv.append(editBtn, deleteBtn);
            li.append(taskInfo, actionDiv);
            taskList.appendChild(li);
        });
}

taskForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const deadline = dateInput.value;
    const desc = descInput.value.trim();
    const notificationTime = notificationInput.value || null;

    if (!name) {
        showStatus(formStatus, "Nama tugas tidak boleh kosong.", true);
        nameInput.focus();
        return;
    }

    if (notificationTime && new Date(notificationTime).getTime() <= Date.now()) {
        showStatus(formStatus, "Waktu notifikasi harus berada di masa depan.", true);
        notificationInput.focus();
        return;
    }

    if (notificationTime && Notification.permission !== "granted") {
        const permission = await requestNotificationPermission();
        if (permission !== "granted") {
            showStatus(formStatus, "Izin notifikasi ditolak. Tugas tetap dapat disimpan tanpa pengingat.", true);
        }
    }

    const newTask = {
        id: Date.now(),
        name,
        deadline,
        desc,
        completed: false,
        image: capturedImage,
        notificationTime
    };

    try {
        await saveTask(newTask);
        tasks.push(newTask);
        renderTasks();
        scheduleTaskNotification(newTask);

        taskForm.reset();
        clearCapturedPhoto();
        stopCamera();

        showStatus(formStatus, "Tugas berhasil ditambahkan.");
        nameInput.focus();
    } catch (error) {
        console.error(error);
        showStatus(formStatus, "Tugas gagal disimpan.", true);
    }
});

async function toggleComplete(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    task.completed = !task.completed;

    try {
        await saveTask(task);
        renderTasks();

        if (task.completed) {
            cancelTaskNotification(task.id);
        } else {
            scheduleTaskNotification(task);
        }
    } catch (error) {
        console.error(error);
        showStatus(formStatus, "Perubahan status tugas gagal disimpan.", true);
    }
}

async function deleteTask(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    const confirmed = window.confirm(`Hapus tugas "${task.name}"?`);
    if (!confirmed) return;

    try {
        await removeTaskFromDB(id);
        tasks = tasks.filter((item) => item.id !== id);
        cancelTaskNotification(id);
        renderTasks();

        panelDeskripsi.innerHTML = `
            <h2 id="detail-heading">Deskripsi Tugas</h2>
            <p>Tugas berhasil dihapus.</p>
        `;

        showStatus(formStatus, "Tugas berhasil dihapus.");
    } catch (error) {
        console.error(error);
        showStatus(formStatus, "Tugas gagal dihapus.", true);
    }
}

function showEditPanel(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    panelDeskripsi.innerHTML = `
        <h2 id="detail-heading">Detail &amp; Edit Tugas</h2>
        <form id="edit-form">
            <div class="form-group">
                <label for="edit-name">Nama Tugas</label>
                <input type="text" id="edit-name" value="${escapeHtml(task.name)}" required>
            </div>

            <div class="form-group">
                <label for="edit-deadline">Deadline</label>
                <input type="date" id="edit-deadline" value="${escapeHtml(task.deadline || "")}">
            </div>

            <div class="form-group">
                <label for="edit-desc">Deskripsi</label>
                <textarea id="edit-desc" rows="5" placeholder="Tambahkan deskripsi tugas">${escapeHtml(task.desc || "")}</textarea>
            </div>

            <div class="form-group">
                <label for="edit-notification">Waktu Notifikasi</label>
                <input type="datetime-local" id="edit-notification" value="${escapeHtml(task.notificationTime || "")}">
            </div>

            ${task.image ? `
                <div class="edit-image">
                    <p><strong>Gambar tugas:</strong></p>
                    <img src="${task.image}" alt="Gambar yang tersimpan untuk tugas ${escapeHtml(task.name)}">
                </div>
            ` : "<p>Tidak ada gambar tugas.</p>"}

            <button type="submit" class="primary-btn">Simpan Perubahan</button>
            <p id="edit-status" class="status-message" aria-live="polite"></p>
        </form>
    `;

    const editForm = document.getElementById("edit-form");

    editForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const newName = document.getElementById("edit-name").value.trim();
        const newNotification = document.getElementById("edit-notification").value || null;

        if (!newName) {
            showStatus(document.getElementById("edit-status"), "Nama tugas tidak boleh kosong.", true);
            document.getElementById("edit-name").focus();
            return;
        }

        if (newNotification && new Date(newNotification).getTime() <= Date.now()) {
            showStatus(document.getElementById("edit-status"), "Waktu notifikasi harus berada di masa depan.", true);
            document.getElementById("edit-notification").focus();
            return;
        }

        if (newNotification && Notification.permission !== "granted") {
            await requestNotificationPermission();
        }

        task.name = newName;
        task.deadline = document.getElementById("edit-deadline").value;
        task.desc = document.getElementById("edit-desc").value.trim();
        task.notificationTime = newNotification;

        try {
            await saveTask(task);
            renderTasks();
            updateNotificationTimers();

            panelDeskripsi.innerHTML = `
                <h2 id="detail-heading">Deskripsi Tugas</h2>
                <p>Perubahan berhasil disimpan.</p>
                <p>Pilih <strong>Edit</strong> pada tugas lain untuk melihat detailnya.</p>
            `;
        } catch (error) {
            console.error(error);
            showStatus(document.getElementById("edit-status"), "Perubahan gagal disimpan.", true);
        }
    });

    document.getElementById("edit-name").focus();
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatDate(value) {
    if (!value) return "";
    const date = new Date(`${value}T00:00:00`);
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(date);
}

// =========================
// Light / Dark Mode
// =========================

function applySavedTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const theme = savedTheme || (prefersDark ? "dark" : "light");

    setTheme(theme);
}

function setTheme(theme) {
    const isDark = theme === "dark";

    document.body.classList.toggle("dark-mode", isDark);
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.textContent = isDark ? "☀️ Mode Terang" : "🌙 Mode Gelap";

    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}

themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-mode");
    setTheme(isDark ? "light" : "dark");
});

// =========================
// Media Capture API
// =========================

startCameraBtn.addEventListener("click", startCamera);
capturePhotoBtn.addEventListener("click", capturePhoto);
stopCameraBtn.addEventListener("click", stopCamera);
removePhotoBtn.addEventListener("click", clearCapturedPhoto);

async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showCameraStatus("Browser tidak mendukung Media Capture API.", true);
        return;
    }

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: "environment" },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });

        cameraPreview.srcObject = cameraStream;
        cameraPreview.hidden = false;

        startCameraBtn.disabled = true;
        capturePhotoBtn.disabled = false;
        stopCameraBtn.disabled = false;

        showCameraStatus("Kamera aktif. Arahkan kamera ke objek tugas lalu pilih Ambil Gambar.");
    } catch (error) {
        console.error(error);
        showCameraStatus(
            "Kamera tidak dapat digunakan. Pastikan izin kamera diberikan dan halaman dijalankan melalui HTTPS atau localhost.",
            true
        );
    }
}

function capturePhoto() {
    if (!cameraStream) return;

    const width = cameraPreview.videoWidth || 640;
    const height = cameraPreview.videoHeight || 480;

    photoCanvas.width = width;
    photoCanvas.height = height;

    const context = photoCanvas.getContext("2d");
    context.drawImage(cameraPreview, 0, 0, width, height);

    capturedImage = photoCanvas.toDataURL("image/jpeg", 0.8);
    photoPreview.src = capturedImage;
    photoPreviewContainer.hidden = false;

    showCameraStatus("Gambar berhasil diambil dan siap disimpan bersama tugas.");
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        cameraStream = null;
    }

    cameraPreview.srcObject = null;
    cameraPreview.hidden = true;

    startCameraBtn.disabled = false;
    capturePhotoBtn.disabled = true;
    stopCameraBtn.disabled = true;
}

function clearCapturedPhoto() {
    capturedImage = null;
    photoPreview.src = "";
    photoPreviewContainer.hidden = true;
}

function showCameraStatus(message, isError = false) {
    cameraStatus.textContent = message;
    cameraStatus.classList.toggle("error", isError);
}

// =========================
// Notification + Service Worker
// =========================

async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
        console.warn("Service Worker tidak didukung browser.");
        return;
    }

    try {
        await navigator.serviceWorker.register("./sw.js");
        console.log("Service Worker berhasil didaftarkan.");
    } catch (error) {
        console.error("Service Worker gagal didaftarkan:", error);
    }
}

async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        return "denied";
    }

    if (Notification.permission === "default") {
        return Notification.requestPermission();
    }

    return Notification.permission;
}

async function showNotification(task) {
    if (!("Notification" in window) || Notification.permission !== "granted") {
        return;
    }

    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification(`Pengingat: ${task.name}`, {
        body: task.deadline
            ? `Deadline: ${formatDate(task.deadline)}`
            : "Jangan lupa mengerjakan tugas ini.",
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%232c3e50'/%3E%3Cpath d='M25 50l15 15 35-35' stroke='white' stroke-width='10' fill='none'/%3E%3C/svg%3E",
        tag: `todo-${task.id}`,
        requireInteraction: false
    });
}

function scheduleTaskNotification(task) {
    cancelTaskNotification(task.id);

    if (!task.notificationTime || task.completed) return;

    const timestamp = new Date(task.notificationTime).getTime();
    const delay = timestamp - Date.now();

    if (delay <= 0 || delay > 2147483647) {
        // Jika lebih dari batas setTimeout, update timer nanti.
        if (delay > 2147483647) {
            const timer = setTimeout(() => scheduleTaskNotification(task), 2147483647);
            notificationTimers.set(task.id, timer);
        }
        return;
    }

    const timer = setTimeout(async () => {
        await showNotification(task);
        notificationTimers.delete(task.id);
    }, delay);

    notificationTimers.set(task.id, timer);
}

function cancelTaskNotification(id) {
    const timer = notificationTimers.get(id);
    if (timer) {
        clearTimeout(timer);
        notificationTimers.delete(id);
    }
}

function updateNotificationTimers() {
    notificationTimers.forEach((timer, id) => {
        clearTimeout(timer);
        notificationTimers.delete(id);
    });

    tasks.forEach(scheduleTaskNotification);
}

function setMinimumNotificationTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    notificationInput.min = now.toISOString().slice(0, 16);
}

function showStatus(element, message, isError = false) {
    element.textContent = message;
    element.classList.toggle("error", isError);
}

// Update batas minimum setiap menit.
setInterval(setMinimumNotificationTime, 60000);

// Stop camera when leaving the page.
window.addEventListener("beforeunload", stopCamera);
