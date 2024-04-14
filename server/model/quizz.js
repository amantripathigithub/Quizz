const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define a schema for questions
const questionSchema = new Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOption: { type: Number, required: true },
    marks:{type:Number, required:true},
});

const stuResult = new Schema({
    email: {type: String},
    score:{type:Number},
})

// Define a schema for quizzes
const quiz = new Schema({
    groupcode:{type:String , required:true},

    title: { type: String, required: true },
    questions: [questionSchema], // Array of questions
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    time: {type:Number , required :true},
    result:[stuResult],
});

// Create a model for the quiz schema
const Quiz = mongoose.model("Quiz", quiz);

module.exports = Quiz;
