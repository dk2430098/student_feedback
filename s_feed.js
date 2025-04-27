require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const randomString = require("randomstring");
const cookieParser = require("cookie-parser");
const path = require("path");
const StudentDetails = require("./model/student.js");

const app = express();
const port = 8080;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "views")));
app.use(express.urlencoded({ extended: true }));

// Set views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// const mongoose = require("mongoose");

// Database connection
async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to Database");
  } catch (err) {
    console.error("Database connection error:", err);
  }
}
main();

// OTP Cache
const otpCache = {};

// Send OTP
async function sendOTP(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP for verification is: ${otp}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Request OTP
app.post("/request-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = randomString.generate({ length: 6, charset: "numeric" });
  otpCache[email] = otp;
  await sendOTP(email, otp);

  res.status(200).json({ message: "OTP sent successfully" });
});

// Verify-otp
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).send("Email and OTP are required");

  if (otpCache[email] === otp) {
    delete otpCache[email];
    const student = await StudentDetails.findOne({ email });
    if (student) {
      // Redirect to Reset Password page and pass email
      return res.render("reset_password", { email });
    } else {
      return res.send("Student not found");
    }
  }

  res.send("Invalid OTP");
});

// Routes
app.get("/", (req, res) => res.render("s_feed1.ejs"));
app.get("/tos", (req, res) => res.render("TOS.ejs"));
app.get("/ps", (req, res) => res.render("PS.ejs"));
app.get("/login/sign-up", (req, res) => res.render("login.ejs"));
app.get("/create_new_user", (req, res) => res.render("create_new_user.ejs"));
app.get("/forget_password", (req, res) => res.render("forget_password.ejs"));
app.get("/creator_message", (req, res) => res.render("message.ejs"));

// User Authentication
app.post("/user_details", async (req, res) => {
  const { enrollmentNumber, password } = req.body;
  try {
    const student = await StudentDetails.findOne({ enrollmentNumber });
    if (student && student.password === password) {
      return res.render("feedback.ejs", { student });
    }
    return res.send(`<script>alert("Invalid credentials");</script>`);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

// Submit Feedback
app.post("/submit-feedback/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { category, feedback } = req.body;
    const student = await StudentDetails.findById(id);
    if (!student) return res.status(500).send("Server error");

    if (category === "mess") student.mess.push(feedback);
    else if (category === "hostel") student.hostel.push(feedback);
    else if (category === "academic") student.academic.push(feedback);

    await student.save();
    res.send("Feedback submitted successfully!");
  } catch (err) {
    res.status(500).send("Error submitting feedback.");
  }
});

// Create New User
app.post("/create_user", async (req, res) => {
  const { username, password, confirm, email } = req.body;
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;

  if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
    return res.send(`<script>alert("Enter a valid Gmail ID");</script>`);
  }
  if (password !== confirm) {
    return res.send(`<script>alert("Passwords do not match");</script>`);
  }

  try {
    await StudentDetails.create({
      enrollmentNumber: username,
      password,
      email,
    });
    res.redirect("/login/sign-up");
  } catch (error) {
    res.status(500).send(`<script>alert("Internal server error");</script>`);
  }
});

// Reset Password
app.post("/reset-password", async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (!email || !newPassword || !confirmPassword) {
    return res.send(
      `<script>alert("All fields are required"); window.history.back();</script>`
    );
  }

  if (newPassword !== confirmPassword) {
    return res.send(
      `<script>alert("Passwords do not match"); window.history.back();</script>`
    );
  }

  try {
    const student = await StudentDetails.findOne({ email });
    if (!student) {
      return res.send(
        `<script>alert("Student not found"); window.history.back();</script>`
      );
    }

    student.password = newPassword;
    await student.save();

    res.send(
      `<script>alert("Password reset successfully! Please login."); window.location.href="/login/sign-up";</script>`
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error during password reset");
  }
});

// Start Server
app.listen(port, () => console.log("Server is running on port", port));
