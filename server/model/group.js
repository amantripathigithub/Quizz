const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let group = new Schema({
    name: { type: String, required: true },
    groupCode: { type: String },

    
  });

  const group_model = mongoose.model("group",group);

  module.exports = group_model;
  