var express = require("express");
var router  = express.Router();
var passport = require("passport");
var localStrategy = require("passport-local").Strategy
var multer = require('multer');
var okrabyte = require("okrabyte");
var tesseract = require('node-tesseract');
var middleware = require('../middleware/index');
var User = require("../models/user")
var Item = require("../models/item")

var nodemailer = require('nodemailer');


// Passport authentication

passport.use('user',new localStrategy(function(username, password, done){
    User.findOne({username:username},function(err,user){
        if(err) return done(err);
        if(!user){
            return done(null,false);
        }
        if(!user.comparePassword(password)){
            return done(null,false);
        }
        return done(null,user);
    });
}));

//passport Serialization
passport.serializeUser(function(user,done){
    done(null,user._id);
});


// DESERIALIZING USER


passport.deserializeUser(function(id,done){

    User.findById(id,function(err,user){

        if(err) return done(err);
        
        if(user){
            done(null,user);
        }
        
        else{ 
	            console.log("User Not Found");
	            req.flash("error", "User Not Found")    
	            res.redirect("/");            
        }
    })
    
});




router.get("/",function(req, res){
	console.log(req.user);

    Item.find({}, function(err, items){
        if(err){
            console.log(err);
        } else{
            res.render("index", {items: items});   
        }
    });
});


// 	Handling Signup Data

router.post("/signup", function(req, res){

    var user = new User();

	 user.username = req.body.username;
     user.name = req.body.name;
     user.num = req.body.num;
     user.password = req.body.password;

    var a;

        User.find({}, function(err, users){
        	// finding if user already exists with current email
        for(i=0;i<users.length;i++){
            if(users[i].username == user.username){
                a = true;
                break;
            }
        }

        if(a){
            req.flash("error", "User already exist with " + username );
            res.redirect("back");
        }
          if(!a){
          	// if user doesn't exist already with this email then saveing user here

            user.save((err,user) => {
                if(err){console.error("Error: ", err)}
                else{
                		// authenticating User
                  passport.authenticate("user")(req, res, function(){
    					              	
	                req.flash("success", "Welcome to Helpbit "+ user.name);
	                res.redirect('/');
	                console.log(req.user)

                  });	
                }
            })
           }
    	});
   	
	});

// Deregestering User

router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Sucessfully logged you out !!!");
    res.redirect("/");
    
});

// authenticating User

router.post('/login',passport.authenticate('user',{failureRedirect:'/'}),(req,res) => {
      res.redirect('/');
})


// showing add Items route to admin

router.get("/additems", middleware.checkIfAdmin, function(req, res){
	res.render("additems");
});


// HANDLING ADDIDNG MAIN CATAGORY

router.post("/additem", function(req, res){
    var servicename = req.body.servicename;
    var itemtype = req.body.itemtype;
    var url = req.body.url;
    var obj = {itemtype:itemtype, servicename: servicename, url: url}
    Item.create(obj, function(err, item){
        if(err){
            console.log(err);
        } else{
            req.flash("success", servicename + " seccessfully added in your services");
            res.redirect("/");
        }
    });
});

//  SHOWING ADD SUBITEM PAGE TO ADMIN

router.get("/addsubitemto:id", middleware.checkIfAdmin, function(req, res){
    Item.findById(req.params.id, function(err, item){
        res.render("addsubitem", {item: item});
    })
})

// Adding sub item

router.post("/addsubitemto:id", function(req, res){
    Item.findById(req.params.id, function(err, item){

        var subitem = req.body.subitem;

        if(err){
            console.log(err);
        } else{
            item.subitem.name = subitem;
            item.save();    
            req.flash("success", subitem + "added to " + item.servicename );
            res.redirect("back");          
        }

    })
});


module.exports = router;