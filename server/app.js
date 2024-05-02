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


app.get('/',(req,res)=>{
    
    app.use(express.static("../frontend"));
    return res.render(path.join(__dirname, "../frontend", "/homepage.ejs"));

})

app.get('/faculty_login',(req,res) =>{

    app.use(express.static("../frontend"));
    //return res.render(path.join(__dirname, "../frontend", "/homepage.ejs"));

   return  res.render(path.join(__dirname, "../frontend", "/faculty_login.ejs"),{success:undefined});

})


app.get('/faculty_view_group',(req,res) =>{

    app.use(express.static("../frontend"));
   return  res.render(path.join(__dirname, "../frontend", "/faculty_login.ejs"),{success:undefined});

})

app.get('/faculty_home',(req,res) =>{

    app.use(express.static("../frontend"));
   return  res.render(path.join(__dirname, "../frontend", "/faculty_home.ejs"), { error: undefined ,success:undefined});

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
            return res.render(path.join(__dirname, "../frontend", "/faculty_home.ejs"), { name: fname, email: email, gc: groups_obj, quizzes: quizzes , allGroups:groupsss , error: undefined ,success:undefined});
        } else {
            app.use(express.static("../frontend"));
            return res.render(path.join(__dirname, "../frontend", "/faculty_register.ejs"),{error:undefined});
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



app.post('/leaderboard',async (req, res) => {
    // Extract quiz ID from the request body
    const quizId = req.body.quizId;

    //let quizId = req.body.quizId;

    
    //let emaill = req.body.email;
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
emaill=undefined;

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

    




    // Handle the quiz data as needed
    // For example, you can fetch the quiz from the database based on the quizId

    // Respond with a success message or redirect as needed
    res.send(`Received quiz data for quiz with ID: ${quizId}`);
});



// POST route to handle quiz updates
app.post('/update_quiz', async (req, res) => {
    try {
        const quizId = req.body.quizId;

        //const quizId = req.body.quizId;
        const email = req.body.email;
        const gc = req.body.gc;

        // Find the quiz by its ID
        const quiz = await Quizz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Update quiz details
        quiz.title = req.body.title;
        quiz.startDate = req.body.startTime;
        quiz.endDate = req.body.endTime;
        quiz.time = req.body.duration;

        // Update each question
        for (let i = 0; i < quiz.questions.length; i++) {
            quiz.questions[i].question = req.body.question[i];
            quiz.questions[i].options = req.body.options.slice(i * 4, (i + 1) * 4);
            quiz.questions[i].correctOption = req.body.correctOption[i];
            quiz.questions[i].marks = req.body.marks[i];
        }

        // Save the updated quiz
        await quiz.save();

        // Redirect or send a success response

        app.use(express.static("../frontend"));
        return res.render(path.join(__dirname, "../frontend", "/quiz_edit.ejs"), { quiz:quiz});


       
    } catch (error) {
        console.error('Error updating quiz:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.post('/update_quiz_show/:id', async (req, res) => {
    try {
        const quizId = req.params.id;

        //const quizId = req.body.quizId;
        const email = req.body.email;
        const gc = req.body.gc;

        
        // Find the quiz by its ID
        const quiz = await Quizz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }


        app.use(express.static("../frontend"));
        return res.render(path.join(__dirname, "../frontend", "/quiz_edit.ejs"), { quiz:quiz});


     
    } catch (error) {
        console.error('Error updating quiz:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// join group for student

// Import the Group model


app.post('/join_group', async (req, res) => {
    const gc = req.body.gc;
    const email = req.body.email;

    try {
        // Check if the group with the provided group code already exists
        const existingGroup = await Group.findOne({ groupCode: gc });

        if (!existingGroup) {
            // Render an error message indicating that the group does not exist
            try {
                const userExist = await Student.findOne({ email: email });
                
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
                    return res.render(path.join(__dirname, "../frontend", "/student_home.ejs"), { name: sname, email: email,roll:roll, groups: groups, quizzes: quizzes , error: 'Group does not exist with the provided group code.', success: undefined});
                } else {
                    app.use(express.static("../frontend"));
                    return res.render(path.join(__dirname, "../frontend", "/student_register.ejs"),{error:undefined});
                }
            } catch (err) {
                
                console.log(err);
                // Handle error
                res.status(500).send("Internal Server Error");
            }
        
        
        
           
        }

        // Find the student by email and update the groupCodes array
        const student = await Student.findOneAndUpdate(
            { email: email }, // Search criteria
            { $addToSet: { groupCodes: gc } }, // Update operation to add the group code to the array
            { new: true, useFindAndModify: false } // Options
        );

        // Check if the student exists
        if (!student) {
            // Render an error message indicating that the student does not exist
            return res.render(path.join(__dirname, "../frontend", "/student_home.ejs"), { error: 'Student not found.', success: undefined });
        }

        // Fetch student details
        const sname = student.name;
        const roll = student.rollNo;
        const groupCodes = student.groupCodes;

        // Fetch all groups where groupCode is in the groupCodes array
        const groups = await Group.find({ groupCode: { $in: groupCodes } });

        // Fetch quizzes based on group codes
        const quizzes = await Quizz.aggregate([
            {
                $match: {
                    "groupcode": { $in: groupCodes }
                }
            }
        ]);

        // Render the student home page with success message and updated data
        return res.render(path.join(__dirname, "../frontend", "/student_home.ejs"), { name: sname, email: email, roll: roll, groups: groups, quizzes: quizzes, success: "Group joined successfully!", error: undefined });

    } catch (error) {
        console.error("Error joining group:", error);
        // Render error page if an error occurs
        return res.render(path.join(__dirname, "../frontend", "/error_page.ejs"));
    }
});


app.get('/faculty_register',(req,res) =>{

    app.use(express.static("../frontend"));
   return  res.render(path.join(__dirname, "../frontend", "/faculty_register.ejs"),{error:undefined});

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
            return res.render(path.join(__dirname, "../frontend", "/faculty_home.ejs"), { name: fname, email: email, gc: groups_obj, quizzes: quizzes , allGroups:groupsss , error: undefined ,success:undefined});
        } else {
            app.use(express.static("../frontend"));
            return res.render(path.join(__dirname, "../frontend", "/faculty_register.ejs"),{error:undefined});
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
app.post('/faculty_register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Validate input
        if (!email || !name || !password) {
            throw new Error('All fields are required.');
        }

        const mnnitDomainRegex = /@mnnit\.ac\.in$/;
    
        // Test if the email matches the regex pattern
        let check =  mnnitDomainRegex.test(email);
    
        if(!check){
            return res.render(path.join(__dirname, "../frontend", "/faculty_register.ejs"), { error: 'Email address does not belongs to MNNIT.' }); // Render registration page with error message
    
        }

        // Check if email is unique
        const existingFaculty = await faculty.findOne({ email: email });
        if (existingFaculty) {
            return res.render(path.join(__dirname, "../frontend", "/faculty_register.ejs"), { error: 'Email address already exists.' }); // Render registration page with error message
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

app.post('/verify_otp_faculty', async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;
    const fname = req.body.fname;
    const pass = req.body.pass;

    try {
        // Find the OTP document with the given email and OTP
        const otpDocument = await Otp.findOne({ email, code: otp });

        if (otpDocument) {
            console.log('Email and OTP found in the database.');
            // Create faculty record
            await faculty.create({ name: fname, email: email, password: pass });
            // Render faculty login page with success message
            res.render(path.join(__dirname, "../frontend", "/faculty_login.ejs"), { success: 'Faculty registered successfully. Please login.' });
        } else {
            console.log('Email or OTP not found in the database.');
            // Render registration page with warning message indicating OTP mismatch
            res.render(path.join(__dirname, "../frontend", "/faculty_register.ejs"), { error: 'Incorrect OTP. Please try again.' });
        }
    } catch (error) {
        console.error('Error checking OTP in the database:', error.message);
        // Render error page if an error occurs
        res.render(path.join(__dirname, "../frontend", "/error_page.ejs"));
    }
});



app.post('/add_group', async (req, res) => {
    let gn = req.body.groupName;
    let em = req.body.email;
    let groupCode = req.body.groupCode;
    let name = req.body.name;

    try {
        // Check if the group with the provided group code already exists
        const existingGroup = await Group.findOne({ groupCode });

        if (existingGroup) {
            console.log('Group with group code already exists:', existingGroup);
            // Render faculty home page with warning message indicating group already exists
            return res.render(path.join(__dirname, "../frontend", "/faculty_home.ejs"), { error: 'Group with group code already exists.' , success:undefined});
        }

        // Create the group since it does not already exist
        const createdGroup = await Group.create({ name: gn, groupCode: groupCode });

        // Find the faculty document by email and update it to add the new group code
        const updatedFaculty = await faculty.findOneAndUpdate(
            { email: em },
            { $addToSet: { groups: { groupcode: groupCode } } },
            { new: true }

        );

        if (updatedFaculty) {

            const gc = updatedFaculty.groups;
            const groupCodes = gc.map(item => item.groupcode);

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




           
           

           
          

            fname = name;
            email = em;

            console.log("grp:", groupsss);
            console.log(fname);
            console.log(email);
            console.log(groupCodes);
            console.log(quizzes);
            console.log(groupsss);
           
            app.use(express.static("../frontend"));
            return res.render(path.join(__dirname, "../frontend", "/faculty_home.ejs"), { name: fname, email: email, gc: groups_obj, quizzes: quizzes, allGroups: groupsss , success:"group is added successfully!!" ,error:undefined});

        } else {
            console.log("Faculty not found with email:", email);
            // Render faculty login page with error message indicating faculty not found
            return res.render(path.join(__dirname, "../frontend", "/faculty_login.ejs"), { error: 'Faculty not found.' ,success:undefined});
        }
    } catch (error) {
        console.error("Error adding group:", error);
        // Render error page if an error occurs
        return res.render(path.join(__dirname, "../frontend", "/error_page.ejs"));

    }
});


// student work


app.get('/student_register',(req,res) =>{

    app.use(express.static("../frontend"));
   return  res.render(path.join(__dirname, "../frontend", "/student_register.ejs"),{error:undefined});

})







app.post('/logout',async(req,res)=>{
    
    
    app.use(express.static("../frontend"));
   return  res.render(path.join(__dirname, "../frontend", "/homepage.ejs"));

})





app.post('/student_register',async(req,res)=>{
    
    let email = req.body.email;

    let pass = req.body.password;

    let roll = req.body.roll;

    let name = req.body.name;



    try {
        // Validate input
        if (!email || !name || !pass || !roll) {
            throw new Error('All fields are required.');
        }

        const mnnitDomainRegex = /@mnnit\.ac\.in$/;
    
    // Test if the email matches the regex pattern
    let check =  mnnitDomainRegex.test(email);

    if(!check){
        return res.render(path.join(__dirname, "../frontend", "/student_register.ejs"), { error: 'Email address does not belongs to MNNIT.' }); // Render registration page with error message

    }



        // Check if email is unique
        const existing = await Student.findOne({ email: email });
        if (existing) {
            return res.render(path.join(__dirname, "../frontend", "/student_register.ejs"), { error: 'Email address already exists.' }); // Render registration page with error message
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
        res.render(path.join(__dirname, "../frontend", "/student_login_otp.ejs"), { email, fname: name, pass: pass,roll:roll });

    } catch (error) {
        console.error('Error in faculty registration:', error.message);
        res.status(400).send(error.message);
    }

   // let gc=[];

//    await  Student.create({name:name,email:email,rollNo:roll,password:pass,groupCodes:gc}).then(async(result)=>{
//        app.use(express.static("../frontend"));
//    return  res.render(path.join(__dirname, "../frontend", "/student_login.ejs"));
//    }).catch(err=>{console.log(err)});

   
    
});

app.post('/verify_otp_student', async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;
    const fname = req.body.fname;
    const pass = req.body.pass;
    const roll = req.body.roll;

    try {
        // Find the OTP document with the given email and OTP
        const otpDocument = await Otp.findOne({ email, code: otp });

        if (otpDocument) {
            console.log('Email and OTP found in the database.');
            // Create faculty record
            let gc = [];
            await  Student.create({name:fname,email:email,rollNo:roll,password:pass,groupCodes:gc}).then(async(result)=>{
                app.use(express.static("../frontend"));
            return  res.render(path.join(__dirname, "../frontend", "/student_login.ejs"),{success:"student is registered successfully!! now login."});
            }).catch(err=>{console.log(err)});
         
            } else {
            console.log('Email or OTP not found in the database.');
            // Render registration page with warning message indicating OTP mismatch
            res.render(path.join(__dirname, "../frontend", "/student_register.ejs"), { error: 'Incorrect OTP. Please try again.' });
        }
    } catch (error) {
        console.error('Error checking OTP in the database:', error.message);
        // Render error page if an error occurs
        res.render(path.join(__dirname, "../frontend", "/error_page.ejs"));
    }
});




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
   return  res.render(path.join(__dirname, "../frontend", "/student_login.ejs"),{success:undefined});

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
            return res.render(path.join(__dirname, "../frontend", "/student_home.ejs"), { name: sname, email: email,roll:roll, groups: groups, quizzes: quizzes ,error:undefined,success:undefined});
        } else {
            app.use(express.static("../frontend"));
            return res.render(path.join(__dirname, "../frontend", "/student_register.ejs"),{error:undefined});
        }
    } catch (err) {
        
        console.log(err);
        // Handle error
        res.status(500).send("Internal Server Error");
    }




})




// start quiz 
app.post('/quiz_start', async (req, res) => {
    let id = req.body.quizId;
    let em = req.body.email;

    const existing = await Student.findOne({ email: em });

    password = existing.password;

    try {
        // Find the quiz by quizId
        const foundQuiz = await Quizz.findOne({ _id: id });

        if (foundQuiz) {
            // Check if the student is present in the quiz's result array
            const studentIndex = foundQuiz.result.findIndex(student => student.email === em);
            if (studentIndex !== -1) {
                // If the student is found in the result array, increase their attendance by 1
                foundQuiz.result[studentIndex].att += 1;
            } else {
                // If the student is not found in the result array, add them with attendance 1
                foundQuiz.result.push({ email: em, att: 1 , score:0 });
            }
            
            // Save the updated quiz
            await foundQuiz.save();

            // Render the appropriate page based on attendance
            if (foundQuiz.result.find(student => student.email === em).att > 1) {
                // If the student's attendance is greater than 1, render the given.ejs page
                app.use(express.static("../frontend"));
                return res.render(path.join(__dirname, "../frontend", "/given.ejs"),{email:em,password:password});
            } else {
                // If the student's attendance is 1 or less, render the quiz_start2.ejs page
                app.use(express.static("../frontend"));
                return res.render(path.join(__dirname, "../frontend", "/quiz_start2.ejs"), { email: em, quiz: foundQuiz ,password:password});
            }
        } else {
            // If quiz is not found, return null or throw an error
            console.log("Quiz not found");
            // You can redirect to an error page or render an error message
            res.render('error', { message: 'Quiz not found' });
        }
    } catch (err) {
        // Handle error
        console.error('Error:', err);
        // You can redirect to an error page or render an error message
        res.render('error', { message: 'Internal Server Error' });
    }
});



app.post('/quiz_submit', async (req, res) => {
    try {
        const { quizId, email, mark,password } = req.body;

        const quiz = await Quizz.findById(quizId);
        if (!quiz) {
            console.log('Quiz not found');
            return res.status(404).send('Quiz not found');
        }

        const existingResult = quiz.result.find(result => result.email === email && result.att>1);
        if (existingResult) {
            console.log('Result for this email already exists');
            return res.status(400).send('Result for this email already exists');
        }

        const studentIndex =quiz.result.findIndex(student => student.email === email);
        quiz.result[studentIndex].score= mark;



        // quiz.result.push({ email, score: mark });
        // await quiz.save();

        const userExist = await Student.findOne({ email });
        if (userExist) {
            const { name, roll, groupCodes } = userExist;

            const groups = await Group.find({ groupCode: { $in: groupCodes } });

            const quizzes = await Quizz.aggregate([
                { $match: { "groupcode": { $in: groupCodes } } }
            ]);

            app.use(express.static("../frontend"));
            return res.render(path.join(__dirname, "../frontend", "/given2.ejs"),{email:email,password:password});

            // app.use(express.static("../frontend"));
            // return res.render(path.join(__dirname, "../frontend", "/student_home.ejs"),{ name, email, roll, groups, quizzes, error: undefined, success: undefined });
        
            //return res.render("student_home", { name, email, roll, groups, quizzes, error: undefined, success: undefined });
        } else {
            return res.render("student_register", { error: undefined });
        }
    } catch (error) {
        console.error('Error updating quiz result:', error);
        return res.status(500).send("Internal Server Error");
    }
});




app.post('/register_student_b',async(req,res)=>{
    
    app.use(express.static("../frontend"));
    return res.render(path.join(__dirname, "../frontend", "/student_register.ejs"),{error:undefined});

})




app.post('/login_student_b',async(req,res)=>{
    
    app.use(express.static("../frontend"));
    return res.render(path.join(__dirname, "../frontend", "/student_login.ejs"),{success:undefined});

})



app.post('/register_faculty_b',async(req,res)=>{
    
    app.use(express.static("../frontend"));
    return res.render(path.join(__dirname, "../frontend", "/faculty_register.ejs"),{error:undefined});

})



app.post('/login_faculty_b',async(req,res)=>{
    
    app.use(express.static("../frontend"));
    return res.render(path.join(__dirname, "../frontend", "/faculty_login.ejs"),{success:undefined});

})





app.listen(PORT, () => {
    console.log("Server listening on port " + `${PORT}`);
});


