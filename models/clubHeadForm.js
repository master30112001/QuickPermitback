const mongoose = require("mongoose");
const User = require("./User");

const clubHeadFormSchema = mongoose.Schema({
    dateforrequest: {
        type: Date,
        default: Date.now,
    },
    clubposition:{
        type: String,
        // required: true
    },
    clubselected:{
        type: String,
        required: true
    },
    teacherselected:{
        type: "array",
        // required: true
    },
    teacherapproved:{
        type: "array",
    },
    teacherrejected:{
        //type :String,
        type: "array",
    },
    status:{
        type: String,
        default: "pending"
    },
    memberStatus:{
        type : Number,
        default : 0,
    },
    rejectedmessage:{
        type: String,
        default : 'None',
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
})


//memberStatus for admin 
// 0 - default
// 100 - request sent
// 1 - member
// 2 - authority User
// -1 - rejected member
// -2 - rejected authority User
const clubHeadForm = mongoose.model("clubHeadForm", clubHeadFormSchema , "clubHeadsCollection");

module.exports = clubHeadForm;
