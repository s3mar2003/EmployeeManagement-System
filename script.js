const form = document.getElementById("employeeForm");
const nameInput = document.getElementById("name");
const roleInput = document.getElementById("role");
const statusInput = document.getElementById("status");
const employeeTbody = document.getElementById("employeeTbody");
const trashSection = document.getElementById("trashSection");
const trashTbody = document.getElementById("trashTbody");
const toggleTrashBtn = document.getElementById("toggleTrashBtn");

let employees = [];
let trash = [];

const statusIcons = {
  Active: '<i class="fas fa-check-circle"></i>',
  OnLeave: '<i class="fas fa-clock"></i>',
  Terminated: '<i class="fas fa-times-circle"></i>',
};

const updateTrashBtnText = () => {
  toggleTrashBtn.innerHTML = trashSection.style.display === "none"
    ? '<i class="fas fa-trash"></i> Show Trash'
    : '<i class="fas fa-times-circle"></i> Hide Trash';
};

toggleTrashBtn.addEventListener("click", () => {
  if (trashSection.style.display === "none") {
    trashSection.style.display = "block";
  } else {
    trashSection.style.display = "none";
  }
  updateTrashBtnText();
});

function renderEmployees() {
  console.time("renderEmployees");
  employeeTbody.innerHTML = "";

  employees.forEach((emp) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${emp.name}</td>
      <td>${emp.role}</td>
      <td>
        <span class="status-badge status-${emp.status.toLowerCase()}">
          ${statusIcons[emp.status]} ${emp.status.replace("OnLeave", "On Leave")}
        </span>
      </td>
      <td>
        <button class="action-btn edit" onclick="editEmployee(${emp.id})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="action-btn delete" onclick="deleteEmployee(${emp.id})">
          <i class="fas fa-trash-alt"></i> Delete
        </button>
      </td>
    `;

    employeeTbody.appendChild(tr);
  });
  console.timeEnd("renderEmployees");
}

function renderTrash() {
  trashTbody.innerHTML = "";

  trash.forEach((emp) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${emp.name}</td>
      <td>${emp.role}</td>
      <td>
        <span class="status-badge status-${emp.status.toLowerCase()}">
          ${statusIcons[emp.status]} ${emp.status.replace("OnLeave", "On Leave")}
        </span>
      </td>
      <td>
        <button class="action-btn edit" onclick="restoreEmployee(${emp.id})">
          <i class="fas fa-undo"></i> Restore
        </button>
        <button class="action-btn delete" onclick="deleteForever(${emp.id})">
          <i class="fas fa-trash"></i> Delete Permanently
        </button>
      </td>
    `;

    trashTbody.appendChild(tr);
  });

  document.getElementById("trashCount").textContent = `(${trash.length} in trash)`;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const role = roleInput.value.trim();
  let status = statusInput.value;

  if (!name || !role || !status) {
    alert("Please fill all fields");
    return;
  }

  if (status === "OnLeave") status = "OnLeave";

  const newEmp = {
    id: Date.now(),
    name,
    role,
    status,
  };

  employees.push(newEmp);
  renderEmployees();
  form.reset();
});

function editEmployee(id) {
  const emp = employees.find((e) => e.id === id);
  if (!emp) return;

  const newName = prompt("Edit Name:", emp.name);
  if (newName === null) return;

  const newRole = prompt("Edit Role:", emp.role);
  if (newRole === null) return;

  const newStatus = prompt("Edit Status (Active, OnLeave, Terminated):", emp.status);
  if (newStatus === null) return;

  if (
    !newName.trim() ||
    !newRole.trim() ||
    !["Active", "OnLeave", "Terminated"].includes(newStatus.trim())
  ) {
    alert("Invalid input or status");
    return;
  }

  emp.name = newName.trim();
  emp.role = newRole.trim();
  emp.status = newStatus.trim();

  renderEmployees();
}

function deleteEmployee(id) {
  const confirmDelete = confirm("Move this employee to trash?");
  if (!confirmDelete) return;

  const index = employees.findIndex((e) => e.id === id);
  if (index === -1) return;

  const removed = employees.splice(index, 1)[0];
  trash.push(removed);

  renderEmployees();
  renderTrash();
}

function restoreEmployee(id) {
  const index = trash.findIndex((e) => e.id === id);
  if (index === -1) return;

  const restored = trash.splice(index, 1)[0];
  employees.push(restored);

  renderEmployees();
  renderTrash();
}

function deleteForever(id) {
  const confirmDelete = confirm("Are you sure you want to permanently delete this employee?");
  if (!confirmDelete) return;

  const index = trash.findIndex((e) => e.id === id);
  if (index === -1) return;

  trash.splice(index, 1);
  renderTrash();
}

renderEmployees();
updateTrashBtnText();
