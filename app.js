let express = require("express");
let ejs = require("ejs");
var bodyParser = require('body-parser');
const mongoose = require("mongoose");
const session = require('express-session');
const passport= require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
let _ = require("lodash");
let path = require("path");
const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret : "This is my little secret",
    resave : false,
    saveUninitialized: false 
}));
app.use(passport.initialize());
app.use(passport.session()); 



//database connections
mongoose.connect("mongodb+srv://hyperDevelopers:hyperDevelopers@hyperdevelopers.31rn4.mongodb.net/hyperDevelopersDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

// contact us schema

let contactSchema = {
        Name : String,
        Mail : String,
        Phno : String,
        Mess : String,
};
const Contact = mongoose.model("contact", contactSchema);
let digitalmarketingSchema = {
        fullname : String,
        mailid : String,
        phno : String,
        occupation : String,
        howAbout : String,
        referalCode : String,
};
const Intern = mongoose.model("intern", digitalmarketingSchema);
let leadsSubmitingSchema = {
        businessName : String,
        contactName : String,
        phno : String,
        mailid : String,
        Purpose : String,
        addDetails : String,
        referalCode : String,
};
const Lead = mongoose.model("lead", leadsSubmitingSchema);

// admin schema
let adminSchema = mongoose.Schema({
    username : String,
    password : String
});

 adminSchema.plugin(passportLocalMongoose);
const Adminlogin = mongoose.model("adminlogin", adminSchema);


passport.use(Adminlogin.createStrategy());
passport.serializeUser(Adminlogin.serializeUser());
passport.deserializeUser(Adminlogin.deserializeUser());
app.get("/", function(req, res){
    res.render("index");
});
app.get("/about", function(req, res){
    res.render("about");
});
app.get("/contact", function(req, res){
    res.render("contact");
});
app.get("/service", function(req, res){
    res.render("service");
});
app.get("/portfolio", function(req, res){
    res.render("portfolio");
});
app.get("/webIntern", function(req, res){
    res.render("webIntern");
})

app.get("/admin", function(req, res){
    if(req.isAuthenticated()){
        Contact.find({}, function(err, contact){
            res.render("admin", {contact : contact});
          });
    }else{
         res.redirect("/login");
    }
});


app.get("/login", function(req, res){
    res.render("login");
});
// app.get("/register", function(req, res){
//     res.render("register");
// });



app.post("/contactUs", function(req, res){
    const contact = new Contact({
        Name : req.body.Name,
        Mail : req.body.Mail,
        Phno : req.body.Phno,
        Mess : req.body.Mess,
    });
    contact.save(function(err){
        if (!err){
            res.redirect("/");
          }else{
              console.log(err);
          }
    });
});

app.post("/dltContact", function(req, res){
    const dlt_c_id = req.body.Cdlt;
    Contact.findByIdAndRemove(dlt_c_id, function(err){
        if(!err){
            res.redirect("/admin");
        }
    });
});

// digital marketing internship

app.post("/digitalmarketing", function(req, res){
    const intern = new Intern({
        fullname : req.body.fullname,
        mailid : req.body.mailid,
        phno : req.body.phno,
        occupation : req.body.occupation,
        howAbout : req.body.howAbout,
        referalCode : req.body.referalCode,
    });
    intern.save(function(err){
        if (!err){
            // console.log(intern);
            res.render("formsuccess");
        }else{
              res.render("formfail");
          }
    });
});

// digital marketing internship
app.get("/digitalmarketing", function(req, res){
    res.render("digitalmarketing");
});
app.get("/internsDetails", function(req, res){
    if(req.isAuthenticated()){
      Intern.find({}, function(err, interndetails){
          res.render("internsDetails", {interndetails : interndetails});
        });
  }else{
       res.redirect("/login");
  }
});

//************************** for submiting the leads by Interns **************************************

app.get("/submit-lead", function(req, res){
    res.render("projectSubmit");
});


app.post("/lead", function(req, res){
    const lead = new Lead({
        businessName : req.body.businessName,
        contactName : req.body.personName,
        phno : req.body.phno,
        mailid : req.body.mailid,
        Purpose : req.body.use,
        addDetails : req.body.addDetails,
        referalCode : req.body.referalCode,
    });
    lead.save(function(err){
        if (!err){
            // console.log(intern);
            res.render("formsuccess");
        }else{
              res.render("formfail");
          }
    });
});
// lead details
app.get("/leadDetails", function(req, res){
    if(req.isAuthenticated()){
      Lead.find({}, function(err, leaddetails){
          res.render("leadDetails", {leaddetails : leaddetails});
        });
  }else{
       res.redirect("/login");
  }
});

// admin login

app.post("/login",function(req , res){

    user = new Adminlogin({
    username : req.body.username,
   
   password : req.body.password
   });
  
  
   req.login(user, function(err){
       if(err){
           
           res.redirect("/login");
       } else {
          passport.authenticate("local")(req,res, function(){
               res.redirect("/admin");
          });
       }
   });

});

// post for register
app.post("/regis", function(req,res){

   Adminlogin.register({
       username   : req.body.username,

},req.body.password,function(err, user){
if(err){
console.log(err);

res.redirect("/register");
}else{
passport.authenticate('local')(req,res,function(){
res.redirect("/admin");
});
}
});
});

//Get Logout Page 

app.get("/logout", function(req,res){
   req.logout();
   res.redirect("/admin");

});


app.listen(process.env.PORT || 3000, function() {
    console.log("server is running at the port 3000");
});