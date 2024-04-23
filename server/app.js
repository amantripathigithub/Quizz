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
const Otp = require('./model/otp');
const Student = require('./model/student');
const { time, group } = require('console');
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
            console.log(gc)
            const groupCodes = gc.map(item => item.groupcode);
            // const groupnames = gc.map(item => item.name);
            // console.log(groupnames)
            console.log(groupCodes)
            const groups_obj = await Group.aggregate([
                {
                    $match: {
                        "groupCode" : { $in: groupCodes}
                    }
                }
            ]);
            //const groupnames = groups.map(item => item.name)
            //console.log(groupnames)
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
            return res.render(path.join(__dirname, "../frontend", "/faculty_home.ejs"), { name: fname, email: email, gc: groups_obj, quizzes: quizzes , allGroups:groupsss });
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
    let email = req.body.email

    console.log(selectedGroup);

    const quizzes = await Quizz.aggregate([
        {
            $match: {
                "groupcode": selectedGroup
            }
        }
    ]);

    let gn;

    Group.findOne({ groupCode: selectedGroup })
    .then(async group => {
        if (group) {
            gn=group.name;
            console.log('Found group:', group);



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
            return  res.render(path.join(__dirname, "../frontend", "/view_group.ejs"),{email:email,gn:gn,gc:selectedGroup,quizzes:quizzes,students:students});
        


        } else {
            console.log('Group not found');
        }
    })
    .catch(error => {
        console.error('Error finding group:', error);
    });



   

})




// join group for student


app.post('/join_group',async(req,res)=>{
    
    gc = req.body.gc;
    email = req.body.email;



console.log(gc);


try {
        // Find the student by email and update the groupCodes array
        const student = await Student.findOneAndUpdate(
            { email: email }, // Search criteria
            { $addToSet: { groupCodes: gc } }, // Update operation to add the group code to the array
            { new: true, useFindAndModify: false } // Options
        );

        // Handle success
        console.log('Student:', student);
    } catch (err) {
        // Handle error
        console.error('Error:', err);
    }



//     app.use(express.static("../frontend"));
//    return  res.render(path.join(__dirname, "../frontend", "/create_quiz.ejs"),{gc:gc});



})


app.get('/faculty_register',(req,res) =>{

    app.use(express.static("../frontend"));
   return  res.render(path.join(__dirname, "../frontend", "/faculty_register.ejs"));

})

app.post('/create_quiz',async(req,res)=>{
    
    let gc = req.body.gc;
    let email = req.body.email

    console.log(gc);

    app.use(express.static("../frontend"));
   return  res.render(path.join(__dirname, "../frontend", "/create_quiz.ejs"),{email: email,gc:gc});



})

app.post('/add_quiz',async(req,res)=>{
    
    gc = req.body.gc;
    email = req.body.email

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


     try {
        const userExist = await faculty.findOne({ email: email });
        
        if (userExist) {
            const fname = userExist.name;
            const email = userExist.email;

            const gc = userExist.groups;
            console.log(gc)
            const groupCodes = gc.map(item => item.groupcode);
            // const groupnames = gc.map(item => item.name);
            // console.log(groupnames)
            console.log(groupCodes)
            const groups_obj = await Group.aggregate([
                {
                    $match: {
                        "groupCode" : { $in: groupCodes}
                    }
                }
            ]);
            //const groupnames = groups.map(item => item.name)
            //console.log(groupnames)
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
            return res.render(path.join(__dirname, "../frontend", "/faculty_home.ejs"), { name: fname, email: email, gc: groups_obj, quizzes: quizzes , allGroups:groupsss });
        } else {
            app.use(express.static("../frontend"));
            return res.render(path.join(__dirname, "../frontend", "/faculty_register.ejs"));
        }
    } catch (err) {
        
        console.log(err);
        // Handle error
        res.status(500).send("Internal Server Error");
    }
    


//     app.use(express.static("../frontend"));
// return  res.render(path.join(__dirname, "../frontend", "faculty_login/.ejs"));
}).catch(err=>{console.log("error in uploading")});







//     app.use(express.static("../frontend"));
//    return  res.render(path.join(__dirname, "../frontend", "/create_quiz.ejs"));


})

const nodemailer = require('nodemailer');

// Initialize Nodemailer transport
const tp = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'resell.noreply.verify@gmail.com',
        pass: 'aghgnbsfwbrtzzrv'
    }
});

