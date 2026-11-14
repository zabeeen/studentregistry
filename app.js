/**
 * Student Registry - Application Logic
 * Mobile-Friendly, Offline-First with LocalStorage & REST API sync support.
 */

// Initial Sample Data to make the app ready-to-use right out of the box
const DEFAULT_STUDENTS = [
  {
    id: "STU-1001",
    name: "Alexander Hamilton",
    dob: "2008-01-11",
    grade: "Grade 11",
    class_name: "Class A",
    createdAt: "2026-09-01T08:00:00.000Z"
  },
  {
    id: "STU-1002",
    name: "Sophia Rodriguez",
    dob: "2009-04-18",
    grade: "Grade 10",
    class_name: "Class B",
    createdAt: "2026-09-01T08:30:00.000Z"
  },
  {
    id: "STU-1003",
    name: "Liam Chen",
    dob: "2008-08-25",
    grade: "Grade 11",
    class_name: "Science Section",
    createdAt: "2026-09-01T09:00:00.000Z"
  },
  {
    id: "STU-1004",
    name: "Amina Al-Mansoor",
    dob: "2010-11-03",
    grade: "Grade 9",
    class_name: "Class A",
    createdAt: "2026-09-02T10:15:00.000Z"
  },
  {
    id: "STU-1005",
    name: "Marcus Aurelius Vance",
    dob: "2007-06-14",
    grade: "Grade 12",
    class_name: "Arts Section",
    createdAt: "2026-09-02T11:00:00.000Z"
  },
  {
    id: "STU-1006",
    name: "Emma Watson-Brown",
    dob: "2009-12-09",
    grade: "Grade 10",
    class_name: "Class C",
    createdAt: "2026-09-03T09:45:00.000Z"
  }
];

class StudentRegistryApp {
  constructor() {
    this.storageKey = "student_registry_records_v1";
    this.themeStorageKey = "student_registry_theme";
    this.students = [];
    this.currentView = "card"; // 'card' or 'table'
    this.currentTheme = "light";
    this.studentToDelete = null;
    this.activeStudentForDetails = null;

    // Filters and Search State
    this.searchQuery = "";
    this.selectedGrade = "";
    this.selectedClass = "";
    this.sortBy = "name-asc";

    this.init();
  }

  async init() {
    this.initTheme();
    this.bindDomElements();
    this.bindEvents();
    await this.loadData();
    this.render();
  }

  /* -------------------------------------------------------------
   * THEME MANAGEMENT (Light / Dark)
   * ----------------------------------------------------------- */
  initTheme() {
    const savedTheme = localStorage.getItem(this.themeStorageKey);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    this.currentTheme = savedTheme || (prefersDark ? "dark" : "light");
    this.applyTheme(this.currentTheme);
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem(this.themeStorageKey, theme);
    this.updateThemeIcon();
  }

  toggleTheme() {
    const nextTheme = this.currentTheme === "dark" ? "light" : "dark";
    this.applyTheme(nextTheme);
    this.showToast(`Switched to ${nextTheme} theme`, "info");
  }

