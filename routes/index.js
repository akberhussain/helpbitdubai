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
var Serviceprovider = require("../models/serviceprovider");
var Serviceproviderrequest = require("../models/serviceproviderrequest");
var nodemailer = require("nodemailer");


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

passport.use('serviceprovider',new localStrategy(function(username, password, done){
    Serviceprovider.findOne({username:username},function(err,user){
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
            Serviceprovider.findById(id,function(err,user){
        
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

// ============================== User Login =========================

router.post('/login',passport.authenticate('user',{failureRedirect:'/'}),(req,res) => {
      res.redirect('/');
})

// ====================== Service Provider Login ==========================

router.post('/loginserviceprovider', passport.authenticate('serviceprovider',{failureRedirect:'/'}),(req,res) => {
  req.flash("success", "Service Provider Logged In ");    
  res.redirect('/');
})



// =================== showing add Items route to admin ====================

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

        var name = req.body.subitem;
        var myitem = {
            itemid : item._id,
            itemname: item.servicename
        };
        var obj = {
            name: name,
            item: myitem
        };
        if(err){
            console.log(err);
        } else{
            
            Subitem.create(obj, function(err, subitem){
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

//  Show issues on subitem

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


// ======================== Serviceprovider Form ===========================

router.get("/becomeserviceprovider", function(req, res){
    res.render("serviceproviderform");
});

// =========================Send request to admin =========================


router.post("/serviceproviderrequest", function(req, res){
    
    var username = req.body.email;
    var password = req.body.password;
    var companyname = req.body.companyname;
    var servicetype = req.body.servicetype;
    var ownername = req.body.firstname + " " + req.body.lastname;
    var location = req.body.location;
    var cnic = req.body.cnic;

    var obj = {
        username : username,
        password: password,
        companyname: companyname,
        servicetype: servicetype,
        ownername: ownername,
        location: location,
        cnic : cnic
    }

        var a;

          Serviceprovider.find({}, function(err, serviceproviders){
            
            for(i = 0; i<serviceproviders.length; i++){
                 if(serviceproviders[i].username == username){
                    a = true;
                    break;
                 } 
            }
                  if(a){
                    req.flash("error", "Serviceprovider already exists with this Email");
                    res.redirect("back");
                  }
                    if(!a){
                        // User.find({}, function(err, users){
                        //     for(var i=0; i<users.length; i++){
                        //         if(users[i].email === )
                        //     }
                        // })
                    Serviceproviderrequest.create(obj, function(err, request){
                        if(err){
                            console.log(err)
                            req.flash("error", err)
                            res.redirect("back");
                        } else{
                            req.flash("success", "Your account will be shortly created once verified by admin. You'll be notified on Email Address Stay connected!! ");
                            res.redirect("/");
                        }
                    })                      
                }

          });


    // Serviceproviderrequest.create(obj, function(err, request){
    //     if(err){
    //         console.log(err)
    //         req.flash("error", err)
    //         res.redirect("back");
    //     } else{
    //         req.flash("success", "Your account will be shortly created once verified by admin. You'll be notified on Email Address Stay connected!! ");
    //         res.redirect("/");
    //     }
    // })

});


// ========================Show Requests to Admin ===========================

router.get("/requests", middleware.checkIfAdmin, function(req, res){
    Serviceproviderrequest.find({}, function(err, requests){
        res.render("requests", {requests: requests});
    })
});



// ========================== ADD Service Provider

router.post("/acceptserviceprovider:id", function(req, res){

	var myid = req.params.id;

	Serviceproviderrequest.findById(req.params.id, function(err, serviceprovider){
		var newServiceprovider = Serviceprovider();

		newServiceprovider.username = serviceprovider.username;
		newServiceprovider.password = serviceprovider.password;
		newServiceprovider.ownername = serviceprovider.ownername;
		newServiceprovider.location = serviceprovider.location;
		newServiceprovider.servicetype = serviceprovider.servicetype;
		newServiceprovider.cnic = serviceprovider.cnic;
		newServiceprovider.companyname = serviceprovider.companyname;

	    var a;

	      Serviceprovider.find({}, function(err, serviceproviders){
	        
	        for(i = 0; i<serviceproviders.length; i++){
	             if(serviceproviders[i].username == newServiceprovider.username){
	                a = true;
	                break;
	             } 
	        }
	              if(a){
	                req.flash("error", "Serviceprovider already exists with this Email");
	                res.redirect("back");
	              }
	                   if(!a){
	                      newServiceprovider.save((err,user) => {
	                      if(err){console.error("Error: ", err)}
	                      else{
	                        var nodemailer = require('nodemailer');

	                        var transporter = nodemailer.createTransport({
	                          service: 'gmail',
	                          auth: {
	                            user: 'help.helpbitdubai@gmail.com',
	                            pass: '123abc..'
	                          }
	                        });
// '"Fred Foo 👻" <foo@blurdybloop.com>'
	                        var mailOptions = {
	                          from: '"Helpbit Dubai" <help.helpbitdubai@gmail.com>',
	                          to: newServiceprovider.username,
	                          subject: 'Helpbit Acount Confirmation',
	                          text: 'Your Account was successfully created at Helpbit kindly visit https://secure-lowlands-28937.herokuapp.com/ to login to your account '
	                        };

	                        transporter.sendMail(mailOptions, function(error, info){
	                          if (error) {
	                            console.log(error);
	                          } else {
	                            console.log('Email sent: ' + info.response);
	                          }
	                        });
	                        req.flash("success", "Serviceprovider Sucessfully Created")
	                        res.redirect('/deletereq'+ myid);
	                      }
	                    })         
	                  
	                }

	      });		

	})

})

// ================ Delete Request (Middle Route) If Accepted ===================

router.get("/deletereq:id",middleware.checkIfAdmin, function(req, res){
        var myid = req.params.id;
        res.render("deletepage", {myid: myid})
});


// ================== Delete Request Route ======================================


router.delete("/deleteserviceprovider:id", middleware.checkIfAdmin, function(req, res){
   Serviceproviderrequest.findByIdAndRemove(req.params.id, function(err){
      if(err){

      	req.flash("error", "Try again Later !!!")
        res.redirect("back");
      } else{
      	res.redirect("/requests");
      }
      // req.flash("success", "Sucessfully deleted a Request");
   }); 
});


// ======================= Middle stage to choose services ======================






// router.post("/becomeserviceprovider", function(req, res){
//     var username = req.body.email;
//     var password = req.body.password;
//     var companyname = req.body.companyname;
//     var servicetype = req.body.servicetype;
//     Item.find({itemtype: servicetype}, function(err, items){
//         // console.log(items);
//         // if(item.subitems.length>0){
//             // Subitem.find({}, function(err, subitem){

//             // })
//             res.render("chooseservices", {items: items, servicetype: servicetype});            
//         // }
//         // res.redirect("back");
//     });
// })

// router.get("/showall:name", function(req, res){
//     Item.find({itemtype: req.params.name}, function(err, items){
//         if(err){
//             console.log(err);
//         } else{
//             res.send(items);
//         }
//     });
// });

module.exports = router;