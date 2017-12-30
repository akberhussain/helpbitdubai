var mongoose = require ("mongoose");

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
    subitems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : "Subitem"
        }
    ],


});

module.exports = mongoose.model("Item", itemSchema);