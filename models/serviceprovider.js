var mongoose = require ("mongoose");
var bcrypt = require("bcrypt-nodejs");
var passportLocalMongoose = require("passport-local-mongoose");

var serviceproviderSchema = new mongoose.Schema({

	username: { type: String, required: true, index: { unique: true }},
    password: { type: String, required: true },
	companyname: String,
	ownername : String,
	cnic: String,
	location: String,
	servicetype: String 





	// servicetype: String,

	// catagories: {

	// 	service: {
	// 		item:{
	// 			type: mongoose.Schema.Types.ObjectId,
	// 	        ref : "Item"
	//     	},
	//     	servicename: String		
	// 	},
	// 	subservice: {
	// 		item:{
	// 			type: mongoose.Schema.Types.ObjectId,
	// 	        ref : "Subitem"
	//     	},
	//     	subservicename : String
	// 	},
	// 	services: [{
	// 		service: String,
	// 		timing : String,
	// 		warranty: String,
	// 		returnpolicy: String,
	// 		instruction: String

	// 	}]

	// },
	// services: [{
	// 	service: String,
	// 	timing : String,
	// 	warranty: String,
	// 	returnpolicy: String,
	// 	instruction: String

	// }]

	// subcatagories: [{
	// 	type: mongoose.Schema.Types.ObjectId,
 //        ref : "Subitem"		
	// }],



	// services: [{
	// 	service:{
	// 		name: String,
	// 		timing : String,
	// 		warranty: String,
	// 		returnpolicy: String,
	// 		instruction: String
	// 	} 
	// }]

});

serviceproviderSchema.pre('save',function(next){
  var serviceprovider = this;
     if (!serviceprovider.isModified('password')) return next();
      bcrypt.genSalt(10,function(err,salt){
    
    if(err) return next(err);
    bcrypt.hash(serviceprovider.password,salt,null,function(err,hash){
      if(err) return next(err)
      serviceprovider.password = hash;
      next();
    })
  })
});
  
serviceproviderSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password,this.password);
    //Return either True or False
}

module.exports =  mongoose.model("Serviceprovider", serviceproviderSchema);
