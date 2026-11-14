# 🎓 Student Registry Application

A modern, responsive, and mobile-friendly application for managing student academic records with real-time updates and full editing capabilities.

---

## 🌟 Key Features

### 📋 Student Information Fields
Every student profile records the exact required academic information:
1. **Student ID** (e.g. `STU-1001` - unique identifier with automatic generation option)
2. **Student Full Name** (e.g. `Alexander Hamilton`)
3. **Student Date of Birth (DOB)** (with live age calculation: e.g. `16 yrs old`)
4. **Student Grade** (e.g. `Grade 10`, `Grade 11`, `Grade 12`, etc.)
5. **Student Class / Section** (e.g. `Class A`, `Class B`, `Science Section`, `Arts Section`)

---

## 📱 Mobile-First & Responsive Design

- **Thumb-Friendly Bottom Navigation**: Easy one-thumb access on smartphones for **Students**, **Search**, **Add (+)**, **Data/Export**, and **Stats**.
- **Slide-up Bottom Sheet**: On mobile devices, the Add/Edit form smoothly slides up from the bottom for easy typing and tap targets (44px+ minimum).
- **Responsive Card & Table Views**:
  - **Card View** (optimized for smartphones): Clean cards with student avatar initials, colored badges, DOB, age, grade, class, and quick action buttons.
  - **Table View** (optimized for tablets & desktop PCs): Structured tabular display with sortable headers.
- **Dark & Light Mode**: Automatic system preference detection with one-click manual toggle.
- **100% Offline Capable**: Zero external CDN dependencies. All styles, icons (SVG), and scripts are fully self-contained.

---

## ⚡ Core Operations (CRUD & Beyond)

- ➕ **Add Student**: Clean form with instant field validation, duplicate ID prevention, and auto-ID generator.
- ✏️ **Edit & Update**: Click **"Edit"** on any student card or table row to update their name, ID, date of birth, grade, or assigned class.
- 🗑️ **Delete Record**: Safe removal with a confirmation prompt.
- 🔍 **Live Search**: Instant real-time search across Student ID, Name, Grade, or Class.
- 🎯 **Filter & Sort**:
  - Filter by specific Grade or Class
  - Sort by Name (A-Z / Z-A), Student ID, Age (Youngest/Oldest), or Grade
- 🪪 **Digital Student ID Card**: Click **"View"** on any student to display and print their official digital Student ID badge.
- 💾 **Data Backup & Export**:
  - Export to **Excel CSV**
  - Export to **JSON** backup
  - Import CSV/JSON records
  - Reset to sample data anytime

---

## 🚀 How to Launch the Application

### Method 1: One-Click Windows Launcher (Easiest)
Simply double-click the included file:
```
start-app.bat
```
This automatically starts the local server and launches your default web browser!

---

### Method 2: Access from Mobile Phone / Tablet over Wi-Fi
To open the application on your smartphone:
1. Open PowerShell or Command Prompt in this folder.
2. Run:
   ```bash
   node server.js
   ```
3. The terminal will display your network URL, for example:
   ```
   > Local PC:        http://localhost:3000
   > Mobile Device:   http://192.168.1.X:3000   (Connect your phone to the same Wi-Fi)
   ```
4. Open that URL on your phone's browser (Safari, Chrome, etc.) to use the mobile app!

---

### Method 3: Direct Browser Launch (No Server Needed)
Simply double-click:
```
index.html
```
The application will open directly in any web browser and use browser `localStorage` to save and persist all changes automatically.

---

## 📁 Project Structure

```
Students Registry/
├── index.html       # Semantic mobile-first HTML layout & modals
├── styles.css       # Responsive styling, bottom sheet & theme variables
├── app.js           # Full CRUD logic, age calculator, search & filters
├── server.js        # Zero-dependency Node.js HTTP & REST API server
├── start-app.bat    # Windows batch launcher
├── package.json     # Node.js project configuration
├── data/
│   └── students.json # Persistent JSON data file for backend storage
└── README.md        # Documentation
```
