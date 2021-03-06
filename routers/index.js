const express = require("express");
const router = express.Router();
const Form = require("../models/form");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const clubHeadForm = require("../models/clubHeadForm");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const { findById } = require("../models/form");
const { analytics } = require("googleapis/build/src/apis/analytics");

// required for excel sheet
var bodyParser = require("body-parser");
var multer = require("multer");
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");

// Landing Page
router.get("/", forwardAuthenticated, (req, res) => res.render("home/index"));

router.get("/aboutus", (req, res) => {
  res.render("home/aboutus.ejs");
});

router.get("/calendarkshit", ensureAuthenticated, async (req, res) => {
  // const { createEvent } = require("../calendarback");

  if (req.user.email == "admin@gmail.com") {
    var url = "/admindashboard";
  } else if (req.user.position === "Teacher") {
    var url = "/teacherdashboard";
  } else {
    var url = "/dashboard";
  }
  res.render("calendar.ejs", {
    url,
  });
});

router.get("/profile", ensureAuthenticated, async (req, res) => {
  if (req.user.email == "admin@gmail.com") {
    var url = "/admindashboard";
  } else if (req.user.position === "Teacher") {
    var url = "/teacherdashboard";
  } else {
    var url = "/dashboard";
  }
  res.render("Profile.ejs", {
    url,
    user: req.user,
  });
});

module.exports = router;
