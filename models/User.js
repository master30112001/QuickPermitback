const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  year: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  approved: {
    type: String,
    default: "pending",
  },
  rejectedreason: {
    type: String,
    required: false,
  },
  adminrejectedreason: {
    type: String,
    required: false,
  },
  regid: {
    type: String,
    required: true,
  },
  clubs: [
    {
      club: String,
    },
  ],
  authClubs: [
    {
      authClub: String,
    },
  ],
});

// associate every user with their form
UserSchema.virtual("forms", {
  ref: "Form",
  localField: "_id",
  foreignField: "owner",
});

// in form model the owner field associates every form with the owner user

const User = mongoose.model("User", UserSchema, "usersCollection");

// User.findByIdAndUpdate("5fe4211201b70719823fc627", {
//   clubs:[{ club: "PASC"}, {club: "DEBSOC"}, {club: "PICT EDC"}]
//   },
// {new: true, runValidators: true}, (err, res) =>{
//   console.log(res)
// })

module.exports = User;
