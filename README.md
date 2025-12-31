# 🎓 Student Feedback Portal (NIT Manipur)

A comprehensive feedback management system designed to bridge the gap between students and administration. This full-stack application allows students to submit complaints anonymously or officially, while providing Wardens and Admins with powerful dashboards to resolve issues efficiently.

![Project Preview](https://via.placeholder.com/800x400?text=Student+Feedback+Portal+UI)

---

## 🚀 Features

### 👨‍🎓 **Student Module**
*   **Secure Auth**: Signup/Login with Email OTP verification.
*   **Complaint Filing**: Submit complaints (Academics, Hostel, Mess, etc.) with **Image/Video Proofs**.
*   **Track Status**: Real-time updates (Pending -> Resolved) with color-coded badges.
*   **Profile Management**: Update academic details and profile picture.
*   **AI Chatbot**: A smart assistant (Python/ML-based) to answer common queries instantly.

### 👮 **Warden/Supervisor Module**
*   **Complaint Dashboard**: View complaints filtered by category (e.g., specific Hostel Block).
*   **Action Center**: Mark complaints as "Resolved" and attach **Resolution Proofs** (photos of the fixed issue).
*   **Profile**: Manage supervisor details.

### 👑 **Admin Module**
*   **Analytics**: Visual charts showing complaint volume and resolution rates.
*   **User Management**: Manage Students, Wardens, and Supervisors.
*   **Global Oversight**: Access to all complaints across the institution.

---

## 🛠️ Tech Stack & Decisions

### **Backend (Node.js & Python)**
We chose a **Hybrid Backend** to leverage the speed of Node.js for API handling and the power of Python for Machine Learning.
*   **Node.js & Express**: Fast, non-blocking I/O for handling concurrent API requests.
*   **MongoDB (Atlas)**: Flexible NoSQL schema, perfect for storing varied complaint data and user profiles.
*   **Mongoose**: ODM for strict schema modeling and data validation.
*   **Nodemailer**: Used for **OTP Generation & Email Notifications**. We chose this over third-party APIs (like Twilio) to keep costs zero for the university.
*   **Cloudinary**: Handles **Image & Video Uploads**. It optimizes media automatically, saving bandwidth.
*   **Python (Scikit-Learn)**: Powers the **Chatbot**. We used a TF-IDF (Term Frequency-Inverse Document Frequency) + Cosine Similarity model to match user queries with a flexible knowledge base.
*   **Child Process**: The Node server spawns a Python process to get chatbot answers in real-time.

### **Frontend (Vanilla JS + Tailwind)**
*   **Vanilla JavaScript**: No heavy frameworks (React/Angular) to ensure **maximum performance** and fast load times on campus networks.
*   **Tailwind CSS**: Utility-first CSS for a modern, responsive, and "Premium" glassmorphism design.
*   **Vercel**: Chosen for frontend hosting due to its global CDN and ease of CI/CD.

---

## 🏗️ Architecture & Implementation

### **1. Authentication System (OTP)**
To prevent spam, we implemented a 2-step verification:
1.  User enters email/password.
2.  Backend generates a 6-digit OTP using `crypto.randomInt`, hashes it using `bcrypt`, and stores it temporarily in the DB.
3.  `Nodemailer` sends the code via SMTP (Gmail).
4.  Account is only created after valid OTP submission.

### **2. Dynamic Configuration**
Since the frontend (Vercel) and backend (Render) are separate:
*   We use a `generate-config.js` script during the build process.
*   It reads the `API_BASE_URL` from Vercel's Environment Variables and injects it into `config.js`.
*   This allows the code to work seamlessly on `localhost` (dev) and `deployment` (prod) without changing a single line of code.

### **3. The "Hybrid" Chatbot**
Instead of a simple if-else bot, we built a Context-Aware ML Bot:
*   **Input**: User types "Food is bad".
*   **Processing**:
    1.  Node.js receives the request.
    2.  Spawns `python3 chatbot.py "Food is bad"`.
    3.  Python loads `knowledgeBase.json`, vectorizes the text using `TfidfVectorizer`, finds the closest match using `cosine_similarity`.
*   **Output**: "Please report this in the Mess category...".

---

## 🧗 Challenges & Solutions

### **1. The "Cold Start" Problem**
*   **Problem**: Users reported "Login is slow". This was because Render's Free Tier puts the server to sleep after 15 mins of inactivity.
*   **Solution**: We implemented a "Keep-Alive" ping and added **Loading Spinners** to all buttons (Login/Signup/OTP). This gives users immediate visual feedback that "something is happening," improving User Experience (UX) significantly.

### **2. Deployment Dependencies (Python on Node)**
*   **Problem**: The Chatbot failed in production with `ModuleNotFoundError`. Render's Node environment doesn't strictly manage Python packages.
*   **Solution**: We wrote a custom `render-build.sh` script. It explicitly installs `npm` dependencies AND `pip install -r requirements.txt` (scikit-learn, pandas) every time the server builds.

### **3. Cross-Origin Resource Sharing (CORS)**
*   **Problem**: The Frontend (Vercel) couldn't talk to the Backend (Render) due to browser security policies.
*   **Solution**: We configured the Express `cors` middleware to explicitly allow requests from our Vercel domain, ensuring secure but functional communication.

### **4. UI Layout Bugs**
*   **Problem**: Use of `absolute` positioning for the footer caused it to cover the Signup form on small screens.
*   **Solution**: Refactored the entire authentication flow to use a vertical Flexbox layout (`flex-col`). The footer now sits naturally at the bottom (`mt-auto`), pushing down only when content ends.

---

## 🚀 Setup & Installation

### **Backend**
1.  Navigate to `/backend`.
2.  Install dependencies:
    ```bash
    npm install
    pip install -r requirements.txt
    ```
3.  Create `.env` file with `MONGO_URL`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, `CLOUDINARY_XXX`.
4.  Run: `npm start`

### **Frontend**
1.  Navigate to `/frontend`.
2.  Run: `npx serve`
3.  Open `http://localhost:3000`.

---

© 2025 Deepakkumar. Deepmind-Antigravity.
