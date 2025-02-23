const mongoose = require("mongoose");
const StudentDetails = require("./model/student.js");

main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/student");
}

const studentSchema = [
  {
    enrollmentNumber: "21103041",
    password: "Shaf@321",
    email: "smathhaf09@gmail.com",
    mess: ["Give proper food", "Today, it is not good food"],
    hostel: ["The bathrooms are not clean"],
    academic: [],
  },
  {
    enrollmentNumber: "22107028",
    password: "Kamal@456",
    email: "kamalsen2002@gmail.com",
    mess: [],
    hostel: [],
    academic: ["Please change the Syllabus"],
  },
];

StudentDetails.insertMany(studentSchema)
  .then((res) => console.log("Data inserted successfully:", res))
  .catch((err) => console.log("Error inserting data:", err));
