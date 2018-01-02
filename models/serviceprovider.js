var mongoose = require ("mongoose");

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

module.exports =  mongoose.model("Serviceprovider", serviceproviderSchema);
