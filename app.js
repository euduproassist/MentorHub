/* =========================================================
   MentorHub - Full App.js (PART 1)
   Data Model, Storage System, Routing
========================================================= */

/* ----------------------------------------------
   LocalStorage Utility
---------------------------------------------- */
function getData(key) {
    return JSON.parse(localStorage.getItem(key) || "[]");
}

function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

/* ----------------------------------------------
   Data Keys
---------------------------------------------- */
const APP_KEY = "mentorhub_applications";
const USER_KEY = "mentorhub_users";
const ADMIN_KEY = "mentorhub_admin";

/* ----------------------------------------------
   Default Admin Account (auto-create)
---------------------------------------------- */
function initAdmin() {
    if (!localStorage.getItem(ADMIN_KEY)) {
        const admin = {
            username: "admin",
            email: "admin@mentorhub.com",
            password: "admin123"
        };
        saveData(ADMIN_KEY, admin);
    }
}
initAdmin();

/* ----------------------------------------------
   Basic Navigation (index → applicant/admin)
---------------------------------------------- */
function goToApplicant() {
    window.location.href = "applicant-portal.html";
}

function goToAdmin() {
    window.location.href = "admin-portal.html";
}

/* ----------------------------------------------
   Application Constructor
---------------------------------------------- */
function createApplication(data) {
    return {
        id: Date.now(),
        name: data.name,
        email: data.email,
        contact: data.contact,
        university: data.university,
        courses: data.courses,
        documents: data.documents,
        status: "Pending",
        adminNote: "",
        date: new Date().toLocaleString()
    };
}
/* =========================================================
   MentorHub - Full App.js (PART 2)
   Applicant Features
========================================================= */

/* ----------------------------------------------
   Get Logged-in User Info (simulate login for now)
---------------------------------------------- */
let currentApplicant = JSON.parse(sessionStorage.getItem("currentApplicant")) || null;

function loginApplicant(name, email) {
    currentApplicant = { name, email };
    sessionStorage.setItem("currentApplicant", JSON.stringify(currentApplicant));
}

/* ----------------------------------------------
   Applicant Dashboard
---------------------------------------------- */
function showApplicantDashboard() {
    if (!currentApplicant) {
        alert("Please login first!");
        window.location.href = "index.html";
        return;
    }

    const dashboardName = document.getElementById("welcomeName");
    if (dashboardName) {
        dashboardName.innerText = `Welcome, ${currentApplicant.name} 👩‍🎓`;
    }

    const applications = getData(APP_KEY);
    const myApplications = applications.filter(app => app.email === currentApplicant.email);

    const summary = document.getElementById("applicantSummary");
    if (summary) {
        summary.innerHTML = `
            <p>Total Applications: ${myApplications.length}</p>
            <p>Pending: ${myApplications.filter(a => a.status === "Pending").length}</p>
            <p>Approved: ${myApplications.filter(a => a.status === "Approved").length}</p>
            <p>Rejected: ${myApplications.filter(a => a.status === "Rejected").length}</p>
        `;
    }

    const requestsContainer = document.getElementById("applicationRequests");
    if (requestsContainer) {
        requestsContainer.innerHTML = myApplications.map(app => `
            <div class="request-card">
                <h4>${app.university}</h4>
                <p>Courses: ${app.courses.join(", ")}</p>
                <p>Status: <strong>${app.status}</strong></p>
                <p>Admin Notes: ${app.adminNote || "None"}</p>
                <p>Submitted: ${app.date}</p>
            </div>
        `).join("");
    }
}

/* ----------------------------------------------
   Submit New Application
---------------------------------------------- */
function submitApplicationForm(event) {
    event.preventDefault();
    const name = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const contact = document.getElementById("contact").value;
    const university = document.getElementById("university").value;
    const courses = Array.from(document.querySelectorAll('input[name="courses"]:checked')).map(c => c.value);
    const documents = Array.from(document.getElementById("documents").files).map(file => file.name);

    if (courses.length < 3) {
        alert("Please select at least 3 courses!");
        return;
    }

    const newApp = createApplication({ name, email, contact, university, courses, documents });
    const applications = getData(APP_KEY);
    applications.push(newApp);
    saveData(APP_KEY, applications);

    alert("Application submitted successfully!");
    document.getElementById("applicationForm").reset();
    showApplicantDashboard();
}

/* ----------------------------------------------
   Edit Applicant Profile
---------------------------------------------- */
function showProfile() {
    if (!currentApplicant) return;
    document.getElementById("profileName").value = currentApplicant.name;
    document.getElementById("profileEmail").value = currentApplicant.email;
}

function updateProfile() {
    const name = document.getElementById("profileName").value;
    const email = document.getElementById("profileEmail").value;

    currentApplicant.name = name;
    currentApplicant.email = email;
    sessionStorage.setItem("currentApplicant", JSON.stringify(currentApplicant));

    alert("Profile updated successfully!");
    showApplicantDashboard();
}

/* ----------------------------------------------
   Logout
---------------------------------------------- */
function logoutApplicant() {
    sessionStorage.removeItem("currentApplicant");
    window.location.href = "index.html";
}
/* =========================================================
   MentorHub - Full App.js (PART 3)
   Admin Features
========================================================= */

/* ----------------------------------------------
   Admin Login (simulate login for now)
---------------------------------------------- */
let currentAdmin = JSON.parse(sessionStorage.getItem("currentAdmin")) || null;

