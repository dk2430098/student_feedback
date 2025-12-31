# Student Feedback Portal (NIT Manipur)

![NITMN Logo](frontend/assets/images/nitmn_logo.jpg)

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

## 📬 Email & Messaging Architecture (Dual System)

We utilize **two separate email channels** to optimize performance and security:

1.  **Transactional Emails (Nodemailer + Gmail SMTP)**
    *   **Purpose**: Critical System functions like **New Account Verification (OTP)** and internal notifications.
    *   **Why**: We need full control and security for sending OTPs.
    *   **Flow**: User -> Backend API -> Nodemailer -> Gmail App Server -> User Inbox.

2.  **Public Contact Form (Formspree)**
    *   **Purpose**: Handling public "Send a Message" queries from the Landing Page (before login).
    *   **Why**: Removes the need for backend storage of generic spam/queries. Formspree handles spam filtering and forwarding.
    *   **Flow**: Website Visitor -> Formspree API -> Admin Email Inbox.

---

## 📦 Dependencies & Packages Used

The project relies on these specific highly reliable packages:

### **Security & Auth**
*   **`bcrypt`**: For reliable password hashing.
*   **`jsonwebtoken`**: For secure, stateless session management.
*   **`helmet`**: Adds security headers to protect against XSS and basic attacks.
*   **`express-mongo-sanitize`**: Prevents database injection attacks.
*   **`express-rate-limit`**: Protects the API from Brute Force and DDoS attacks.
*   **`cors`**: Manages browser security access from frontend to backend.
*   **`otp-generator`**: Creates random, cryptographically strong 6-digit codes.

### **Core Backend**
*   **`express`**: Fast, unopinionated web framework for Node.js.
*   **`mongoose`**: Elegant MongoDB object modeling for managing data.
*   **`dotenv`**: For managing environment variables securely (API keys, Credentials).
*   **`cookie-parser`**: Parses secure HttpOnly cookies for Auth.

### **Media & Communication**
*   **`nodemailer`**: The industry standard for sending emails from Node.js applications.
*   **`multer`**: Middleware for handling `multipart/form-data` uploads.
*   **`cloudinary`** & **`multer-storage-cloudinary`**: Seamless integration for storing uploaded complaint images/videos in the cloud.

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

## 📬 Contact Support

*(Developed by Deepak Kumar)*
