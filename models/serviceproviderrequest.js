var mongoose = require ("mongoose");

var serviceproviderrequestSchema = new mongoose.Schema({

	username: { type: String, required: true, index: { unique: true }},
    password: { type: String, required: true },
	companyname: String,
	ownername : String,
	cnic: String,
	location: String,
	servicetype: String 

});

module.exports =  mongoose.model("Serviceproviderrequest", serviceproviderrequestSchema);