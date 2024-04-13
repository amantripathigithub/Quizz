const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let faculty = new Schema({
    name: { type: String, required: true },
    emailid: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    permissions: [{
      
      groupcode: { type: String, required: true }
    }]

    
  });

  const faculty_model = mongoose.model("faculty",faculty);

  module.exports = faculty_model;
  