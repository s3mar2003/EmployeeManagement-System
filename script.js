const form = document.getElementById("employeeForm");
const nameInput = document.getElementById("name");
const roleInput = document.getElementById("role");
const statusInput = document.getElementById("status");
const employeeTbody = document.getElementById("employeeTbody");
const trashSection = document.getElementById("trashSection");
const trashTbody = document.getElementById("trashTbody");
const toggleTrashBtn = document.getElementById("toggleTrashBtn");
const salaryInput = document.getElementById("salary");

const bonusModal = document.getElementById("bonusModal");
const bonusInput = document.getElementById("bonusInput");
const bonusCancelBtn = document.getElementById("bonusCancelBtn");
const bonusSaveBtn = document.getElementById("bonusSaveBtn");
//تعريف حقول الفلتر
const filterName = document.getElementById("filterName");
const filterRole = document.getElementById("filterRole");
const filterSalaryMin = document.getElementById("filterSalaryMin");
const filterSalaryMax = document.getElementById("filterSalaryMax");
const filterBonusMin = document.getElementById("filterBonusMin");
const filterBonusMax = document.getElementById("filterBonusMax");
const filterStatus = document.getElementById("filterStatus");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");
//تعريف حقول اجمالي الراتب
const totalPayrollEl = document.getElementById("totalPayroll");
const removeLowSalaryBtn = document.getElementById("removeLowSalaryBtn");


let currentBonusEmpId = null; // لتخزين الموظف الذي نضيف له مكافأة

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

bonusCancelBtn.addEventListener("click", () => {
  bonusModal.style.display = "none";
  currentBonusEmpId = null;
});


bonusSaveBtn.addEventListener("click", () => {
  const bonusPercent = parseFloat(bonusInput.value);

  if (isNaN(bonusPercent) || bonusPercent < 0 || bonusPercent > 100) {
    alert("Please enter a valid bonus percentage between 0 and 100.");
    return;
  }

  const emp = employees.find(e => e.id === currentBonusEmpId);
  if (!emp) {
    alert("Employee not found.");
    bonusModal.style.display = "none";
    return;
  }

  // حساب المكافأة بناءً على الراتب
  emp.bonus = (emp.salary * bonusPercent) / 100;

  renderEmployees();

  bonusModal.style.display = "none";
  currentBonusEmpId = null;
});


removeLowSalaryBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to remove all employees with salary ≤ 20,000 R?")) {
    const toTrash = employees.filter(emp => emp.salary <= 20000);
    trash.push(...toTrash);
    employees = employees.filter(emp => emp.salary > 20000);
    renderEmployees();
    renderTrash();
  }
});

const searchInput = document.getElementById("searchEmployee");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = employees.filter(emp => 
    emp.name.toLowerCase().includes(query)
  );

  renderEmployees(filtered);
});


function renderEmployees(data = employees) {
  employeeTbody.innerHTML = "";

  data.forEach((emp) => {
    const highSalaryBadge = emp.salary >= 100000 
      ? '<span class="badge badge-high">High Salary</span>' 
      : '';

    const bonusBadge = emp.bonus && emp.bonus > 0
      ? '<span class="badge badge-bonus">Bonus</span>'
      : '';

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${emp.name} ${highSalaryBadge} ${bonusBadge}</td>
      <td>${emp.role}</td>
      <td>
        <span class="status-badge status-${emp.status.toLowerCase()}">
          ${statusIcons[emp.status]} ${emp.status.replace("OnLeave", "On Leave")}
        </span>
      </td>
      <td>${emp.salary.toLocaleString()} R</td>
      <td>${emp.bonus ? emp.bonus.toLocaleString() + " R" : "0 R"}</td>
      <td>
        <button class="action-btn bonus-btn" onclick="openBonusModal(${emp.id})">
          <i class="fas fa-gift"></i> Bonus
        </button>
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

  updateTotalPayroll(); // تحديث الإجمالي كل مرة
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
      <td>${emp.salary.toLocaleString()} R</td>
      <td>${emp.bonus ? emp.bonus.toLocaleString() + " R" : "0 R"}</td>  <!-- عرض المكافأة -->
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
  const status = statusInput.value;
  const salary = salaryInput.value.trim();

  // Regex للتحقق
  const nameRegex = /^[A-Za-z\s]{3,}$/;         // اسم لا يقل عن 3 أحرف (حروف فقط)
  const roleRegex = /^[A-Za-z\s]{2,}$/;         // الدور حروف ومسافات
  const salaryRegex = /^\d+(\.\d{1,2})?$/;      // رقم صحيح أو عشري (راتب)

  let errors = [];

  if (!nameRegex.test(name)) errors.push("Invalid Name (min 3 letters)");
  if (!roleRegex.test(role)) errors.push("Invalid Role (letters only)");
  if (!salaryRegex.test(salary) || parseFloat(salary) <= 0) errors.push("Invalid Salary (must be positive)");
  if (!status) errors.push("Please select status");

  if (errors.length > 0) {
    showErrorMessages(errors);
    return;
  }

  const newEmp = {
    id: Date.now(),
    name,
    role,
    status,
    salary: parseFloat(salary),
    bonus: 0
  };

  employees.push(newEmp);
  renderEmployees();
  form.reset();
});

function showErrorMessages(errors) {
  const errorBox = document.getElementById("errorBox") || createErrorBox();

  errorBox.innerHTML = errors.map(err => `<li>${err}</li>`).join("");
  errorBox.style.display = "block";

  setTimeout(() => errorBox.style.display = "none", 4000); // يختفي بعد 4 ثوانٍ
}

function createErrorBox() {
  const box = document.createElement("ul");
  box.id = "errorBox";
  box.style.background = "#f8d7da";
  box.style.color = "#721c24";
  box.style.padding = "1rem";
  box.style.border = "1px solid #f5c6cb";
  box.style.borderRadius = "10px";
  box.style.marginTop = "1rem";
  document.querySelector(".form-section").appendChild(box);
  return box;
}


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

function openBonusModal(id) {
  currentBonusEmpId = id;
  bonusInput.value = "";
  bonusModal.style.display = "flex";
  bonusInput.focus();
}

function filterEmployees() {
  let filtered = employees.filter(emp => {
    if (filterName.value.trim() !== "" && !emp.name.toLowerCase().includes(filterName.value.trim().toLowerCase())) {
      return false;
    }
    if (filterRole.value.trim() !== "" && !emp.role.toLowerCase().includes(filterRole.value.trim().toLowerCase())) {
      return false;
    }

    const salaryMin = parseFloat(filterSalaryMin.value);
    const salaryMax = parseFloat(filterSalaryMax.value);
    if (!isNaN(salaryMin) && emp.salary < salaryMin) return false;
    if (!isNaN(salaryMax) && emp.salary > salaryMax) return false;

    const bonusMin = parseFloat(filterBonusMin.value);
    const bonusMax = parseFloat(filterBonusMax.value);
    const empBonus = emp.bonus || 0;
    if (!isNaN(bonusMin) && empBonus < bonusMin) return false;
    if (!isNaN(bonusMax) && empBonus > bonusMax) return false;

    if (filterStatus.value !== "" && emp.status !== filterStatus.value) return false;

    return true;
  });

  renderEmployees(filtered);
}

[
  filterName, filterRole,
  filterSalaryMin, filterSalaryMax,
  filterBonusMin, filterBonusMax,
  filterStatus
].forEach(input => {
  input.addEventListener("input", filterEmployees);
});


function updateTotalPayroll() {
  const total = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
  totalPayrollEl.textContent = `${total.toLocaleString()} R`;
}


renderEmployees();
updateTrashBtnText();