// Function to send OTP email
async function sendMail(email, otp) {
    try {
        const mailOptions = {
            from: 'resell.noreply.verify@gmail.com',
            to: email,
            subject: 'MyQuizz Email Verification',
            text: `Your OTP: ${otp}`,
        };

        const result = await tp.sendMail(mailOptions);
        console.log('Email sent successfully:', result);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

// Handle faculty registration
app.post('/faculty_register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Validate input
        if (!email || !name || !password) {
            throw new Error('All fields are required.');
        }

        // Check if email is unique
        const existingFaculty = await faculty.findOne({ email: email });
        if (existingFaculty) {
            throw new Error('Email address already exists.');
        }

        // Generate OTP
        const otpLength = 6;
        let otp = '';
        for (let i = 0; i < otpLength; i++) {
            otp += Math.floor(Math.random() * 10);
        }

        // Send OTP email
        await sendMail(email, otp);

        // Save OTP in database
        let otpDocument = await Otp.findOne({ email });
        if (!otpDocument) {
            otpDocument = new Otp({ email, code: otp });
        } else {
            otpDocument.code = otp; // Update the existing OTP
        }
        await otpDocument.save();

        // Render OTP verification page
        res.render(path.join(__dirname, "../frontend", "/faculty_login_otp.ejs"), { email, fname: name, pass: password });

    } catch (error) {
        console.error('Error in faculty registration:', error.message);
        res.status(400).send(error.message);
    }
});

// verify otp faculty

