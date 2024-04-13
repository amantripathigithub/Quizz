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

const cr  = require('./model/cr');
const request = require('./model/request');
const faculty = require('./model/faculty');
const syllabus = require('./model/syllabus');
const Quiz  = require('./model/quiz');

app.get('/',(req,res) =>{

    app.use(express.static("../client"));
   return  res.render(path.join(__dirname, "../client", "/cr_login.ejs"));

})



app.get('/student_login',(req,res) =>{

    app.use(express.static("../client"));
   return  res.render(path.join(__dirname, "../client", "/student_login.ejs"));

})


app.post('/student_login',(req,res) =>{
    const id = req.body.sid;
    const pass = req.body.spassword;

    //console.log(id+" "+pass);

    
    cr.findOne({id:id,password:pass})
        .then(async (userExist) => {
            if (userExist){
               

                request.find({course: userExist.course})
                .then(async (requests) => {

                    requests= requests.filter(request => request['stat'] === false);





                    app.use(express.static("../client"));
                    return res.render(path.join(__dirname, "../client", "/cr_home.ejs"),{user:userExist,requests:requests});
                    
                }).catch(err => { console.log(err); });

            }else{
                app.use(express.static("../client"));
   return  res.render(path.join(__dirname, "../client", "/cr_login_failed.ejs"));
            }


        }).catch(err => { console.log(err); });





})

app.get('/student_signup',(req,res) =>{

    app.use(express.static("../client"));
   return  res.render(path.join(__dirname, "../client", "/student_signup.ejs"));

})



app.post('/student_signup',async(req,res)=>{
    sname =req.body.name;
    sid = req.body.id;
    spassword = req.body.password;
    scourse = req.body.course;

    await  request.create({course:scourse,id:sid,name:sname,password:spassword,stat:false}).then(async(result)=>{
        app.use(express.static("../client"));
   return  res.render(path.join(__dirname, "../client", "/student_signup_waiting.ejs"));
    }).catch(err=>{console.log("error in uploading")});
})

app.post('/cr_login',(req,res) =>{
    const id = req.body.crid;
    const pass = req.body.crpassword;

    //console.log(id+" "+pass);

    
    cr.findOne({id:id,password:pass})
        .then(async (userExist) => {
            if (userExist){
               

                request.find({course: userExist.course})
                .then(async (requests) => {

                    requests= requests.filter(request => request['stat'] === false);





                    app.use(express.static("../client"));
                    return res.render(path.join(__dirname, "../client", "/cr_home.ejs"),{user:userExist,requests:requests});
                    
                }).catch(err => { console.log(err); });

            }else{
                app.use(express.static("../client"));
   return  res.render(path.join(__dirname, "../client", "/cr_login_failed.ejs"));
            }


        }).catch(err => { console.log(err); });





})

app.post('/add_new_sem',async(req,res)=>{

    var all_sem=[];
    var found = false;
var c = req.body.course;

console.log(c);
var userExist=undefined

  await   syllabus.findOne({course:c})
        .then(async (userExist) => {
            if (userExist){
                console.log(userExist)

                all_sem = userExist.semesters;
                found=true;
            }else{
                console.log("not exist")
            }
        }).catch(err => { console.log(err); });

        //console.log(userExist);

        var code = req.body.sub_code;
    var name = req.body.sub_name;

    

   var codes = code.split(",");
   var names=name.split(",");


    if (codes.length > 0 && codes[0] === "") {
        codes.shift();
      }

      if (names.length > 0 && names[0] === "") {
        names.shift();
      }

      var new_subjects =[];

      var i = 0
      while(i<names.length){
        new_subjects.push({subject_code: codes[i] , subject_name : names[i]});
        i++;
      }

      var current_sem = {
        subjects: new_subjects
      };
    
if(found===true){
    

    
    var updated_semesters = all_sem;
    updated_semesters.push(current_sem);

   await syllabus.updateOne(
        { course: c  },
    { $set: { semesters: updated_semesters } }
    )


}else{

  

    const temporarySyllabusData = {
        course: c,
        semesters: current_sem
      };
   await  syllabus.create(temporarySyllabusData).then(async(result)=>{

    }).catch(err=>{console.log("error in uploading")});
}

    

app.use(express.static("../client"));
return  res.render(path.join(__dirname, "../client", "/cr_login.ejs"));






})

app.post('/accept_reject_requests',async(req,res)=>{

    acc  = req.body.ids_acc;

   // console.log(acc);
    acc_req = acc.split(",");

// Remove the first empty string element if the input string starts with a comma
if (acc_req.length > 0 && acc_req[0] === "") {
  acc_req.shift();
}

console.log(acc_req);

rej = req.body.ids_rej;

rej_req = rej.split(",");

// Remove the first empty string element if the input string starts with a comma
if (rej_req.length > 0 && rej_req[0] === "") {
  rej_req.shift();
}

console.log(rej_req);


var i=0;

const result_rej = await request.deleteMany({ _id: { $in: rej_req } });

const result_acc = await request.updateMany(
    { _id: { $in: acc_req } },
    { $set: { stat: true } } // Replace 'fieldName' with the field you want to update
);




app.use(express.static("../client"));
return  res.render(path.join(__dirname, "../client", "/cr_login.ejs"));


})


// faculty part 


app.get('/faculty_login',(req,res) =>{

    app.use(express.static("../client"));
   return  res.render(path.join(__dirname, "../client", "/faculty_login.ejs"));

})

app.post('/faculty_login',(req,res) =>{
    const id = req.body.crid;
    const pass = req.body.crpassword;

    //console.log(id+" "+pass);

    
    faculty.findOne({id:id,password:pass})
        .then(async (userExist) => {
            if (userExist){
               

                const courses = userExist.permissions.map(permission => `${permission.course} ${permission.semester} ${permission.subcode}`);


               
                    app.use(express.static("../client"));
                    return res.render(path.join(__dirname, "../client", "/faculty_home.ejs"),{user:userExist,courses:courses});
                    
               



            }else{
                app.use(express.static("../client"));
   return  res.render(path.join(__dirname, "../client", "/cr_login_failed.ejs"));
            }


        }).catch(err => { console.log(err); });





})



app.post('/create_quiz',async(req,res) =>{
    

console.log(req.body);

course = req.body.course;
duration = req.body.duration;
questions = req.body.question;
options = req.body.options;
correctOption = req.body.correctOption;
marks =req.body.marks;
facultyId = req.body.id;
start=req.body.startTime;
end =req.body.endTime;

words = course.split(" ");
sr = [{}]
console.log(words);
q=[]
for(var i=0,k=0;i<questions.length;i++){
q.push({
    question:questions[i],
    options:[options[k],options[k+1],options[k+2]],
    correctOption:correctOption[i],
    marks:marks[i]

    
})
k++;
k++;
k++;

}

await  Quiz.create({facultyId:facultyId,course:words[0],semester:words[1],subject:words[2],duration:duration,questions:q,startTime:start,endTime:end,studentResult:sr}).then(async(result)=>{
    app.use(express.static("../client"));
return  res.render(path.join(__dirname, "../client", "faculty_login/.ejs"));
}).catch(err=>{console.log("error in uploading")});




})


app.listen(PORT, () => {
    console.log("Server listening on port " + `${PORT}`);
});


