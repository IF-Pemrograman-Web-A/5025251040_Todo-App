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

function renderTasks() {
    taskList.innerHTML = ""; 
    
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
        id: Date.now(), 
        name: nameInput,
        deadline: dateInput,
        desc: descInput,
        completed: false
    };

    tasks.push(newTask);
    renderTasks();

    document.getElementById("nama-tugas").value = "";
    document.getElementById("tanggal").value = "";
    document.getElementById("deskripsi").value = "";
});

function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        renderTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
    
    panelDeskripsi.innerHTML = `<h3> Deskripsi Tugas </h3><p>Tugas berhasil dihapus.</p>`;
}

function showEditPanel(id) {
    const task = tasks.find(t => t.id === id);
    
    if (task) {
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

        document.getElementById("save-edit-btn").addEventListener("click", () => {
            task.name = document.getElementById("edit-name").value;
            task.deadline = document.getElementById("edit-deadline").value;
            task.desc = document.getElementById("edit-desc").value;
            
            renderTasks();
            
            panelDeskripsi.innerHTML = `
                <h3> Deskripsi Tugas </h3>
                <p>Perubahan berhasil disimpan! Silakan klik tombol <b>Edit</b> pada tugas lainnya.</p>
            `;
        });
    }
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

renderTasks();