app.post('/verify_otp_faculty',async(req,res)=>{
    
    email = req.body.email;
    otp = req.body.otp;

    fname = req.body.fname;
    pass = req.body.pass;



    try {
        // Find the OTP document with the given email and OTP
        const otpDocument = await Otp.findOne({ email, code: otp });

        if (otpDocument) {
            console.log('Email and OTP found in the database.');
            await faculty.create({ name: fname, email: email, password: pass });
            res.render(path.join(__dirname, "../frontend", "/faculty_login.ejs"));
             // Email and OTP exist in the database
        } else {
            console.log('Email or OTP not found in the database.');
             // Email or OTP does not exist in the database
             res.render(path.join(__dirname, "../frontend", "/not_matching_otp.ejs"));

        }
    } catch (error) {
        console.error('Error checking OTP in the database:', error.message);
         // Return false in case of an error
    }


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

// showing group to student



app.post('/show_group_student',async(req,res)=>{
    
    let gc = req.body.groupId;
    let gn = req.body.groupName;

    let em= req.body.email;


    const quizzes = await Quizz.aggregate([
        {
            $match: {
                "groupcode": gc
            }
        }
    ]);





    console.log("Quizzes:", quizzes);


    app.use(express.static("../frontend"));
   return  res.render(path.join(__dirname, "../frontend", "/student_view_group.ejs"),{email:em,gc:gc,gn:gn,quizzes:quizzes});






})

// quiz interface



app.post('/quiz_interface',async(req,res)=>{
    
    let id = req.body.quizId;

    let em= req.body.email;

    try {
        // Find the quiz by quizId
        const foundQuiz = await Quizz.findOne({ _id: id });

        if (foundQuiz) {
            // If quiz is found, return the result array
            

        const startTime = new Date(foundQuiz.startDate).getTime();
        const endTime = new Date(foundQuiz.endDate).getTime();
        const currentTime = new Date().getTime();

            // new
            app.use(express.static("../frontend"));
            return  res.render(path.join(__dirname, "../frontend", "/quiz_interface.ejs"),{email:em,quiz:foundQuiz,startTime:startTime,endTime:endTime,currentTime:currentTime});
         
         
         



           

        } else {
            // If quiz is not found, return null or throw an error
            console.log("not found result of quizz"); // or throw new Error('Quiz not found');
        }
    } catch (err) {
        // Handle error
        console.error('Error:', err);
        return null; // or throw err;
    }
    

   



})




app.post('/quiz_leaderboard',async(req,res)=>{
    
    let quizId = req.body.quizId;

    let emaill = req.body.email;
let sr;

    try {
        // Find the quiz by quizId
        const foundQuiz = await Quizz.findOne({ _id: quizId });

        if (foundQuiz) {
            // If quiz is found, return the result array
            sr =  foundQuiz.result;

            // new



            try {
                // Extract roll numbers from the array
                const emails = sr.map(item => item.email);
        
                // Find students based on roll numbers
                const students = await Student.find({ email: { $in: emails } });
        
                // Create an array of objects with name, roll number, and marks
                const relatedData = students.map(student => {
                    const { name, rollNo , email} = student;
                    const markObject = sr.find(item => item.email === email);
                    const marks = markObject ? markObject.score : 0;
                    return { name, rollNo, marks ,email};
                });
        
                sr= relatedData;

                console.log(sr);

                sr.sort((a, b) => b.marks - a.marks);


                app.use(express.static("../frontend"));
                return  res.render(path.join(__dirname, "../frontend", "/quiz_leaderboard.ejs"),{em:emaill,sr:sr});
             

            } catch (err) {
                console.error('Error:', err);
                return null; // or throw err;
            }

           

        } else {
            // If quiz is not found, return null or throw an error
            console.log("not found result of quizz"); // or throw new Error('Quiz not found');
        }
    } catch (err) {
        // Handle error
        console.error('Error:', err);
        return null; // or throw err;
    }

    




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
let groups;

            try {
                // Find all groups where groupCode is in the groupCodesArray
                groups = await Group.find({ groupCode: { $in: gc } });
        
                // Handle success
                console.log('Groups:', groups);
            } catch (err) {
                // Handle error
                console.error('Error:', err);
            }
        
            

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
            return res.render(path.join(__dirname, "../frontend", "/student_home.ejs"), { name: sname, email: email,roll:roll, groups: groups, quizzes: quizzes });
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




// start quiz 


app.post('/quiz_start',async(req,res)=>{
    
    let id = req.body.quizId;

    let em= req.body.email;

    try {
        // Find the quiz by quizId
        const foundQuiz = await Quizz.findOne({ _id: id });

        if (foundQuiz) {
            // If quiz is found, return the result array
            

            // new
            app.use(express.static("../frontend"));
            return  res.render(path.join(__dirname, "../frontend", "/quiz_start2.ejs"),{email:em,quiz:foundQuiz});
         
         
         




           

        } else {
            // If quiz is not found, return null or throw an error
            console.log("not found result of quizz"); // or throw new Error('Quiz not found');
        }
    } catch (err) {
        // Handle error
        console.error('Error:', err);
        return null; // or throw err;
    }
    

   



})


app.post('/quiz_submit',async (req, res) => {
    // Access form data from request body
    //const totalMarks = req.body.totalMarks;
    console.log(req.body);
    // Handle the data as needed
    //console.log('Total Marks:', totalMarks);
    // Send a response

    let quizId = req.body.quizId;
    let email = req.body.email;
    let marks = req.body.mark;


    try {
        // Search for the quiz by its ID
        const quiz = await Quizz.findById(quizId);

        if (!quiz) {
            console.log('Quiz not found');
            return;
        }

        // Check if the email already exists in the result array
        const existingResult = quiz.result.find(result => result.email === email);

        if (existingResult) {
            console.log('Result for this email already exists');
            return;
        }

        // If the email doesn't exist, push a new result object
        quiz.result.push({ email: email, score: marks });

        // Save the updated quiz
        await quiz.save();
        console.log('Result updated successfully');
    } catch (error) {
        console.error('Error updating quiz result:', error);
    }



    try {
        const userExist = await Student.findOne({ email: email});
        
        if (userExist) {
            const sname = userExist.name;
            const email = userExist.email;
            const roll = userExist.rollNo;
            const gc = userExist.groupCodes;
let groups;

            try {
                // Find all groups where groupCode is in the groupCodesArray
                groups = await Group.find({ groupCode: { $in: gc } });
        
                // Handle success
                console.log('Groups:', groups);
            } catch (err) {
                // Handle error
                console.error('Error:', err);
            }
        
            

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
            return res.render(path.join(__dirname, "../frontend", "/student_home.ejs"), { name: sname, email: email,roll:roll, groups: groups, quizzes: quizzes });
        } else {
            app.use(express.static("../frontend"));
            return res.render(path.join(__dirname, "../frontend", "/student_register.ejs"));
        }
    } catch (err) {
        
        console.log(err);
        // Handle error
        res.status(500).send("Internal Server Error");
    }


    res.send('Form submitted successfully');
});



app.listen(PORT, () => {
    console.log("Server listening on port " + `${PORT}`);
});


