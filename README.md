# Student Feedback Portal (NIT Manipur)

A comprehensive feedback management system designed for **NIT Manipur** to streamline communication between students, wardens, and administration. Features a secure complaint lodging system, real-time status tracking, and an AI-powered chatbot for instant assistance.

![NITMN Logo](frontend/assets/images/nitmn_logo.jpg)

## 🚀 Features

### 🎓 For Students
- **Secure Authentication**: Signup/Login with Email OTP verification.
- **Lodge Complaints**: categorized by **Mess**, **Hostel**, or **Academic** issues.
- **Evidence Upload**: Attach photos/videos (max 50MB) to support complaints.
- **Real-time Tracking**: Monitor complaint status (Pending, In-Progress, Resolved).
- **AI Chatbot**: Instant answers to campus queries using Python/ML (TF-IDF).

### 👮‍♂️ For Wardens & Admin
- **Role-based Dashboards**: distinct views for Wardens, Supervisors, and Admin.
- **Complaint Management**: View, Assign, and Resolve complaints.
- **Proof of Resolution**: Upload evidence when closing a complaint.
- **Analytics**: Visual overview of complaint stats.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Tailwind CSS, JavaScript (Vanilla).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **AI/ML**: Python (`scikit-learn`, `numpy`) for Chatbot logic.
- **Security**: JWT Auth, OTP Verification, Rate Limiting, Input Sanitization.

## 📂 Project Structure

```
student_feedback/
├── backend/
│   ├── controllers/      # Logic for Auth, Chat, Complaints
│   ├── data/            # Knowledge Base for Chatbot
│   ├── middleware/       # Auth, Upload, Security
│   ├── ml/              # Python Chatbot Engine
│   ├── models/           # MongoDB Schemas (User, Complaint, OTP)
│   ├── routes/           # API Routes
│   └── server.js         # Entry point
├── frontend/
│   ├── css/             # Styles (Tailwind + Custom)
│   ├── dashboards/       # Role-specific dashboard HTML
│   ├── js/              # Frontend Logic
│   └── index.html        # Landing Page
└── README.md
```

## 🔧 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/dk2430098/student_feedback.git
    cd student_feedback
    ```

2.  **Install Backend Dependencies**
    ```bash
    cd backend
    npm install
    # Install Python dependencies
    pip3 install scikit-learn numpy
    ```

3.  **Environment Variables**
    Create a `.env` file in `backend/` with:
    ```env
    PORT=5000
    MONGO_URL=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    EMAIL_HOST=smtp.gmail.com
    EMAIL_USER=your_email
    EMAIL_PASS=your_app_password
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    ```

4.  **Run the Application**
    *   **Backend**: `npm start` (Runs Node server + Spawns Python Chatbot)
    *   **Frontend**: Open `index.html` or run `npx serve frontend`

## 🔑 Demo Credentials

Use the following credentials to test different user roles:

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Student** | `deepak.phulo@gmail.com` | `Deepak@123` | Lodge complaints, Chatbot |
| **Warden** | `warden.h1@nitmn.ac.in` | `wardenpassword123` | Resolve Hostel complaints |
| **Supervisor**| `supervisor@nitmn.ac.in` | `supervisor123` | Resolve Academic complaints |
| **Admin** | `admin@nitmn.ac.in` | `adminpassword123` | Full Dashboard Access |

## 🤖 Chatbot

The chatbot is located in `backend/ml/chatbot.py`. It uses a TF-IDF (Term Frequency-Inverse Document Frequency) model with Cosine Similarity to match user queries against a JSON knowledge base. It handles natural language queries and context awareness.

## 🛡️ Security

- **Rate Limiting**: 100 requests / 15 min per IP.
- **Input Sanitization**: NoSQL injection protection & XSS escaping.
- **File Limits**: Max 50MB uploads allowed.

## 📜 License

This project is licensed under the MIT License.
