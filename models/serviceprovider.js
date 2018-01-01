var mongoose = require ("mongoose");

var serviceproviderSchema = new mongoose.Schema({

	username: { type: String, required: true, index: { unique: true }},
    password: { type: String, required: true },
	companyname: String,
	servicetype: String,
	catagories: [{
		type: mongoose.Schema.Types.ObjectId,
        ref : "Item"		
	}],
	subcatagories: [{
		type: mongoose.Schema.Types.ObjectId,
        ref : "Subitem"		
	}],
	services: [{
		service: String,
		timing : String,
		warranty: String,
		returnpolicy: String,
		instruction: String

	}]

});

module.exports =  mongoose.model("Serviceprovider", serviceproviderSchema);
