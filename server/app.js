const dotenv = require('dotenv');
var express = require("express");
const cookieParser = require("cookie-parser");

const mongoose = require('mongoose');
dotenv.config({ path: './file.env' });
const DB = process.env.DATABASE;




mongoose.connect(DB).then(()=>{
    console.log("connected to database");
}).catch((err)=>{
    console.log(err);
    console.log("not connected to database");
});

var app = express();
const PORT = process.env.PORT || 3000;
//isse connection ho jayega




const bodyParser = require("body-parser");

const path = require("path");
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

const faculty = require('./model/faculty');
const Quizz = require('./model/quizz');
const Group = require('./model/group');

const Student = require('./model/student');
const { time } = require('console');
const { title } = require('process');


// const cr  = require('./model/cr');
// const request = require('./model/request');
// const syllabus = require('./model/syllabus');
// const Quiz  = require('./model/quiz');


app.get('/faculty_login',(req,res) =>{

    app.use(express.static("../frontend"));
   return  res.render(path.join(__dirname, "../frontend", "/faculty_login.ejs"));

})


app.get('/faculty_view_group',(req,res) =>{

    app.use(express.static("../frontend"));
   return  res.render(path.join(__dirname, "../frontend", "/faculty_login.ejs"));

})

app.get('/faculty_home',(req,res) =>{

    app.use(express.static("../frontend"));
   return  res.render(path.join(__dirname, "../frontend", "/faculty_home.ejs"));

})


app.post('/faculty_login', async (req, res) => {
    const email = req.body.email;
    const pass = req.body.password;


    try {
        const userExist = await faculty.findOne({ email: email, password: pass });
        
        if (userExist) {
            const fname = userExist.name;
            const email = userExist.email;

            const gc = userExist.groups;
            const groupCodes = gc.map(item => item.groupcode);

            // Fetch quizzes based on group codes
            const quizzes = await Quizz.aggregate([
                {
                    $match: {
                        "groupcode": { $in: groupCodes }
                    }
                }
            ]);



            let groupsss;
            await Group.find({}, 'groupCode')
            .then(groups => {
                // Extract group codes from the documents
                groupsss = groups.map(group => group.groupCode);
                
                // Use the groupCodes array as needed
                //console.log("Group codes:", groupCodes);
            })
            .catch(error => {
                // Handle any errors
                console.error("Error fetching group codes:", error);
            });

            console.log("grp:", groupsss);
            app.use(express.static("../frontend"));
            return res.render(path.join(__dirname, "../frontend", "/faculty_home.ejs"), { name: fname, email: email, gc: groupCodes, quizzes: quizzes , allGroups:groupsss });
        } else {
            app.use(express.static("../frontend"));
            return res.render(path.join(__dirname, "../frontend", "/faculty_register.ejs"));
        }
    } catch (err) {
        
        console.log(err);
        // Handle error
        res.status(500).send("Internal Server Error");
    }
});



app.post('/faculty_home',(req,res)=>{
    
})




app.post('/faculty_view_group',async (req,res)=>{
    const selectedGroup = req.body.selectedGroup;

    console.log(selectedGroup);

    const quizzes = await Quizz.aggregate([
        {
            $match: {
                "groupcode": {  selectedGroup }
            }
        }
    ]);




    console.log(quizzes);


    const query = { groupCodes: { $in: [selectedGroup] } };

    let students;

    try {
        // Execute the query using await
         students = await Student.find(query);
        
        // Handle the results
        console.log("Students with group code 'temp':", students);
        // You can do whatever you want with the fetched students here
    } catch (error) {
        // Handle any errors
        console.error("Error fetching students:", error);
    }


    app.use(express.static("../frontend"));
    return  res.render(path.join(__dirname, "../frontend", "/view_group.ejs"),{gc:selectedGroup,quizzes:quizzes,students:students});


})



app.get('/faculty_register',(req,res) =>{

    app.use(express.static("../frontend"));
   return  res.render(path.join(__dirname, "../frontend", "/faculty_register.ejs"));

})

app.post('/create_quiz',async(req,res)=>{
    
    gc = req.body.gc;

console.log(gc);

    app.use(express.static("../frontend"));
   return  res.render(path.join(__dirname, "../frontend", "/create_quiz.ejs"),{gc:gc});



})

app.post('/add_quiz',async(req,res)=>{
    
    gc = req.body.gc;

  console.log(req.body);

let title = req.body.title;
let time = req.body.duration;
let questions = req.body.question;
let options = req.body.options;
let correctOption = req.body.correctOption;
let marks =req.body.marks;

let start=req.body.startTime;
let end =req.body.endTime;

let sr = [{}]

let q=[]
for(var i=0,k=0;i<questions.length;i++){
q.push({
    question:questions[i],
    options:[options[k],options[k+1],options[k+2],options[k+3]],
    correctOption:correctOption[i],
    marks:marks[i]

    
})
k++;
k++;
k++;
k++;

}

// groupcode:{type:String , required:true},

//     title: { type: String, required: true },
//     questions: [questionSchema], // Array of questions
//     startDate: { type: Date, required: true },
//     endDate: { type: Date, required: true },
//     time: {type:Number , required :true},
//     result:[stuResult],



await  Quizz.create({groupcode:gc,title:title,questions:q,startDate:start,endDate:end,time:time,result:sr}).then(async(result)=>{


    console.log("quizz created!!!!!!!!!");

//     app.use(express.static("../frontend"));
// return  res.render(path.join(__dirname, "../frontend", "faculty_login/.ejs"));
}).catch(err=>{console.log("error in uploading")});






//     app.use(express.static("../frontend"));
//    return  res.render(path.join(__dirname, "../frontend", "/create_quiz.ejs"));


})



