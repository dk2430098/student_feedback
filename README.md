# Student Feedback Portal (NIT Manipur)

A full-stack web application designed for the National Institute of Technology Manipur to streamline the process of collecting, managing, and resolving student grievances. It features distinct dashboards for Students, Wardens, and System Administrators.

---

## 🔑 Demo Credentials

Use the following credentials to explore the different roles in the system.

### **1. Student**
*   **Email:** `dk2430098@gmail.com`
*   **Password:** `Deepak@123`
    *(Please ensure this user is registered via the Signup page if it doesn't exist)*

*You can also sign up for a new account.*

### **2. Warden (Hostel Management)**
*   **Email:** `warden.h1@nitmn.ac.in` (For H1 Block, and similarly `h2`, `h3`, `h4`, `h5` variants)
*   **Password:** `wardenpassword123`

### **3. Supervisor (General/Academic)**
*   **Email:** `supervisor@nitmn.ac.in`
*   **Password:** `supervisor123`

### **4. System Admin**
*   **Email:** `admin@nitmn.ac.in`
*   **Password:** `adminpassword123`

---

## 🛠️ Technology Stack

This project uses a modern **MERN-like** architecture (using Vanilla JS frontend for lightweight performance).

### **Frontend**
*   **HTML5 & CSS3**: Core structure and styling.
*   **Tailwind CSS**: Utility-first CSS framework for rapid, responsive UI development.
*   **Vanilla JavaScript (ES6+)**: Dynamic DOM manipulation, API fetching, and interactive logic (Modals, Tabs).
*   **Glassmorphism Effects**: Custom backdrop-filter styles for a premium "shiny" look.

### **Backend**
*   **Node.js**: JavaScript runtime environment.
*   **Express.js**: Web framework for handling API routes and middleware.
*   **MongoDB**: NoSQL database for storing Users, Complaints, and OTPs.
*   **Mongoose**: ODM library for MongoDB data modeling.

---

## ☁️ External Services & Integrations

The application integrates with several third-party services for essential functionality:

### **1. Database: MongoDB Atlas**
*   **Purpose**: Cloud-hosted NoSQL database for flexible and scalable data storage.
*   **Usage**: Stores all User profiles, Complaint records, and OTP sessions.
*   **Connection**: Controlled via `MONGO_URL` in environment variables.

### **2. Email Service: Gmail SMTP (App Password)**
*   **Purpose**: Sending OTPs (One-Time Passwords) for user verification and notifications.
*   **Implementation**: Uses `nodemailer` with a specialized **Google App Password**.
*   **Security**: Requires 2FA enabled on the Google Account and a dedicated 16-character App Password, ensuring main account password safety.

### **3. Contact Form: Formspree**
*   **Purpose**: Handling public "Send a Message" queries from the Landing Page without backend boilerplate.
*   **Usage**: The frontend `index.js` submits directly to a unique **Formspree** endpoint.
*   **Configuration**: The Formspree URL is managed via `config.js` or environment variables.

### **4. Media Storage: Cloudinary**
*   **Purpose**: storing image and video evidence uploaded by students causing complaints.
*   **Usage**: The backend uses `multer-storage-cloudinary` to directly upload files to Cloudinary.
*   **Data Flow**: The file is stored in the cloud, and only the **secure URL** is saved in the MongoDB database to keep it lightweight.

---

## 📦 Packages & Enhancements

### **Security** 🛡️
*   **`bcryptjs`**: Hashes passwords securely before storing them in the database.
*   **`jsonwebtoken (JWT)`**: Handles secure user authentication and session management via tokens.
*   **`helmet`**: Sets secure HTTP headers to protect against common web vulnerabilities.
*   **`express-mongo-sanitize`**: Prevents MongoDB Operator Injection attacks.
*   **`express-rate-limit`**: Limits repeated requests to public APIs (Prevents DDoS/Brute Force).
*   **`cors`**: Manages Cross-Origin Resource Sharing.

### **Enhancements & Utilities** 🚀
*   **`multer`**: Middleware for handling `multipart/form-data` (File Uploads).
*   **`otp-generator`**: Generates secure 6-digit OTPs for email verification.
*   **`compression`**: Compresses HTTP responses to improve load times.

---

## 📂 Project Structure Explained

Here's a guide to understanding the codebase structure:

```bash
/student_feedback
│
├── /backend
│   ├── /controllers    # Logic for handling requests (Auth, Admin, Student, Warden)
│   │   ├── adminController.js   # Admin logic (manage staff, stats)
│   │   ├── authController.js    # Signup, Login, OTP logic (Nodemailer here)
│   │   └── complaintController.js # CRUD operations (Cloudinary Logic here)
│   │
│   ├── /models         # Mongoose Database Schemas
│   │   ├── User.js          # User schema (Student, Warden, Admin)
│   │   └── Complaint.js     # Complaint schema (Title, Desc, Media)
│   │
│   ├── /routes         # API Route definitions
│   │   ├── authRoutes.js    # /api/auth
│   │   └── adminRoutes.js   # /api/admin
│   │
│   ├── server.js       # Main entry point for the Backend Server
│   └── seedWarden.js   # Script to seed default Warden/Staff accounts
│
├── /frontend
│   ├── /assets
│   │   └── /js/dashboard.js # Shared logic for logout, auth checks
│   │
│   ├── /css
│   │   └── style.css        # Global styles (Tailwind imports)
│   │
│   ├── /dashboards     # Dashboard HTML pages
│   │   ├── student.html     # Student Portal UI
│   │   ├── warden.html      # Warden/Staff Portal UI
│   │   └── admin.html       # System Admin Portal UI
│   │
│   ├── /js             # Dashboard-specific Frontend Logic
│   │   ├── student.js       # Fetches complaints, handles form submission
│   │   ├── warden.js        # Filters complaints, handles resolution
│   │   └── admin.js         # Loads System Stats, manages users
│   │   └── index.js         # Landing Page Logic (Formspree Integration)
│   │
│   ├── index.html      # Landing Page
│   └── login.html      # Login Page
```

---

## 🚀 How to Run Locally

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/dk2430098/student_feedback.git
    cd student_feedback
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    npm install
    # Create .env file with: MONGO_URL, JWT_SECRET, CLOUDINARY_*, EMAIL_*, WARDEN_PASSWORD, SUPERVISOR_PASSWORD, ADMIN_PASSWORD etc.
    npm start
    ```

3.  **Setup Frontend**
    *   Serve the `frontend` folder using any static server (e.g., Live Server or `npx serve`).
    *   Open `http://localhost:3000` (or your port).

---

## 📬 Contact & Support

For issues, please file a GitHub Issue or contact the development team at `dev@nitmn.ac.in`.

*(Developed by Deepak Kumar)*
