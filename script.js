// PASTIKAN MENGGUNAKAN 'let' agar data bisa ditimpa saat di-delete
let tasks = [
    { id: 1, name: "Tugas Pemrograman Web", deadline: "", desc: "Membuat antarmuka web statis menggunakan HTML dan CSS.", completed: false },
    { id: 2, name: "Tugas Matematika Diskrit", deadline: "", desc: "", completed: false },
    { id: 3, name: "Tugas Teori Graf", deadline: "", desc: "", completed: false },
    { id: 4, name: "Tugas KKA", deadline: "", desc: "", completed: false },
    { id: 5, name: "Tugas KPPL", deadline: "", desc: "", completed: false },
    { id: 6, name: "Tugas Jaringan Komputer", deadline: "", desc: "", completed: false }
];

const taskList = document.getElementById("task-list");
const addBtn = document.getElementById("add-btn");
const themeToggle = document.getElementById("theme-toggle");
const panelDeskripsi = document.getElementById("panel-deskripsi");

// Fungsi untuk me-render daftar tugas ke layar
function renderTasks() {
    taskList.innerHTML = ""; // Bersihkan layar sebelum render ulang
    
    tasks.forEach(task => {
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.addEventListener("change", () => toggleComplete(task.id));

        const span = document.createElement("span");
        let taskText = task.name;
        if (task.deadline) taskText += ` (DL: ${task.deadline})`;
        span.textContent = taskText;
        
        if (task.completed) span.classList.add("completed-text");

        const actionDiv = document.createElement("div");
        actionDiv.classList.add("action-buttons");

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("btn-edit");
        // MASALAH 3: Memanggil fungsi baru untuk menampilkan panel edit
        editBtn.addEventListener("click", () => showEditPanel(task.id));

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("btn-delete");
        deleteBtn.addEventListener("click", () => deleteTask(task.id));

        actionDiv.appendChild(editBtn);
        actionDiv.appendChild(deleteBtn);

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(actionDiv);
        taskList.appendChild(li);
    });
}

// MASALAH 1: Tambahkan event.preventDefault() agar form tidak ter-refresh
addBtn.addEventListener("click", (event) => {
    event.preventDefault(); 

    const nameInput = document.getElementById("nama-tugas").value;
    const dateInput = document.getElementById("tanggal").value;
    const descInput = document.getElementById("deskripsi").value;

    if (nameInput.trim() === "") {
        alert("Nama tugas tidak boleh kosong!");
        return;
    }

    const newTask = {
        id: Date.now(), // Gunakan timestamp sebagai ID unik
        name: nameInput,
        deadline: dateInput,
        desc: descInput,
        completed: false
    };

    tasks.push(newTask);
    renderTasks();

    // Reset isi form
    document.getElementById("nama-tugas").value = "";
    document.getElementById("tanggal").value = "";
    document.getElementById("deskripsi").value = "";
});

// Fungsi untuk menandai tugas selesai
function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        renderTasks();
    }
}

// MASALAH 2: Pastikan filter berjalan pada 'let tasks'
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
    
    // Opsional: Kembalikan panel kanan ke default setelah tugas dihapus
    panelDeskripsi.innerHTML = `<h3> Deskripsi Tugas </h3><p>Tugas berhasil dihapus.</p>`;
}

// MASALAH 3: Fungsi baru untuk memanipulasi panel kanan
function showEditPanel(id) {
    const task = tasks.find(t => t.id === id);
    
    if (task) {
        // Manipulasi DOM pada panel kanan untuk membuat Form Edit (termasuk deskripsi)
        panelDeskripsi.innerHTML = `
            <h3> Detail & Edit Tugas </h3>
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                <label><strong>Nama Tugas:</strong></label>
                <input type="text" id="edit-name" value="${task.name}">
                
                <label><strong>Deadline:</strong></label>
                <input type="date" id="edit-deadline" value="${task.deadline}">
                
                <label><strong>Deskripsi:</strong></label>
                <textarea id="edit-desc" rows="5" style="width:100%; padding:8px; margin-top:5px;" placeholder="Tambahkan deskripsi tugas di sini...">${task.desc || ""}</textarea>
                
                <button class="btn-edit" id="save-edit-btn" style="width: fit-content; padding: 10px 20px;">Simpan Perubahan</button>
            </div>
        `;

        // Event handler untuk tombol "Simpan Perubahan" di panel kanan
        document.getElementById("save-edit-btn").addEventListener("click", () => {
            // Ambil data terbaru dari input panel kanan
            task.name = document.getElementById("edit-name").value;
            task.deadline = document.getElementById("edit-deadline").value;
            task.desc = document.getElementById("edit-desc").value;
            
            // Render ulang list sebelah kiri agar teks namanya berubah
            renderTasks();
            
            // Kembalikan tampilan panel kanan
            panelDeskripsi.innerHTML = `
                <h3> Deskripsi Tugas </h3>
                <p>Perubahan berhasil disimpan! Silakan klik tombol <b>Edit</b> pada tugas lainnya.</p>
            `;
        });
    }
}

// Fitur Light/Dark Mode
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

// Pemanggilan render pertama kali saat web dimuat
renderTasks();