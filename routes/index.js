var express = require("express");
var router  = express.Router();
var passport = require("passport");
var localStrategy = require("passport-local").Strategy
var multer = require('multer');
var okrabyte = require("okrabyte");
var tesseract = require('node-tesseract');
var middleware = require('../middleware/index');
var User = require("../models/user")
var Item = require("../models/item").Item;
var Subitem = require("../models/item").Subitem;
var Issues = require("../models/item").Issues;

// import {Item, Subitem} from '../models/item';

// var nodemailer = require('nodemailer');


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

router.post("/addsubitemto:id", middleware.checkIfAdmin, function(req, res){
    Item.findById(req.params.id, function(err, item){

        var subitem = req.body.subitem;

        if(err){
            console.log(err);
        } else{
            
            Subitem.create({name: subitem}, function(err, subitem){
                if(err){
                    console.log(err);
                } else{
                    item.subitems.push(subitem);
                    item.save(function(err, item){
                        if(err){
                            req.flash("error", "An unexpexted error occured while adding "+ subitem)
                        } else{            
                            req.flash("success", subitem.name + " added to " + item.servicename );
                            res.redirect("/");          
                        }
                    });
                }
            });
    
        }

    })
});

    // Show Subitems Page

router.get("/service:id", function(req, res){
    Item.findById(req.params.id, function(err, item){
        res.render("subitems", {item: item})
    });
});
    
    // Show Related add Issue form

router.get("/addissuestoitem:itemId/:subitemId", middleware.checkIfAdmin, function(req, res){

    Item.findById(req.params.itemId, function(err, item){
        if(err){
            res.redirect("back");
            req.flash("error", "Something went wrong, Please try again later");
        } else{
            Subitem.findById(req.params.subitemId, function(err, subitem){
                if(err){
                    console.log(err);
                } else{
                    res.render("addissues", {subitem: subitem, item: item});
                }
            });            
        }

    });
});

//  Add Issues to Sub Items

router.post("/addissuesto:itemId/subitem:subitemId", middleware.checkIfAdmin, function(req, res){
    
    var myissue = req.body.myissue;

    Item.findById(req.params.itemId, function(err, item){
        if(err){
            req.flash("error", "Can not find item you are looking for !!!");
            res.redirect("back");
        } else{
            Subitem.findById(req.params.subitemId, function(err, subitem){
                if(err){
                    req.flash("error", "Issue can not be added to this item. Try Later !!!");
                    res.redirect("back");
                } else{
                    Issues.create({issue: myissue}, function(err, issue){
                        if(err){
                            console.log(err);
                        } else{
                            subitem.issues.push(issue);
                            subitem.save();
                            req.flash("success", "Issue added to " + subitem.name);                            
                            res.redirect("back");
                        }
                    })
                }
            })
        }
    })
});


router.get("/services:itemId/subitem:subitemId", function(req, res){
    Item.findById(req.params.itemId, function(err, item){
        if(err){
            req.flash("error", "This item does't exist or has been shifted !!");
            res.redirect("back");
        } else{
            Subitem.findById(req.params.subitemId, function(err, subitem){
                if(err){
                    req.flash("error", "This item does't exist or has been shifted !!");
                    res.redirect("back");      
                } else{
                    res.render("renderservices", {item: item, subitem: subitem});
                }
            })
        }
    })
});


module.exports = router;