  updateThemeIcon() {
    const themeIcon = document.getElementById("themeIcon");
    if (!themeIcon) return;
    if (this.currentTheme === "dark") {
      // Show Moon SVG
      themeIcon.innerHTML = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      `;
    } else {
      // Show Sun SVG
      themeIcon.innerHTML = `
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      `;
    }
  }

  /* -------------------------------------------------------------
   * DOM BINDING
   * ----------------------------------------------------------- */
  bindDomElements() {
    // Buttons
    this.themeToggleBtn = document.getElementById("themeToggleBtn");
    this.exportMenuBtn = document.getElementById("exportMenuBtn");
    this.printBtn = document.getElementById("printBtn");
    this.openAddModalBtn = document.getElementById("openAddModalBtn");
    this.autoGenerateIdBtn = document.getElementById("autoGenerateIdBtn");

    // Search and Filters
    this.searchInput = document.getElementById("searchInput");
    this.clearSearchBtn = document.getElementById("clearSearchBtn");
    this.gradeFilterSelect = document.getElementById("gradeFilterSelect");
    this.classFilterSelect = document.getElementById("classFilterSelect");
    this.sortSelect = document.getElementById("sortSelect");
    this.activeFiltersContainer = document.getElementById("activeFiltersContainer");
    this.activeFiltersList = document.getElementById("activeFiltersList");
    this.clearAllFiltersBtn = document.getElementById("clearAllFiltersBtn");

    // Views
    this.cardViewBtn = document.getElementById("cardViewBtn");
    this.tableViewBtn = document.getElementById("tableViewBtn");
    this.studentsGrid = document.getElementById("studentsGrid");
    this.studentsTableContainer = document.getElementById("studentsTableContainer");
    this.studentsTableBody = document.getElementById("studentsTableBody");
    this.studentsCountDisplay = document.getElementById("studentsCountDisplay");
    this.emptyState = document.getElementById("emptyState");
    this.emptyStateDesc = document.getElementById("emptyStateDesc");
    this.emptyAddBtn = document.getElementById("emptyAddBtn");

    // Stats
    this.statTotalStudents = document.getElementById("statTotalStudents");
    this.statTotalGrades = document.getElementById("statTotalGrades");
    this.statTotalClasses = document.getElementById("statTotalClasses");
    this.statAvgAge = document.getElementById("statAvgAge");

    // Form Modal
    this.studentFormModal = document.getElementById("studentFormModal");
    this.closeFormModalBtn = document.getElementById("closeFormModalBtn");
    this.cancelFormBtn = document.getElementById("cancelFormBtn");
    this.studentForm = document.getElementById("studentForm");
    this.formModalTitle = document.getElementById("formModalTitle");
    this.formModalSubtitle = document.getElementById("formModalSubtitle");
    this.saveBtnText = document.getElementById("saveBtnText");
    this.originalStudentId = document.getElementById("originalStudentId");
    this.studentIdInput = document.getElementById("studentIdInput");
    this.studentNameInput = document.getElementById("studentNameInput");
    this.studentDobInput = document.getElementById("studentDobInput");
    this.studentGradeInput = document.getElementById("studentGradeInput");
    this.studentClassInput = document.getElementById("studentClassInput");
    this.calculatedAgePreview = document.getElementById("calculatedAgePreview");

    // Photo Elements in Form
    this.formPhotoPreview = document.getElementById("formPhotoPreview");
    this.formPhotoPlaceholder = document.getElementById("formPhotoPlaceholder");
    this.formPhotoImg = document.getElementById("formPhotoImg");
    this.studentPhotoFileInput = document.getElementById("studentPhotoFileInput");
    this.studentPhotoData = document.getElementById("studentPhotoData");
    this.choosePhotoBtn = document.getElementById("choosePhotoBtn");
    this.removePhotoBtn = document.getElementById("removePhotoBtn");

    // Direct Card Photo Input
    this.cardDirectPhotoInput = document.getElementById("cardDirectPhotoInput");
    this.studentForDirectPhoto = null;

    // Errors
    this.studentIdError = document.getElementById("studentIdError");
    this.studentNameError = document.getElementById("studentNameError");
    this.studentDobError = document.getElementById("studentDobError");
    this.studentGradeError = document.getElementById("studentGradeError");
    this.studentClassError = document.getElementById("studentClassError");

    // Details / ID Card Modal
    this.studentDetailsModal = document.getElementById("studentDetailsModal");
    this.closeDetailsModalBtn = document.getElementById("closeDetailsModalBtn");
    this.studentIdCardContainer = document.getElementById("studentIdCardContainer");
    this.editFromDetailsBtn = document.getElementById("editFromDetailsBtn");
    this.printSingleCardBtn = document.getElementById("printSingleCardBtn");

    // Delete Modal
    this.deleteModal = document.getElementById("deleteModal");
    this.closeDeleteModalBtn = document.getElementById("closeDeleteModalBtn");
    this.cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    this.confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    this.deleteStudentName = document.getElementById("deleteStudentName");
    this.deleteStudentId = document.getElementById("deleteStudentId");

    // Data Modal
    this.dataModal = document.getElementById("dataModal");
    this.closeDataModalBtn = document.getElementById("closeDataModalBtn");
    this.doneDataModalBtn = document.getElementById("doneDataModalBtn");
    this.exportCsvBtn = document.getElementById("exportCsvBtn");
    this.exportJsonBtn = document.getElementById("exportJsonBtn");
    this.triggerImportBtn = document.getElementById("triggerImportBtn");
    this.importFileInput = document.getElementById("importFileInput");
    this.resetDemoBtn = document.getElementById("resetDemoBtn");

    // Mobile Bottom Nav
    this.navHomeBtn = document.getElementById("navHomeBtn");
    this.navSearchBtn = document.getElementById("navSearchBtn");
    this.navFabAddBtn = document.getElementById("navFabAddBtn");
    this.navExportBtn = document.getElementById("navExportBtn");
    this.navStatsBtn = document.getElementById("navStatsBtn");

    // Toast Container
    this.toastContainer = document.getElementById("toastContainer");

    // Set Max date for DOB to today
    const todayIso = new Date().toISOString().split("T")[0];
    this.studentDobInput.setAttribute("max", todayIso);
  }

  /* -------------------------------------------------------------
   * EVENT LISTENERS
   * ----------------------------------------------------------- */
  bindEvents() {
    // Theme toggle
    this.themeToggleBtn.addEventListener("click", () => this.toggleTheme());

    // Photo Upload in Form
    this.choosePhotoBtn.addEventListener("click", () => this.studentPhotoFileInput.click());
    this.studentPhotoFileInput.addEventListener("change", (e) => this.handlePhotoFileChange(e, "form"));
    this.removePhotoBtn.addEventListener("click", () => this.removeFormPhoto());

    // Direct Card Photo Input
    this.cardDirectPhotoInput.addEventListener("change", (e) => this.handlePhotoFileChange(e, "direct"));

    // Modals
    this.openAddModalBtn.addEventListener("click", () => this.openAddModal());
    this.emptyAddBtn.addEventListener("click", () => this.openAddModal());
    this.closeFormModalBtn.addEventListener("click", () => this.closeFormModal());
    this.cancelFormBtn.addEventListener("click", () => this.closeFormModal());
    this.studentForm.addEventListener("submit", (e) => this.handleFormSubmit(e));
    this.autoGenerateIdBtn.addEventListener("click", () => this.autoGenerateId());

    // Live Age Preview in Form
    this.studentDobInput.addEventListener("input", () => this.updateDobAgePreview());
    this.studentDobInput.addEventListener("change", () => this.updateDobAgePreview());

    // Search & Filter Events
    this.searchInput.addEventListener("input", (e) => {
      this.searchQuery = e.target.value.trim();
      this.clearSearchBtn.style.display = this.searchQuery ? "inline-flex" : "none";
      this.render();
    });

    this.clearSearchBtn.addEventListener("click", () => {
      this.searchInput.value = "";
      this.searchQuery = "";
      this.clearSearchBtn.style.display = "none";
      this.render();
    });

    this.gradeFilterSelect.addEventListener("change", (e) => {
      this.selectedGrade = e.target.value;
      this.render();
    });

    this.classFilterSelect.addEventListener("change", (e) => {
      this.selectedClass = e.target.value;
      this.render();
    });

    this.sortSelect.addEventListener("change", (e) => {
      this.sortBy = e.target.value;
      this.render();
    });

    this.clearAllFiltersBtn.addEventListener("click", () => this.resetFilters());

    // Layout View Toggles
    this.cardViewBtn.addEventListener("click", () => this.switchView("card"));
    this.tableViewBtn.addEventListener("click", () => this.switchView("table"));

    // Print
    this.printBtn.addEventListener("click", () => window.print());

    // Details Modal
    this.closeDetailsModalBtn.addEventListener("click", () => this.closeDetailsModal());
    this.editFromDetailsBtn.addEventListener("click", () => {
      if (this.activeStudentForDetails) {
        const student = { ...this.activeStudentForDetails };
        this.closeDetailsModal();
        this.openEditModal(student);
      }
    });
    this.printSingleCardBtn.addEventListener("click", () => window.print());

    // Delete Modal
    this.closeDeleteModalBtn.addEventListener("click", () => this.closeDeleteModal());
    this.cancelDeleteBtn.addEventListener("click", () => this.closeDeleteModal());
    this.confirmDeleteBtn.addEventListener("click", () => this.confirmDelete());

    // Data Modal & Actions
    this.exportMenuBtn.addEventListener("click", () => this.openDataModal());
    this.closeDataModalBtn.addEventListener("click", () => this.closeDataModal());
    this.doneDataModalBtn.addEventListener("click", () => this.closeDataModal());
    this.exportCsvBtn.addEventListener("click", () => this.exportCsv());
    this.exportJsonBtn.addEventListener("click", () => this.exportJson());
    this.triggerImportBtn.addEventListener("click", () => this.importFileInput.click());
    this.importFileInput.addEventListener("change", (e) => this.handleFileImport(e));
    this.resetDemoBtn.addEventListener("click", () => this.resetToDemoData());

    // Mobile Bottom Nav
    this.navHomeBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      this.setMobileNavActive(this.navHomeBtn);
    });

    this.navSearchBtn.addEventListener("click", () => {
      this.searchInput.focus();
      this.searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      this.setMobileNavActive(this.navSearchBtn);
    });

    this.navFabAddBtn.addEventListener("click", () => this.openAddModal());

    this.navExportBtn.addEventListener("click", () => {
      this.openDataModal();
      this.setMobileNavActive(this.navExportBtn);
    });

    this.navStatsBtn.addEventListener("click", () => {
      const stats = document.querySelector(".stats-grid");
      if (stats) stats.scrollIntoView({ behavior: "smooth", block: "start" });
      this.setMobileNavActive(this.navStatsBtn);
    });

    // Close modals when clicking backdrop
    [this.studentFormModal, this.studentDetailsModal, this.deleteModal, this.dataModal].forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.remove("active");
        }
      });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeFormModal();
        this.closeDetailsModal();
        this.closeDeleteModal();
        this.closeDataModal();
      }
    });
  }

  setMobileNavActive(targetBtn) {
    [this.navHomeBtn, this.navSearchBtn, this.navExportBtn, this.navStatsBtn].forEach((btn) => {
      btn.classList.remove("active");
    });
    if (targetBtn && targetBtn !== this.navFabAddBtn) {
      targetBtn.classList.add("active");
    }
  }

  /* -------------------------------------------------------------
   * DATA PERSISTENCE & LOADING
   * ----------------------------------------------------------- */
  async loadData() {
    // 1. First check if backend REST API is available
    try {
      const res = await fetch("/api/students", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          this.students = data;
          this.saveToLocalStorage();
          return;
        }
      }
    } catch {
      // Backend not running, which is completely normal for standalone mode
    }

    // 2. Load from LocalStorage
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.students = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn("Failed reading LocalStorage", e);
    }

    // 3. Fallback to realistic default students
    this.students = [...DEFAULT_STUDENTS];
    this.saveData();
  }

  async saveData() {
    this.saveToLocalStorage();

    // Optionally sync with backend if running
    try {
      await fetch("/api/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.students)
      });
    } catch {
      // No server running, LocalStorage is sufficient
    }
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.students));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }

  resetToDemoData() {
    if (confirm("Reset student registry to sample data? Current modifications will be replaced with initial demo students.")) {
      this.students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
      this.saveData();
      this.closeDataModal();
      this.render();
      this.showToast("Loaded sample student registry", "success");
    }
  }

  /* -------------------------------------------------------------
   * HELPER CALCULATIONS & FORMATTING
   * ----------------------------------------------------------- */
  calculateAge(dobString) {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0;
  }

  formatDate(dateString) {
    if (!dateString) return "--";
    try {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
      }
    } catch {
      // Fallback
    }
    return dateString;
  }

  getInitials(name) {
    if (!name) return "ST";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getAvatarColor(name) {
    const gradients = [
      "linear-gradient(135deg, #4f46e5, #7c3aed)",
      "linear-gradient(135deg, #0284c7, #2563eb)",
      "linear-gradient(135deg, #059669, #10b981)",
      "linear-gradient(135deg, #d97706, #f59e0b)",
      "linear-gradient(135deg, #db2777, #e11d48)",
      "linear-gradient(135deg, #7c2d12, #ea580c)",
      "linear-gradient(135deg, #0f766e, #14b8a6)"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  }

  /* -------------------------------------------------------------
   * FILTERING & SORTING
   * ----------------------------------------------------------- */
  getFilteredStudents() {
    let list = [...this.students];

    // Search query filter
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter((s) => {
        const idMatch = (s.id || "").toLowerCase().includes(q);
        const nameMatch = (s.name || "").toLowerCase().includes(q);
        const gradeMatch = (s.grade || "").toLowerCase().includes(q);
        const classMatch = (s.class_name || "").toLowerCase().includes(q);
        const dobMatch = (s.dob || "").toLowerCase().includes(q);
        return idMatch || nameMatch || gradeMatch || classMatch || dobMatch;
      });
    }

    // Grade filter
    if (this.selectedGrade) {
      list = list.filter((s) => s.grade === this.selectedGrade);
    }

    // Class filter
    if (this.selectedClass) {
      list = list.filter((s) => s.class_name === this.selectedClass);
    }

    // Sorting
    list.sort((a, b) => {
      switch (this.sortBy) {
        case "name-asc":
          return (a.name || "").localeCompare(b.name || "");
        case "name-desc":
          return (b.name || "").localeCompare(a.name || "");
        case "id-asc":
          return (a.id || "").localeCompare(b.id || "", undefined, { numeric: true });
        case "id-desc":
          return (b.id || "").localeCompare(a.id || "", undefined, { numeric: true });
        case "dob-asc": // Youngest first (later birth date)
          return new Date(b.dob) - new Date(a.dob);
        case "dob-desc": // Oldest first (earlier birth date)
          return new Date(a.dob) - new Date(b.dob);
        case "grade-asc":
          return (a.grade || "").localeCompare(b.grade || "", undefined, { numeric: true });
        default:
          return 0;
      }
    });

    return list;
  }

  resetFilters() {
    this.searchInput.value = "";
    this.searchQuery = "";
    this.selectedGrade = "";
    this.selectedClass = "";
    this.gradeFilterSelect.value = "";
    this.classFilterSelect.value = "";
    this.clearSearchBtn.style.display = "none";
    this.render();
  }

  /* -------------------------------------------------------------
   * RENDER PIPELINE
   * ----------------------------------------------------------- */
  render() {
    this.renderStats();
    this.renderFilterDropdowns();
    this.renderActiveFilterChips();

    const filtered = this.getFilteredStudents();
    this.studentsCountDisplay.textContent = filtered.length;

    if (filtered.length === 0) {
      this.studentsGrid.style.display = "none";
      this.studentsTableContainer.style.display = "none";
      this.emptyState.style.display = "flex";

      if (this.students.length === 0) {
        this.emptyStateDesc.textContent = "Your student registry is currently empty. Click below to add your first student record.";
        this.emptyAddBtn.style.display = "inline-flex";
      } else {
        this.emptyStateDesc.textContent = "No student records matched your search or filters. Try adjusting your search query or clearing filters.";
        this.emptyAddBtn.style.display = "none";
      }
      return;
    }

    this.emptyState.style.display = "none";

    if (this.currentView === "card") {
      this.studentsGrid.style.display = "grid";
      this.studentsTableContainer.style.display = "none";
      this.renderCards(filtered);
    } else {
      this.studentsGrid.style.display = "none";
      this.studentsTableContainer.style.display = "block";
      this.renderTable(filtered);
    }
  }

  renderStats() {
    this.statTotalStudents.textContent = this.students.length;

    // Distinct grades
    const grades = new Set(this.students.map((s) => s.grade).filter(Boolean));
    this.statTotalGrades.textContent = grades.size;

    // Distinct classes
    const classes = new Set(this.students.map((s) => s.class_name).filter(Boolean));
    this.statTotalClasses.textContent = classes.size;

    // Average age
    const ages = this.students
      .map((s) => this.calculateAge(s.dob))
      .filter((a) => typeof a === "number" && !isNaN(a));

    if (ages.length > 0) {
      const avg = (ages.reduce((sum, val) => sum + val, 0) / ages.length).toFixed(1);
      this.statAvgAge.textContent = `${avg} yrs`;
    } else {
      this.statAvgAge.textContent = "--";
    }
  }

  renderFilterDropdowns() {
    // Collect distinct grades and classes
    const grades = Array.from(new Set(this.students.map((s) => s.grade).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );

    const classes = Array.from(new Set(this.students.map((s) => s.class_name).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );

    // Populate Grade filter
    const prevGrade = this.selectedGrade;
    this.gradeFilterSelect.innerHTML = `<option value="">All Grades (${grades.length})</option>`;
    grades.forEach((g) => {
      const count = this.students.filter((s) => s.grade === g).length;
      const opt = document.createElement("option");
      opt.value = g;
      opt.textContent = `${g} (${count})`;
      if (g === prevGrade) opt.selected = true;
      this.gradeFilterSelect.appendChild(opt);
    });

    // Populate Class filter
    const prevClass = this.selectedClass;
    this.classFilterSelect.innerHTML = `<option value="">All Classes (${classes.length})</option>`;
    classes.forEach((c) => {
      const count = this.students.filter((s) => s.class_name === c).length;
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = `${c} (${count})`;
      if (c === prevClass) opt.selected = true;
      this.classFilterSelect.appendChild(opt);
    });
  }

  renderActiveFilterChips() {
    const chips = [];

    if (this.searchQuery) {
      chips.push({
        label: `Search: "${this.searchQuery}"`,
        onRemove: () => {
          this.searchInput.value = "";
          this.searchQuery = "";
          this.clearSearchBtn.style.display = "none";
          this.render();
        }
      });
    }

    if (this.selectedGrade) {
      chips.push({
        label: `Grade: ${this.selectedGrade}`,
        onRemove: () => {
          this.selectedGrade = "";
          this.gradeFilterSelect.value = "";
          this.render();
        }
      });
    }

    if (this.selectedClass) {
      chips.push({
        label: `Class: ${this.selectedClass}`,
        onRemove: () => {
          this.selectedClass = "";
          this.classFilterSelect.value = "";
          this.render();
        }
      });
    }

    if (chips.length > 0) {
      this.activeFiltersContainer.style.display = "flex";
      this.activeFiltersList.innerHTML = "";
      chips.forEach((c) => {
        const chip = document.createElement("span");
        chip.className = "filter-chip";
        chip.innerHTML = `
          <span>${c.label}</span>
          <button type="button" aria-label="Remove filter">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        `;
        chip.querySelector("button").addEventListener("click", c.onRemove);
        this.activeFiltersList.appendChild(chip);
      });
    } else {
      this.activeFiltersContainer.style.display = "none";
    }
  }

  renderCards(students) {
    this.studentsGrid.innerHTML = "";

    students.forEach((student) => {
      const age = this.calculateAge(student.dob);
      const initials = this.getInitials(student.name);
      const avatarBg = this.getAvatarColor(student.name);

      const card = document.createElement("article");
      card.className = "student-card";
      card.setAttribute("data-id", student.id);

      // Student photo in top right corner
      const photoHtml = student.photo
        ? `<img src="${student.photo}" alt="${this.escapeHtml(student.name)}" class="student-photo-img">`
        : `
          <div class="student-photo-placeholder" style="background: ${avatarBg}">
            <span>${initials}</span>
            <div class="photo-badge-camera" title="Click to add photo">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </div>
          </div>
        `;

      card.innerHTML = `
        <div class="card-top">
          <div class="student-identity">
            <h3 class="student-name" title="${this.escapeHtml(student.name)}">${this.escapeHtml(student.name)}</h3>
            <span class="student-id-badge">ID: ${this.escapeHtml(student.id)}</span>
          </div>
          <div class="student-photo-corner" title="Click to view or upload photo" data-id="${this.escapeHtml(student.id)}">
            ${photoHtml}
          </div>
        </div>

        <div class="card-details">
          <div class="detail-item">
            <span class="detail-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Date of Birth
            </span>
            <span class="detail-value">
              ${this.formatDate(student.dob)}
              ${age !== null ? `<span class="badge-pill badge-age">${age}y</span>` : ""}
            </span>
          </div>

          <div class="detail-item">
            <span class="detail-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              Grade
            </span>
            <span class="detail-value">
              <span class="badge-pill badge-grade">${this.escapeHtml(student.grade)}</span>
            </span>
          </div>

          <div class="detail-item">
            <span class="detail-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 21h18"></path>
                <path d="M5 21V7l8-4v18"></path>
                <path d="M19 21V11l-6-4"></path>
              </svg>
              Class
            </span>
            <span class="detail-value">
              <span class="badge-pill badge-class">${this.escapeHtml(student.class_name)}</span>
            </span>
          </div>

          <div class="detail-item">
            <span class="detail-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 14 14"></polyline>
              </svg>
              Student Age
            </span>
            <span class="detail-value">
              ${age !== null ? `${age} years old` : "--"}
            </span>
          </div>
        </div>

        <div class="card-actions">
          <button type="button" class="btn btn-secondary view-details-btn" title="View Student ID Profile">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>View</span>
          </button>

          <button type="button" class="btn btn-secondary edit-student-btn" title="Edit Student Information">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Edit</span>
          </button>

          <button type="button" class="btn btn-outline-danger delete-student-btn" title="Delete Student Record">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>Delete</span>
          </button>
        </div>
      `;

      // Event listeners on buttons
      card.querySelector(".student-photo-corner").addEventListener("click", () => {
        this.studentForDirectPhoto = student;
        this.cardDirectPhotoInput.click();
      });
      card.querySelector(".view-details-btn").addEventListener("click", () => this.openDetailsModal(student));
      card.querySelector(".edit-student-btn").addEventListener("click", () => this.openEditModal(student));
      card.querySelector(".delete-student-btn").addEventListener("click", () => this.openDeleteModal(student));

      this.studentsGrid.appendChild(card);
    });
  }

  renderTable(students) {
    this.studentsTableBody.innerHTML = "";

    students.forEach((student) => {
      const age = this.calculateAge(student.dob);
      const initials = this.getInitials(student.name);
      const avatarBg = this.getAvatarColor(student.name);

      const tableAvatarHtml = student.photo
        ? `<div class="table-avatar"><img src="${student.photo}" alt="${this.escapeHtml(student.name)}"></div>`
        : `<div class="table-avatar" style="background: ${avatarBg}">${initials}</div>`;

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>
          <span class="student-id-badge">${this.escapeHtml(student.id)}</span>
        </td>
        <td>
          <div class="table-student-cell">
            ${tableAvatarHtml}
            <span style="font-weight: 600;">${this.escapeHtml(student.name)}</span>
          </div>
        </td>
        <td>${this.formatDate(student.dob)}</td>
        <td>
          ${age !== null ? `<span class="badge-pill badge-age">${age} yrs</span>` : "--"}
        </td>
        <td>
          <span class="badge-pill badge-grade">${this.escapeHtml(student.grade)}</span>
        </td>
        <td>
          <span class="badge-pill badge-class">${this.escapeHtml(student.class_name)}</span>
        </td>
        <td>
          <div class="table-actions" style="justify-content: flex-end;">
            <button type="button" class="btn-icon view-table-btn" title="View ID Card">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button type="button" class="btn-icon edit-table-btn" title="Edit Student">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button type="button" class="btn-icon delete-table-btn" style="color: var(--danger);" title="Delete Student">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
              </svg>
            </button>
          </div>
        </td>
      `;

      tr.querySelector(".view-table-btn").addEventListener("click", () => this.openDetailsModal(student));
      tr.querySelector(".edit-table-btn").addEventListener("click", () => this.openEditModal(student));
      tr.querySelector(".delete-table-btn").addEventListener("click", () => this.openDeleteModal(student));

      this.studentsTableBody.appendChild(tr);
    });
  }

  switchView(view) {
    this.currentView = view;
    if (view === "card") {
      this.cardViewBtn.classList.add("active");
      this.tableViewBtn.classList.remove("active");
    } else {
      this.cardViewBtn.classList.remove("active");
      this.tableViewBtn.classList.add("active");
    }
    this.render();
  }

  /* -------------------------------------------------------------
   * ADD & EDIT MODAL HANDLING
   * ----------------------------------------------------------- */
  openAddModal() {
    this.clearFormErrors();
    this.studentForm.reset();
    this.removeFormPhoto();
    this.originalStudentId.value = "";
    this.formModalTitle.textContent = "Add New Student";
    this.formModalSubtitle.textContent = "Enter student details to add to the registry";
    this.saveBtnText.textContent = "Save Student";
    this.autoGenerateId();
    this.calculatedAgePreview.style.display = "none";

    this.studentFormModal.classList.add("active");
    setTimeout(() => this.studentNameInput.focus(), 150);
  }

  openEditModal(student) {
    this.clearFormErrors();
    this.originalStudentId.value = student.id;
    this.studentIdInput.value = student.id;
    this.studentNameInput.value = student.name;
    this.studentDobInput.value = student.dob;
    this.studentGradeInput.value = student.grade;
    this.studentClassInput.value = student.class_name;

    // Load existing photo if available
    if (student.photo) {
      this.studentPhotoData.value = student.photo;
      this.formPhotoImg.src = student.photo;
      this.formPhotoImg.style.display = "block";
      this.formPhotoPlaceholder.style.display = "none";
      this.removePhotoBtn.style.display = "inline-flex";
    } else {
      this.removeFormPhoto();
    }

    this.updateDobAgePreview();

    this.formModalTitle.textContent = "Edit Student Information";
    this.formModalSubtitle.textContent = `Updating records for ${student.name} (${student.id})`;
    this.saveBtnText.textContent = "Update Student";

    this.studentFormModal.classList.add("active");
    setTimeout(() => this.studentNameInput.focus(), 150);
  }

  /* -------------------------------------------------------------
   * PHOTO HANDLING (Upload, Compression & Removal)
   * ----------------------------------------------------------- */
  compressImage(file, maxWidth = 400, maxHeight = 400, quality = 0.88) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith("image/")) {
        return reject(new Error("Please select an image file"));
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  async handlePhotoFileChange(e, mode = "form") {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      const dataUrl = await this.compressImage(file);
      if (mode === "form") {
        this.studentPhotoData.value = dataUrl;
        this.formPhotoImg.src = dataUrl;
        this.formPhotoImg.style.display = "block";
        this.formPhotoPlaceholder.style.display = "none";
        this.removePhotoBtn.style.display = "inline-flex";
        this.showToast("Student photo selected", "info");
      } else if (mode === "direct" && this.studentForDirectPhoto) {
        // Direct card photo change
        const targetId = this.studentForDirectPhoto.id;
        const targetStudent = this.students.find((s) => s.id === targetId);
        if (targetStudent) {
          targetStudent.photo = dataUrl;
          targetStudent.updatedAt = new Date().toISOString();
          this.saveData();
          this.render();
          this.showToast(`Updated photo for ${targetStudent.name}`, "success");
        }
        this.studentForDirectPhoto = null;
      }
    } catch (err) {
      console.error(err);
      this.showToast(err.message || "Could not process photo", "danger");
    }

    e.target.value = "";
  }

  removeFormPhoto() {
    this.studentPhotoData.value = "";
    this.formPhotoImg.src = "";
    this.formPhotoImg.style.display = "none";
    this.formPhotoPlaceholder.style.display = "block";
    this.removePhotoBtn.style.display = "none";
    this.studentPhotoFileInput.value = "";
  }

  closeFormModal() {
    this.studentFormModal.classList.remove("active");
  }

  autoGenerateId() {
    // Generate next sequential or unique ID: STU-XXXX
    let nextNum = 1001;
    const existingIds = this.students.map((s) => s.id);
    while (existingIds.includes(`STU-${nextNum}`)) {
      nextNum++;
    }
    this.studentIdInput.value = `STU-${nextNum}`;
    this.studentIdError.classList.remove("active");
    this.studentIdInput.classList.remove("invalid");
  }

  updateDobAgePreview() {
    const dob = this.studentDobInput.value;
    const age = this.calculateAge(dob);
    if (age !== null) {
      this.calculatedAgePreview.style.display = "inline-flex";
      this.calculatedAgePreview.textContent = `Age: ${age} years old`;
    } else {
      this.calculatedAgePreview.style.display = "none";
    }
  }

  clearFormErrors() {
    [
      this.studentIdError,
      this.studentNameError,
      this.studentDobError,
      this.studentGradeError,
      this.studentClassError
    ].forEach((el) => el.classList.remove("active"));

    [
      this.studentIdInput,
      this.studentNameInput,
      this.studentDobInput,
      this.studentGradeInput,
      this.studentClassInput
    ].forEach((el) => el.classList.remove("invalid"));
  }

  handleFormSubmit(e) {
    e.preventDefault();
    this.clearFormErrors();

    const originalId = this.originalStudentId.value.trim();
    const id = this.studentIdInput.value.trim();
    const name = this.studentNameInput.value.trim();
    const dob = this.studentDobInput.value.trim();
    const grade = this.studentGradeInput.value.trim();
    const className = this.studentClassInput.value.trim();

    let hasError = false;

    // 1. Validate ID
    if (!id) {
      this.studentIdError.textContent = "Student ID is required.";
      this.studentIdError.classList.add("active");
      this.studentIdInput.classList.add("invalid");
      hasError = true;
    } else {
      // Check for duplicate ID
      const isDuplicate = this.students.some(
        (s) => s.id.toLowerCase() === id.toLowerCase() && s.id.toLowerCase() !== originalId.toLowerCase()
      );
      if (isDuplicate) {
        this.studentIdError.textContent = `Student ID "${id}" is already assigned to another student.`;
        this.studentIdError.classList.add("active");
        this.studentIdInput.classList.add("invalid");
        hasError = true;
      }
    }

    // 2. Validate Name
    if (!name) {
      this.studentNameError.textContent = "Student full name is required.";
      this.studentNameError.classList.add("active");
      this.studentNameInput.classList.add("invalid");
      hasError = true;
    }

    // 3. Validate DOB
    if (!dob) {
      this.studentDobError.textContent = "Date of Birth is required.";
      this.studentDobError.classList.add("active");
      this.studentDobInput.classList.add("invalid");
      hasError = true;
    } else {
      const birthDate = new Date(dob);
      const today = new Date();
      if (isNaN(birthDate.getTime()) || birthDate > today) {
        this.studentDobError.textContent = "Date of birth cannot be in the future.";
        this.studentDobError.classList.add("active");
        this.studentDobInput.classList.add("invalid");
        hasError = true;
      }
    }

    // 4. Validate Grade
    if (!grade) {
      this.studentGradeError.textContent = "Grade is required.";
      this.studentGradeError.classList.add("active");
      this.studentGradeInput.classList.add("invalid");
      hasError = true;
    }

    // 5. Validate Class
    if (!className) {
      this.studentClassError.textContent = "Class / Section is required.";
      this.studentClassError.classList.add("active");
      this.studentClassInput.classList.add("invalid");
      hasError = true;
    }

    if (hasError) return;

    const photo = this.studentPhotoData.value || "";

    if (originalId) {
      // Update existing student
      const index = this.students.findIndex((s) => s.id === originalId);
      if (index !== -1) {
        this.students[index] = {
          ...this.students[index],
          id,
          name,
          dob,
          grade,
          class_name: className,
          photo: photo || this.students[index].photo || "",
          updatedAt: new Date().toISOString()
        };
        this.saveData();
        this.closeFormModal();
        this.render();
        this.showToast(`Updated student: ${name}`, "success");
      }
    } else {
      // Add new student
      const newStudent = {
        id,
        name,
        dob,
        grade,
        class_name: className,
        photo: photo,
        createdAt: new Date().toISOString()
      };
      this.students.unshift(newStudent);
      this.saveData();
      this.closeFormModal();
      this.render();
      this.showToast(`Added new student: ${name}`, "success");
    }
  }

  /* -------------------------------------------------------------
   * DETAILS / ID CARD MODAL
   * ----------------------------------------------------------- */
  openDetailsModal(student) {
    this.activeStudentForDetails = student;
    const age = this.calculateAge(student.dob);
    const initials = this.getInitials(student.name);

    this.studentIdCardContainer.innerHTML = `
      <div class="id-card-header">
        <span class="id-card-school">Student Identification Card</span>
        <span style="font-size: 0.75rem; color: #a5b4fc; font-weight: 600;">OFFICIAL RECORD</span>
      </div>

      <div class="id-card-main">
        <div class="id-card-photo" style="background: ${this.getAvatarColor(student.name)}">
          ${student.photo ? `<img src="${student.photo}" alt="${this.escapeHtml(student.name)}">` : initials}
        </div>
        <div class="id-card-info">
          <div class="id-card-name">${this.escapeHtml(student.name)}</div>
          <div><span class="id-card-badge">ID: ${this.escapeHtml(student.id)}</span></div>
        </div>
      </div>

      <div class="id-card-meta">
        <div>
          <span class="id-card-meta-label">Date of Birth</span>
          <div class="id-card-meta-val">${this.formatDate(student.dob)}</div>
        </div>
        <div>
          <span class="id-card-meta-label">Grade Level</span>
          <div class="id-card-meta-val">${this.escapeHtml(student.grade)}</div>
        </div>
        <div>
          <span class="id-card-meta-label">Assigned Class</span>
          <div class="id-card-meta-val">${this.escapeHtml(student.class_name)}</div>
        </div>
      </div>

      <div style="margin-top: 14px; font-size: 0.75rem; color: #c7d2fe; display: flex; justify-content: space-between;">
        <span>Current Age: <strong>${age !== null ? `${age} years` : "N/A"}</strong></span>
        <span>Status: <strong style="color: #6ee7b7;">Enrolled</strong></span>
      </div>
    `;

    this.studentDetailsModal.classList.add("active");
  }

  closeDetailsModal() {
    this.studentDetailsModal.classList.remove("active");
    this.activeStudentForDetails = null;
  }

  /* -------------------------------------------------------------
   * DELETE CONFIRMATION MODAL
   * ----------------------------------------------------------- */
  openDeleteModal(student) {
    this.studentToDelete = student;
    this.deleteStudentName.textContent = student.name;
    this.deleteStudentId.textContent = student.id;
    this.deleteModal.classList.add("active");
  }

  closeDeleteModal() {
    this.deleteModal.classList.remove("active");
    this.studentToDelete = null;
  }

  confirmDelete() {
    if (!this.studentToDelete) return;
    const targetName = this.studentToDelete.name;
    this.students = this.students.filter((s) => s.id !== this.studentToDelete.id);
    this.saveData();
    this.closeDeleteModal();
    this.render();
    this.showToast(`Deleted student: ${targetName}`, "danger");
  }

  /* -------------------------------------------------------------
   * IMPORT & EXPORT HANDLING
   * ----------------------------------------------------------- */
  openDataModal() {
    this.dataModal.classList.add("active");
  }

  closeDataModal() {
    this.dataModal.classList.remove("active");
  }

  exportCsv() {
    if (this.students.length === 0) {
      this.showToast("No students to export", "info");
      return;
    }

    const headers = ["Student ID", "Full Name", "Date of Birth", "Grade", "Class", "Age"];
    const rows = this.students.map((s) => [
      `"${(s.id || "").replace(/"/g, '""')}"`,
      `"${(s.name || "").replace(/"/g, '""')}"`,
      `"${(s.dob || "").replace(/"/g, '""')}"`,
      `"${(s.grade || "").replace(/"/g, '""')}"`,
      `"${(s.class_name || "").replace(/"/g, '""')}"`,
      this.calculateAge(s.dob) || ""
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students_registry_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast("CSV file downloaded successfully", "success");
  }

  exportJson() {
    if (this.students.length === 0) {
      this.showToast("No students to export", "info");
      return;
    }

    const jsonString = JSON.stringify(this.students, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students_registry_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast("JSON file downloaded successfully", "success");
  }

  handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        if (file.name.endsWith(".json")) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            this.mergeImportedStudents(parsed);
          } else {
            throw new Error("Invalid JSON structure: Expected an array of student objects.");
          }
        } else if (file.name.endsWith(".csv")) {
          const parsed = this.parseCsv(text);
          this.mergeImportedStudents(parsed);
        } else {
          this.showToast("Unsupported file type. Please upload .csv or .json", "danger");
        }
      } catch (err) {
        console.error("Import error:", err);
        this.showToast(`Import failed: ${err.message}`, "danger");
      }
      this.importFileInput.value = "";
    };

    reader.readAsText(file);
  }

  parseCsv(text) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.replace(/^["']|["']$/g, "").trim().toLowerCase());
    const idIdx = headers.findIndex((h) => h.includes("id"));
    const nameIdx = headers.findIndex((h) => h.includes("name"));
    const dobIdx = headers.findIndex((h) => h.includes("dob") || h.includes("birth"));
    const gradeIdx = headers.findIndex((h) => h.includes("grade"));
    const classIdx = headers.findIndex((h) => h.includes("class") || h.includes("section"));

    const result = [];
    for (let i = 1; i < lines.length; i++) {
      // Basic CSV splitter respecting quotes
      const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(",");
      const clean = row.map((cell) => cell.replace(/^["']|["']$/g, "").trim());

      const id = idIdx !== -1 && clean[idIdx] ? clean[idIdx] : `STU-IMP-${i}`;
      const name = nameIdx !== -1 && clean[nameIdx] ? clean[nameIdx] : `Imported Student ${i}`;
      const dob = dobIdx !== -1 && clean[dobIdx] ? clean[dobIdx] : "2008-01-01";
      const grade = gradeIdx !== -1 && clean[gradeIdx] ? clean[gradeIdx] : "Grade 10";
      const className = classIdx !== -1 && clean[classIdx] ? clean[classIdx] : "Class A";

      result.push({
        id,
        name,
        dob,
        grade,
        class_name: className
      });
    }

    return result;
  }

  mergeImportedStudents(importedList) {
    let addedCount = 0;
    let updatedCount = 0;

    importedList.forEach((incoming) => {
      if (!incoming.id || !incoming.name) return;
      const existingIdx = this.students.findIndex((s) => s.id === incoming.id);
      if (existingIdx !== -1) {
        this.students[existingIdx] = {
          ...this.students[existingIdx],
          ...incoming,
          updatedAt: new Date().toISOString()
        };
        updatedCount++;
      } else {
        this.students.push({
          ...incoming,
          createdAt: new Date().toISOString()
        });
        addedCount++;
      }
    });

    this.saveData();
    this.closeDataModal();
    this.render();
    this.showToast(`Import completed: ${addedCount} added, ${updatedCount} updated`, "success");
  }

  /* -------------------------------------------------------------
   * TOAST NOTIFICATIONS
   * ----------------------------------------------------------- */
  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let iconSvg = "";
    if (type === "success") {
      iconSvg = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    } else if (type === "danger") {
      iconSvg = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
    } else {
      iconSvg = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-message">${this.escapeHtml(message)}</div>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast-leave");
      setTimeout(() => toast.remove(), 260);
    }, 3200);
  }

  /* -------------------------------------------------------------
   * UTILITIES
   * ----------------------------------------------------------- */
  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Instantiate App when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.studentApp = new StudentRegistryApp();
});
