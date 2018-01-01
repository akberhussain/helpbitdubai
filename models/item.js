var mongoose = require ("mongoose");

// Creating Issues Schema

var issuesSchema = new mongoose.Schema({
    issue: String
})

var Issues = mongoose.model("Issue", issuesSchema)
// Creating Subitem Schema
var subitemSchema = new mongoose.Schema({
    name: String,
    item: {
       itemid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
       },
       itemname: String  
    },
    issues: [issuesSchema]
})

var Subitem = mongoose.model("Subitem", subitemSchema);


    // Crreating Item Schema

var itemSchema = new mongoose.Schema({    
    servicename: String,
    itemtype: String,
    url: String,
    // subitem: {
    //   name: String,
    //   generateForm: Boolean,
    //   subSubitem: {
    //     name: String,
    //     generateForm: Boolean

    //   }
    // }
    subitems: [subitemSchema],
    issues: [issuesSchema]  


});
var Item = mongoose.model("Item", itemSchema);

module.exports = {
    Item : Item,
    Subitem : Subitem,
    Issues : Issues
}