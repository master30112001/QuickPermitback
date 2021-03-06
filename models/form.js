const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  dateforrequest: {
    type: Date,
    default: Date.now,
  },
  clubselected: {
    type: String,
    required: true,
  },
  rooms: {
    type: String,
    required: false,
  },
  requirements: {
    type: String,
    required: true,
  },
  starthr: {
    type: Number,
    required: true,
  },
  startmin: {
    type: Number,
    required: true,
  },
  endhr: {
    type: Number,
    required: true,
  },
  endmin: {
    type: Number,
    required: true,
  },
  eventName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  teacherselected: {
    type: "array",
    required: true,
  },
  teacherapproved: {
    type: "array",
  },
});

const Form = mongoose.model("Form", formSchema);

module.exports = Form;
