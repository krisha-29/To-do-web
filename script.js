let tasks = [];

document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
});

function addTask() {
  const taskText = document.getElementById("taskInput").value.trim();
  const category = document.getElementById("categoryInput").value.trim();
  const priority = document.getElementById("prioritySelect").value;
  const dueDate = document.getElementById("dueDateInput").value;
  const isRecurring = document.getElementById("recurringCheckbox").checked;

  if (!taskText) return;

  tasks.push({
    id: Date.now(),
    text: taskText,
    category,
    priority,
    dueDate,
    recurring: isRecurring,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  });

  clearInputs();
  renderTasks();
}

function clearInputs() {
  document.getElementById("taskInput").value = '';
  document.getElementById("categoryInput").value = '';
  document.getElementById("prioritySelect").value = 'Low';
  document.getElementById("dueDateInput").value = '';
  document.getElementById("recurringCheckbox").checked = false;
}

function renderTasks() {
  const pendingList = document.getElementById("pendingList");
  const completedList = document.getElementById("completedList");
  pendingList.innerHTML = '';
  completedList.innerHTML = '';

  const search = document.getElementById("searchInput").value.toLowerCase();
  const statusFilter = document.getElementById("filterSelect").value;
  const timeFilter = document.getElementById("timeFilter").value;

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(search);
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'pending' && !task.completed) || 
      (statusFilter === 'completed' && task.completed);

    const taskDate = new Date(task.dueDate);
    let matchesTime = true;
    if (timeFilter === 'today') {
      matchesTime = task.dueDate && new Date(task.dueDate).toDateString() === today.toDateString();
    } else if (timeFilter === 'week') {
      matchesTime = task.dueDate && taskDate >= startOfWeek && taskDate <= today;
    }

    return matchesSearch && matchesStatus && matchesTime;
  });

  let completedCount = 0;

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = task.completed ? 'completed' : '';

    const content = `
      <strong>${task.text}</strong> [${task.category}] <em>(${task.priority})</em><br>
      Due: ${task.dueDate || 'N/A'} ${task.recurring ? '(Recurring)' : ''}
      <div class="timestamp">Created: ${new Date(task.createdAt).toLocaleString()}</div>
      ${task.completedAt ? `<div class="timestamp">Completed: ${new Date(task.completedAt).toLocaleString()}</div>` : ''}
    `;
    li.innerHTML = content;

    const btnGroup = document.createElement('div');
    btnGroup.className = "task-buttons";

    if (!task.completed) {
      const completeBtn = document.createElement("button");
      completeBtn.innerText = "Complete";
      completeBtn.className = "complete";
      completeBtn.onclick = () => completeTask(task.id);
      btnGroup.appendChild(completeBtn);
    }

    const editBtn = document.createElement("button");
    editBtn.innerText = "Edit";
    editBtn.className = "edit";
    editBtn.onclick = () => editTask(task.id);
    btnGroup.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    deleteBtn.className = "delete";
    deleteBtn.onclick = () => deleteTask(task.id);
    btnGroup.appendChild(deleteBtn);

    li.appendChild(btnGroup);

    if (task.completed) {
      completedList.appendChild(li);
      completedCount++;
    } else {
      pendingList.appendChild(li);
    }
  });

  updateProgressBar(completedCount, filteredTasks.length);
}

function completeTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = true;
    task.completedAt = new Date().toISOString();
  }
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  renderTasks();
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const newText = prompt("Edit task name:", task.text);
  if (newText) {
    task.text = newText.trim();
    renderTasks();
  }
}

function filterTasks() {
  renderTasks();
}

function updateProgressBar(completed, total) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  document.getElementById("progressFill").style.width = percent + "%";
  document.getElementById("progressPercent").innerText = `${percent}% Completed`;
}

function exportTasks() {
  const blob = new Blob([JSON.stringify(tasks)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tasks.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importTasks() {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      tasks = JSON.parse(e.target.result);
      renderTasks();
    } catch (err) {
      alert("Invalid file format");
    }
  };
  reader.readAsText(file);
}
