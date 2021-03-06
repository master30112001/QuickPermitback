const mongoose = require("mongoose");

const clubSchema = mongoose.Schema({
    clubName :{
        type: String ,
        required : true,
    },
    teacherHeads :{
        type: "array",
        // required: true
    },
    clubHeads : {
        type: "array",
        // required: true
    },
    members :{
        type : "array",
    }
}) 

const club = mongoose.model("club", clubSchema ,"clubsCollection");

module.exports = club;