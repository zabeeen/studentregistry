/**
 * Lightweight, zero-dependency Node.js HTTP & REST API server
 * Serves the mobile-friendly Student Registry application
 * and persists student records to data/students.json.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "students.json");

// Default initial data
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

// Ensure data directory and data file exist
function initStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_STUDENTS, null, 2), "utf8");
  }
}

function readStudents() {
  try {
    initStorage();
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading students file:", err);
    return DEFAULT_STUDENTS;
  }
}

function writeStudents(students) {
  try {
    initStorage();
    fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing students file:", err);
    return false;
  }
}

// MIME types for static assets
const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

// Request Body Parser helper
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 5 * 1024 * 1024) {
        // 5MB safeguard
        req.destroy();
        reject(new Error("Request payload too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS & Security headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // ---------------- API ROUTES ----------------
  if (pathname.startsWith("/api/students")) {
    const parts = pathname.split("/").filter(Boolean); // ['api', 'students', ?id]
    const studentIdParam = parts.length > 2 ? decodeURIComponent(parts[2]) : null;

    // GET /api/students
    if (req.method === "GET") {
      const students = readStudents();
      if (studentIdParam) {
        const found = students.find((s) => s.id === studentIdParam);
        if (found) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(found));
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Student not found" }));
        }
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(students));
      }
      return;
    }

    // POST /api/students (Add new student)
    if (req.method === "POST") {
      try {
        const payload = await getRequestBody(req);
        if (!payload.id || !payload.name) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Student ID and Name are required" }));
          return;
        }

        const students = readStudents();
        if (students.some((s) => s.id.toLowerCase() === payload.id.toLowerCase())) {
          res.writeHead(409, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Student ID already exists" }));
          return;
        }

        const newStudent = {
          ...payload,
          createdAt: new Date().toISOString()
        };
        students.unshift(newStudent);
        writeStudents(students);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(newStudent));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // PUT /api/students (Bulk sync / replacement) or PUT /api/students/:id (Update single)
    if (req.method === "PUT") {
      try {
        const payload = await getRequestBody(req);
        let students = readStudents();

        if (studentIdParam) {
          // Update single student
          const index = students.findIndex((s) => s.id === studentIdParam);
          if (index === -1) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Student not found" }));
            return;
          }

          students[index] = {
            ...students[index],
            ...payload,
            updatedAt: new Date().toISOString()
          };
          writeStudents(students);

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(students[index]));
        } else if (Array.isArray(payload)) {
          // Bulk sync
          students = payload;
          writeStudents(students);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Synced successfully", count: students.length }));
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Expected an array of students or student ID parameter" }));
        }
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // DELETE /api/students/:id
    if (req.method === "DELETE" && studentIdParam) {
      let students = readStudents();
      const filtered = students.filter((s) => s.id !== studentIdParam);
      if (filtered.length === students.length) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Student not found" }));
        return;
      }

      writeStudents(filtered);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Student deleted successfully" }));
      return;
    }
  }

  // ---------------- STATIC FILE SERVING ----------------
  let safePath = pathname === "/" ? "/index.html" : pathname;
  safePath = path.normalize(safePath).replace(/^(\.\.[\/\\])+/, "");
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routing if requested
      const indexFile = path.join(__dirname, "index.html");
      fs.readFile(indexFile, (err2, content) => {
        if (err2) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("404 Not Found");
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(content);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    fs.readFile(filePath, (err2, content) => {
      if (err2) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("500 Internal Server Error");
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
      }
    });
  });
});

// Helper to find local IPv4 network address
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

initStorage();

server.listen(PORT, "0.0.0.0", () => {
  const ips = getLocalIpAddresses();
  console.log("=================================================");
  console.log("🎓 Student Registry Application is Running!");
  console.log("=================================================");
  console.log(`> Local PC:        http://localhost:${PORT}`);
  if (ips.length > 0) {
    ips.forEach((ip) => {
      console.log(`> Mobile Device:   http://${ip}:${PORT}  (Connect to same Wi-Fi)`);
    });
  } else {
    console.log(`> Mobile Device:   http://<YOUR-PC-IP>:${PORT}`);
  }
  console.log("=================================================");
  console.log("Press Ctrl + C at any time to stop the server.");
});