function loginAdmin(username, password) {
    const admin = getData(ADMIN_KEY);
    if (username === admin.username && password === admin.password) {
        currentAdmin = admin;
        sessionStorage.setItem("currentAdmin", JSON.stringify(currentAdmin));
        window.location.href = "admin-portal.html";
    } else {
        alert("Invalid admin credentials!");
    }
}

/* ----------------------------------------------
   Admin Dashboard Summary
---------------------------------------------- */
function showAdminDashboard() {
    if (!currentAdmin) {
        alert("Please login as admin!");
        window.location.href = "index.html";
        return;
    }

    const applications = getData(APP_KEY);
    const total = applications.length;
    const pending = applications.filter(a => a.status === "Pending").length;
    const approved = applications.filter(a => a.status === "Approved").length;
    const rejected = applications.filter(a => a.status === "Rejected").length;

    const summary = document.getElementById("adminSummary");
    if (summary) {
        summary.innerHTML = `
            <p>Total Applications: ${total}</p>
            <p>Pending: ${pending}</p>
            <p>Approved: ${approved}</p>
            <p>Rejected: ${rejected}</p>
        `;
    }

    const requestsContainer = document.getElementById("adminRequests");
    if (requestsContainer) {
        requestsContainer.innerHTML = applications.map(app => `
            <div class="admin-request-card">
                <h4>${app.name} → ${app.university}</h4>
                <p>Email: ${app.email}</p>
                <p>Courses: ${app.courses.join(", ")}</p>
                <p>Documents: ${app.documents.join(", ")}</p>
                <p>Status: <strong>${app.status}</strong></p>
                <p>Admin Notes: ${app.adminNote || "None"}</p>
                <button onclick="updateApplicationStatus(${app.id}, 'Approved')">Approve</button>
                <button onclick="updateApplicationStatus(${app.id}, 'Rejected')">Reject</button>
                <input type="text" id="note-${app.id}" placeholder="Add note..." />
                <button onclick="addAdminNote(${app.id})">Add Note</button>
            </div>
        `).join("");
    }
}

/* ----------------------------------------------
   Update Application Status
---------------------------------------------- */
function updateApplicationStatus(appId, status) {
    const applications = getData(APP_KEY);
    const index = applications.findIndex(a => a.id === appId);
    if (index !== -1) {
        applications[index].status = status;
        saveData(APP_KEY, applications);
        alert(`Application ${status.toLowerCase()} successfully!`);
        showAdminDashboard();
    }
}

/* ----------------------------------------------
   Add Admin Note
---------------------------------------------- */
function addAdminNote(appId) {
    const noteInput = document.getElementById(`note-${appId}`);
    if (!noteInput) return;

    const note = noteInput.value.trim();
    if (!note) {
        alert("Enter a note first!");
        return;
    }

    const applications = getData(APP_KEY);
    const index = applications.findIndex(a => a.id === appId);
    if (index !== -1) {
        applications[index].adminNote = note;
        saveData(APP_KEY, applications);
        alert("Note added successfully!");
        noteInput.value = "";
        showAdminDashboard();
    }
}

/* ----------------------------------------------
   Admin Profile & Logout
---------------------------------------------- */
function showAdminProfile() {
    if (!currentAdmin) return;
    document.getElementById("adminUsername").value = currentAdmin.username;
    document.getElementById("adminEmail").value = currentAdmin.email;
}

function updateAdminProfile() {
    const username = document.getElementById("adminUsername").value;
    const email = document.getElementById("adminEmail").value;

    currentAdmin.username = username;
    currentAdmin.email = email;
    saveData(ADMIN_KEY, currentAdmin);
    sessionStorage.setItem("currentAdmin", JSON.stringify(currentAdmin));

    alert("Admin profile updated!");
}

function logoutAdmin() {
    sessionStorage.removeItem("currentAdmin");
    window.location.href = "index.html";
}
/* =========================================================
   MentorHub - Full App.js (PART 4)
   Notifications & Final Touches
========================================================= */

/* ----------------------------------------------
   Simulated Notifications for Applicant
---------------------------------------------- */
function notifyApplicant(message) {
    // Simple alert simulation
    alert(`🔔 Notification: ${message}`);
}

/* Call this function whenever status changes */
function checkForUpdates() {
    if (!currentApplicant) return;
    const applications = getData(APP_KEY);
    const myApplications = applications.filter(app => app.email === currentApplicant.email);

    myApplications.forEach(app => {
        const lastSeen = sessionStorage.getItem(`app-last-${app.id}`) || "";
        if (app.status !== "Pending" && lastSeen !== app.status) {
            notifyApplicant(`Your application to ${app.university} is now ${app.status}!`);
            sessionStorage.setItem(`app-last-${app.id}`, app.status);
        }
    });
}

/* ----------------------------------------------
   Auto-refresh dashboard updates every 5 seconds
---------------------------------------------- */
setInterval(() => {
    if (currentApplicant) {
        showApplicantDashboard();
        checkForUpdates();
    }
    if (currentAdmin) {
        showAdminDashboard();
    }
}, 5000);

/* ----------------------------------------------
   Initial Setup Calls
---------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("welcomeName")) showApplicantDashboard();
    if (document.getElementById("applicantSummary")) showApplicantDashboard();
    if (document.getElementById("adminSummary")) showAdminDashboard();
});

/* ----------------------------------------------
   Helper for File Upload Preview (optional)
---------------------------------------------- */
function previewFiles(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;

    preview.innerHTML = "";
    Array.from(input.files).forEach(file => {
        const p = document.createElement("p");
        p.textContent = file.name;
        preview.appendChild(p);
    });
}
 
