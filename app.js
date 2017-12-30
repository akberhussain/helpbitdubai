var express = require("express");
var app = express();

var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
// var localStrategy = require("passport-local");
var localStrategy = require("passport-local").Strategy;
// var localStrategy1 = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var methodOverride = require("method-override");
// var Doctor = require("./models/doctor");
// var Patient = require("./models/patient");
// var Request = require("./models/request");

var jquery = require("jQuery");
// mongoose.connect("mongodb://akber:123abc@ds035965.mlab.com:35965/sugpat");

var promise = mongoose.connect('mongodb://akber:123456@ds149603.mlab.com:49603/testdatabase1', {
  useMongoClient: true,

});




app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(flash());

var indexRoutes = require("./routes/index");
// app.use(indexRoutes);


app.use(require("express-session")({
    secret: "this is yelp_camp app",
    resave: false,
    saveUninitialized: false
}));






app.use(passport.initialize());
app.use(passport.session());

// passport.use(new localStrategy(Patient.authenticate()));
// passport.serializeUser(Patient.serializeUser());
// passport.deserializeUser(Patient.deserializeUser());


// passport.use(new localStrategy(Doctor.authenticate()));
// passport.serializeUser(Doctor.serializeUser());
// passport.deserializeUser(Doctor.deserializeUser());


            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1; //January is 0!
            var yyyy = today.getFullYear();

            if(dd<10){
                    dd='0'+dd
                } 
                if(mm<10){
                    mm='0'+mm
                } 

            today = yyyy+'-'+mm+'-'+dd;
            console.log(today);


// if(Patient.authenticate()=="Unauthorized"){
//   console.log("unauthorized");
//   passport.use(new localStrategy(Doctor.authenticate()));
//   passport.serializeUser(Doctor.serializeUser());
//   passport.deserializeUser(Doctor.deserializeUser());

// }






// passport.use(new localStrategy(
//   function(username, password, role, done) {
//     Patient.findOne({ username: username }, function (err, user) {
//       if (err) { return done(err); }
//       if (!user) { return done(null, false); }
//       // if (!user.verifyPassword(password)) { return done(null, false); }
//       return done(null, user);
//     });
//   }
// ));

// passport.use(new localStrategy(Patient.authenticate()));
// passport.serializeUser(Patient.serializeUser());
// passport.deserializeUser(Patient.deserializeUser());

// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new localStrategy(Doctor.authenticate()));
// passport.serializeUser(Doctor.serializeUser());
// passport.deserializeUser(Doctor.deserializeUser());




app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.admin = '5a43713198f27d1030ca180f';
    next();
});


app.use(indexRoutes);


app.listen(process.env.PORT || 3000, function(){
    console.log("Helpbit Server has Started on port 3000 !!");
});