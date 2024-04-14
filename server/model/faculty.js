const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let faculty = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },

    
    groups: [{
      
      groupcode: { type: String, required: true },

    }]

    
  });

  const faculty_model = mongoose.model("faculty",faculty);

  module.exports = faculty_model;
  