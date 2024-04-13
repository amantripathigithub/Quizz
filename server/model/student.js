const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    rollNo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    groupCodes: [{ type: String }] // Array of group codes
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;


