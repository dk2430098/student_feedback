# Student Feedback Portal (NIT Manipur)

A digital grievance redressal system designed effectively for **NIT Manipur**. This platform bridges the gap between students and the administration by providing a transparent, fast, and accountable way to resolve campus issues.

---

## 🚀 Why This Project?

In a large campus environment, students often face difficulties in getting their issues resolved—whether it's a broken fan in the hostel, unhygienic mess food, or academic concerns. Traditional methods (applications/letters) are slow and hard to track.

**This portal solves that by:**
1.  **Direct Communication**: Connecting students directly to the responsible authority (Warden/Supervisor).
2.  **Accountability**: Every complaint has a live status (Pending -> Resolved).
3.  **Proof-Based**: Students can upload photos/videos, leaving no room for ambiguity.
4.  **Security**: Strict verification using Email OTPs ensures only genuine students can access the system.

---

## 👥 User Roles & Capabilities

The system is divided into **4 Distinct Roles**, each with specific permissions and limits.

### **1. Student 🎓**
*   **What they can do:**
    *   **Sign Up & Verify**: Create an account using their email. A **6-digit OTP** is sent via Gmail API to verify identity.
    *   **Post Complaints**: Submit detailed grievances regarding Hostel, Mess, Academics, or Security.
    *   **Attach Evidence**: Upload images or videos (handled by Cloudinary) to prove their case.
    *   **Track Status**: See real-time updates (Pending ⏳ / Resolved ✅) on their dashboard.
*   **Limits:**
    *   Cannot see complaints filed by other students (Privacy).
    *   Cannot resolve complaints.

### **2. Hostel Warden 🏠**
*   **Responsibility**: Managing specific hostel blocks (e.g., H1, H2, Girls Hostel).
*   **What they can do:**
    *   **View Block-Specific Issues**: A Warden for "H1" will *only* see complaints tagged for "H1" or "Mess".
    *   **Resolve/Reject**: Mark complaints as "Resolved" after fixing the issue, or "Rejected" if invalid.
    *   **Instant Notification**: They are the first line of action for hostel maintenance.
*   **Limits:**
    *   Cannot view Academic or Security complaints.
    *   Cannot access data of other hostel blocks.

### **3. Student Supervisor 👔**
*   **Responsibility**: Overseeing general campus issues (Academics, Security, Sanitation).
*   **What they can do:**
    *   **Handle General Issues**: Handles complaints that don't fall under a specific hostel warden.
    *   **Academic Grievances**: Addresses exam, schedule, or faculty-related concerns.
*   **Limits:**
    *   Does not micromanage individual hostel room repairs (left to Wardens).

### **4. System Admin 🛠️**
*   **Responsibility**: Total system oversight.
*   **What they can do:**
    *   **God Mode**: Can view **ALL** complaints from every hostel and category.
    *   **Re-Assign Complaints**: If a student mistakenly sends a "Hostel" complaint to "Academics", the Admin can correct it.
    *   **Live Statistics**: View charts and graphs of total vs. resolved complaints.
    *   **Manage Staff**: Add or remove Wardens/Supervisors.

---

## ⚙️ How It Works (Backend Integrations)

We use powerful external services to make the system robust:

*   **Authentication (OTP & Security)**:
    *   We use **Nodemailer + Gmail SMTP** to send real 6-digit OTPs to users during signup.
    *   Passwords are never stored in plain text; we use **Bcrypt Hashing**.
    *   Sessions are secured using **JWT (JSON Web Tokens)**.

*   **Media Handling**:
    *   When a student uploads a photo of a broken window, we don't clog our database.
    *   The file is sent to **Cloudinary** (a cloud media service).
    *   We only store the *secure link* in our **MongoDB Atlas** database.

*   **Public Contact Form**:
    *   The "Contact Us" form on the landing page is powered by **Formspree**.
    *   Messages sent there go directly to the Admin's email inbox without needing a backend server to process them.

---

## 🔑 Demo Credentials

### **Student**
*   **Email:** `dk2430098@gmail.com`
*   **Password:** `Deepak@123`

### **Warden (Hostel H1)**
*   **Email:** `warden.h1@nitmn.ac.in`
*   **Password:** `wardenpassword123`

### **Supervisor (Academic)**
*   **Email:** `supervisor@nitmn.ac.in`
*   **Password:** `supervisor123`

### **System Admin**
*   **Email:** `admin@nitmn.ac.in`
*   **Password:** `adminpassword123`

---

## 🛠️ Tech Stack

*   **Frontend**: HTML5, Tailwind CSS, Vanilla JS (Glassmorphism UI).
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB Atlas.

---

## 📬 Contact

*(Developed by Deepak Kumar)*