app.post('/faculty_register',async(req,res)=>{
    fname = req.body.name;
    email = req.body.email;
    pass = req.body.password;

    console.log(fname+email+pass);

    gc=[{groupcode:"temp"}];

    await  faculty.create({name:fname,email:email,password:pass,groups:gc}).then(async(result)=>{
        app.use(express.static("../frontend"));
   return  res.render(path.join(__dirname, "../frontend", "/faculty_login.ejs"));
    }).catch(err=>{console.log(err)});




})

// add group by faculty

app.post('/add_group',async(req,res)=>{
    
    let gn = req.body.groupName;
    let em = req.body.email;
    let groupCode= req.body.groupCode;

    await  Group.create({name:gn,groupCode:groupCode}).then(async(result)=>{


        // into faculty 

        try {
            // Find the faculty document by email and update it to add the new group code
            const updatedFaculty = await faculty.findOneAndUpdate(
                { email: em}, // Find faculty by email
                { $addToSet: { groups: { groupcode: groupCode } } }, // Add group code to the groups array if it doesn't already exist
                { new: true } // Return the updated document
            );
            
            if (updatedFaculty) {
            //whrgheer
            
            
            const gc = updatedFaculty.groups;
            const groupCodes = gc.map(item => item.groupcode);

            // Fetch quizzes based on group codes
            const quizzes = await Quizz.aggregate([
                {
                    $match: {
                        "groupcode": { $in: groupCodes }
                    }
                }
            ]);



            let groupsss;
            await Group.find({}, 'groupCode')
            .then(groups => {
                // Extract group codes from the documents
                groupsss = groups.map(group => group.groupCode);
                
                // Use the groupCodes array as needed
                //console.log("Group codes:", groupCodes);
            })
            .catch(error => {
                // Handle any errors
                console.error("Error fetching group codes:", error);
            });

            fname = updatedFaculty.name;
            email = updatedFaculty.email;
            

            console.log("grp:", groupsss);
            app.use(express.static("../frontend"));
            return res.render(path.join(__dirname, "../frontend", "/faculty_home.ejs"), { name: fname, email: email, gc: groupCodes, quizzes: quizzes , allGroups:groupsss });
        


// sahbgeahr                
               
console.log("Group code added successfully:", updatedFaculty);
            } else {
                console.log("Faculty not found with email:", email);
            }
        } catch (error) {
            console.error("Error adding group code:", error);
        }

        app.use(express.static("../frontend"));
   return  res.render(path.join(__dirname, "../frontend", "/faculty_login.ejs"));
    }).catch(err=>{console.log(err)});




})


// student work


app.get('/student_register',(req,res) =>{

    app.use(express.static("../frontend"));
   return  res.render(path.join(__dirname, "../frontend", "/student_register.ejs"));

})

app.post('/student_register',async(req,res)=>{
    
    let email = req.body.email;

    let pass = req.body.password;

    let roll = req.body.roll;

    let name = req.body.name;

    let gc=[];

    await  Student.create({name:name,email:email,rollNo:roll,password:pass,groupCodes:gc}).then(async(result)=>{
        app.use(express.static("../frontend"));
   return  res.render(path.join(__dirname, "../frontend", "/student_login.ejs"));
    }).catch(err=>{console.log(err)});

   



})



app.get('/student_login',(req,res) =>{

    app.use(express.static("../frontend"));
   return  res.render(path.join(__dirname, "../frontend", "/student_login.ejs"));

})

app.post('/student_login',async(req,res)=>{
    
    let email = req.body.email;

    let pass = req.body.password;


    try {
        const userExist = await Student.findOne({ email: email, password: pass });
        
        if (userExist) {
            const sname = userExist.name;
            const email = userExist.email;
            const roll = userExist.rollNo;
            const gc = userExist.groupCodes;
            

            // Fetch quizzes based on group codes
            const quizzes = await Quizz.aggregate([
                {
                    $match: {
                        "groupcode": { $in: gc }
                    }
                }
            ]);


            console.log("Quizzes:", quizzes);
            app.use(express.static("../frontend"));
            return res.render(path.join(__dirname, "../frontend", "/student_home.ejs"), { name: sname, email: email,roll:roll, gc: gc, quizzes: quizzes });
        } else {
            app.use(express.static("../frontend"));
            return res.render(path.join(__dirname, "../frontend", "/student_register.ejs"));
        }
    } catch (err) {
        
        console.log(err);
        // Handle error
        res.status(500).send("Internal Server Error");
    }




})

app.listen(PORT, () => {
    console.log("Server listening on port " + `${PORT}`);
});


