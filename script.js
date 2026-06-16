let completedTasks = JSON.parse(localStorage.getItem("completedTasks")) || [];

let todoData = {
  title: "Prepare presentation slides",
  description: "Develop a comprehensive deck of presentation slides that distills complex data into an intuitive narrative for stakeholders. This involves the synthesis of core project objectives with high-fidelity visuals, ensuring a consistent aesthetic through typography and color theory. ",
  priority: "High",
  status: "Pending",
  dueDate: "2026-04-16T18:00",
};

const checkbox = document.getElementById("completeCheck");
const status = document.getElementById("status");
const title = document.getElementById("title");
const desc = document.getElementById("description");
const priorityEl = document.getElementById("priority");
const dueDateEl = document.getElementById("dueDate");

const editOverlay = document.getElementById("editOverlay");
const editTitleInput = document.getElementById("editTitle");
const editDescInput = document.getElementById("editDesc");
const editPriorityInput = document.getElementById("editPriority");
const editDueDateInput = document.getElementById("editDueDate");

const titleCount = document.getElementById("titleCount");
const descCount = document.getElementById("descCount");

const mainCard = document.querySelector(".todo-main-card");

function getDueDate() {
  return new Date(todoData.dueDate);
}

function updateCurrentTime() {
  const el = document.getElementById("currentDateTime");
  if (!el) return;

  el.textContent = new Date().toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function updateDueDate() {
  const el = document.getElementById("dueDate");
  if (!el) return;

  const d = getDueDate();
  el.textContent = "Due " + d.toDateString();
  el.setAttribute("datetime", d.toISOString());
}

function updateTimeRemaining() {
  const el = document.getElementById("timeRemaining");
  const badge = document.getElementById("overdueIndicator");
  if (!el) return;

  if (status.value === "Done") {
    el.textContent = "Completed";
    el.style.color = "#22c55e";
    if (badge) badge.style.display = "none";
    return;
  }

  const now = new Date();
  const diff = getDueDate() - now;
  const abs = Math.abs(diff);

  const mins = Math.floor(abs / 60000);
  const hrs = Math.floor(abs / 3600000);
  const days = Math.floor(abs / 86400000);

  if (diff <= 0) {
    el.textContent =
      mins < 60
        ? `Overdue by ${mins}m`
        : hrs < 24
          ? `Overdue by ${hrs}h`
          : `Overdue by ${days} days`;

    el.style.color = "#ef4444";
    if (badge) badge.style.display = "inline-block";
    return;
  }

  if (badge) badge.style.display = "none";

  if (mins < 60) {
    el.textContent = `Due in ${mins}m`;
    el.style.color = "#ef4444";
  } else if (hrs < 24) {
    el.textContent = `Due in ${hrs}h`;
    el.style.color = "#f59e0b";
  } else {
    el.textContent = days === 1 ? "Due tomorrow" : `Due in ${days} days`;
    el.style.color = "";
  }
}
function checkOverflow() {
  const description = document.getElementById('description');
  const toggleBtn = document.getElementById('expand-toggle');
  const container = document.getElementById('collapsible-section');

  if (!description || !toggleBtn || !container) return;

  toggleBtn.style.display = 'none';
  container.classList.add('collapsed');

  const lineHeight = parseFloat(getComputedStyle(description).lineHeight);
  const totalHeight = description.scrollHeight;

  if (totalHeight > lineHeight * 2.1) {
    toggleBtn.style.display = 'block';
    toggleBtn.textContent = 'Show More';
  }
}

function handleToggle() {
  const toggleBtn = document.getElementById('expand-toggle');
  const container = document.getElementById('collapsible-section');

  if (!toggleBtn || !container) return;

  toggleBtn.addEventListener('click', () => {
    const isExpanded = container.classList.contains('expanded');

    if (isExpanded) {
      container.classList.replace('expanded', 'collapsed');
      toggleBtn.textContent = 'Show More';
      toggleBtn.setAttribute('aria-expanded', 'false');
    } else {
      container.classList.replace('collapsed', 'expanded');
      toggleBtn.textContent = 'Show Less';
      toggleBtn.setAttribute('aria-expanded', 'true');
    }
  });
}
checkOverflow();
function renderMainCard() {
  title.innerText = todoData.title;
  desc.innerText = todoData.description;
  priorityEl.innerText = todoData.priority;
  status.value = todoData.status;

  const d = new Date(todoData.dueDate);
  dueDateEl.innerText =
    d.toLocaleDateString() +
    " " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  updatePriorityUI(todoData.priority);
  updateTimeRemaining();
  setTimeout(checkOverflow, 10);
}
function updatePriorityUI(level) {
  const prio = level.toLowerCase();
  mainCard.classList.remove("prio-high", "prio-medium", "prio-low");
  mainCard.classList.add(`prio-${prio}`);
}

checkbox.addEventListener("change", () => {
  if (!checkbox.checked) return;

  const titleTxt = title.innerText.trim();
  const descTxt = desc.innerText.trim();

  if (!titleTxt || !descTxt) {
    alert("Fill details first!");
    checkbox.checked = false;
    return;
  }

  if (completedTasks.length >= 5) {
    alert("Archive full!");
    checkbox.checked = false;
    return;
  }

  completedTasks.push({
    id: Date.now(),
    title: titleTxt,
    description: descTxt,
    priority: priorityEl.innerText,
    timestamp: new Date().toLocaleString(),
  });

  localStorage.setItem("completedTasks", JSON.stringify(completedTasks));

  renderCompleted();
  resetTask();
});

function resetTask() {
  todoData = {
    title: "Add New Text Title",
    description: "Add new Text Description...",
    priority: "Low",
    status: "Pending",
    dueDate: new Date().toISOString(),
  };

  checkbox.checked = false;
  status.value = "Pending";

  renderMainCard();
  updateDueDate();
  updateTimeRemaining();

  mainCard.classList.remove("status-done", "status-in-progress");
}

status.addEventListener("change", () => {
  mainCard.classList.remove("status-done", "status-in-progress");

  if (status.value === "Done") {
    mainCard.classList.add("status-done");
  } else if (status.value === "In Progress") {
    mainCard.classList.add("status-in-progress");
  }

  updateTimeRemaining();
});

document.getElementById("editBtn").addEventListener("click", () => {
  editTitleInput.value = todoData.title;
  editDescInput.value = todoData.description;
  editPriorityInput.value = todoData.priority;
  editDueDateInput.value = todoData.dueDate;

  updateCounters();
  editOverlay.style.display = "flex";
});

document.getElementById("saveBtn").addEventListener("click", (e) => {
  e.preventDefault();

  todoData.title = editTitleInput.value.trim();
  todoData.description = editDescInput.value.trim();
  todoData.priority = editPriorityInput.value;
  todoData.dueDate = editDueDateInput.value;
  todoData.status = status.value;

  renderMainCard();
  updateDueDate();
  updateTimeRemaining();
  checkOverflow();

  editOverlay.style.display = "none";
});

function updateCounters() {
  titleCount.textContent = `${editTitleInput.value.length}/50`;
  descCount.textContent = `${editDescInput.value.length}/300`;
}

editTitleInput.addEventListener("input", updateCounters);
editDescInput.addEventListener("input", updateCounters);

document.getElementById("clearHistory").addEventListener("click", () => {
  if (!completedTasks.length) return;

  if (confirm("Delete all?")) {
    completedTasks = [];
    localStorage.removeItem("completedTasks");
    renderCompleted();
  }
});

function renderCompleted() {
  const container = document.getElementById("completedTask");
  if (!container) return;

  if (!completedTasks.length) {
    container.innerHTML = `<p class="empty-msg">No completed tasks yet.</p>`;
    return;
  }

  container.innerHTML = completedTasks
    .map(t => `
      <div class="todo-card done" style="opacity: 0.8; max-width:400px; margin-bottom: 10px; border-left: 4px solid #22c55e;">
        <h3 style="text-decoration: line-through; font-size: 1rem;">${t.title}</h3>
        <p style="font-size: 0.85rem; color: #64748b;">${t.description}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
            <small class="chip1" style="font-size: 0.7rem;">${t.priority}</small>
            <small style="font-size: 0.65rem; color: #94a3b8;">${t.timestamp}</small>
        </div>
      </div>
    `).join("");
}

document.getElementById('deleteBtn').addEventListener('click', () => {
  if (confirm("Are you sure you want to delete this task?")) {

    resetTask()

  }
});

function init() {
  renderMainCard();
  renderCompleted();
  updateCurrentTime();
  updateDueDate();
  handleToggle();

  setInterval(() => {
    updateCurrentTime();
    updateTimeRemaining();
  }, 30000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}