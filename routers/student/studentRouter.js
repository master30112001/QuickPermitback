const express = require("express");
const router = new express.Router();
const Form = require("../../models/form");
const path = require("path");
const { db } = require("../../models/form");

const bcrypt = require("bcryptjs");
const passport = require("passport");
// Load User model
const User = require("../../models/User");
const {
  forwardAuthenticated,
  ensureAuthenticated,
} = require("../../config/auth");
const club = require("../../models/club");
const clubHeadForm = require("../../models/clubHeadForm");
const leaveApplicationForm = require("../../models/leaveApplicationForm");

router.get("/history/eventRequests", ensureAuthenticated, async (req, res) => {
  try {
    if (req.user.position !== "Student") {
      res.render("404.ejs");
    }

    const allforms = await Form.find({ owner: req.user._id });

    // await req.user.populate("forms").execPopulate();   ... .if u do this populate, u can access all forms using req.user.forms
    res.render("student/history.ejs", { type: "e", user: req.user, allforms });
  } catch (e) {
    res.status(404);
    console.log("Error: ", e);
  }
});

router.get(
  "/history/leaveApplications",
  ensureAuthenticated,
  async (req, res) => {
    try {
      if (req.user.position !== "Student") {
        res.render("404.ejs");
      }
      const allforms = await leaveApplicationForm.find({ owner: req.user._id });

      // await req.user.populate("forms").execPopulate();   ... .if u do this populate, u can access all forms using req.user.forms
    } catch (e) {
      res.status(404);
      console.log("Error: ", e);
    }
  }
);

router.get(
  "/history/clubHeadRequests",
  ensureAuthenticated,
  async (req, res) => {
    try {
      if (req.user.position !== "Student") {
        res.render("404.ejs");
      }
      const allforms = await clubHeadForm.find({ owner: req.user._id });

      // await req.user.populate("forms").execPopulate();   ... .if u do this populate, u can access all forms using req.user.forms
      res.render("student/history.ejs", {
        type: "a",
        user: req.user,
        allforms,
      });
    } catch (e) {
      res.status(404);
      console.log("Error: ", e);
    }
  }
);

// Club Updated Akash Dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  try {
    if (req.user.position !== "Student") {
      res.render("404.ejs");
    }
    const clubs = req.user.clubs;
    const authClubs = req.user.authClubs;
    var viewOnlyClubs = [];
    clubs.forEach((club) => {
      var flag = 0;
      for (var i = 0; i < authClubs.length; i++) {
        if (authClubs[i].authClub == club.club) {
          flag = 1;
          break;
        }
      }
      if (flag == 0) {
        viewOnlyClubs.push(club.club);
      }
    });
  } catch (e) {
    res.status(404);
    console.log("Error: ", e);
  }
});

//for joining clubs student side
router.get("/joinClubs", ensureAuthenticated, async (req, res) => {
  try {
    if (req.user.position !== "Student") {
      res.render("404.ejs");
    }
    const clubs = req.user.clubs;
    const authClubs = req.user.authClubs;
    var viewOnlyClubs = [];
    clubs.forEach((club) => {
      var flag = 0;
      for (var i = 0; i < authClubs.length; i++) {
        if (authClubs[i].authClub == club.club) {
          flag = 1;
          break;
        }
      }
      if (flag == 0) {
        viewOnlyClubs.push(club.club);
      }
    });

    const allclubs = await club.find();

    var newClubs = [];
    allclubs.forEach((allclub) => {
      var flag = 0;
      for (var i = 0; i < clubs.length; i++) {
        if (allclub.clubName == clubs[i].club) {
          flag = 1;
          break;
        }
      }
      if (flag == 0) {
        newClubs.push(allclub.clubName);
      }
    });

    res.render("student/viewClubs", {
      user: req.user,
      newClubs,
      viewOnlyClubs,
      authClubs,
    });
  } catch (e) {
    res.status(404);
    console.log("Error: ", e);
  }
});

//for clubs so new
router.get(
  "/joinClubs/:club/clubActivity",
  ensureAuthenticated,
  async (req, res) => {
    try {
      if (req.user.position !== "Student") {
        res.render("404.ejs");
      }
      const clubName = req.params.club;
      // console.log(clubName)

      const form = await club.findOne({ clubName: clubName });
      // console.log(form1)

      var status;
      if (form.members.includes(req.user.name)) {
        status = 1;
      }
      if (form.clubHeads.includes(req.user.name)) {
        status = 2;
      } else {
        status = 0;
      }

      res.render("student/clubActivityPage.ejs", {
        user: req.user,
        form: form,
        clubName: clubName,
        status: status,
      });
    } catch (e) {
      res.status(404);
      console.log("Error: ", e);
    }
  }
);

router.get(
  "/joinClubs/:club/membershipForm",
  ensureAuthenticated,
  async (req, res) => {
    if (req.user.position !== "Student") {
      res.render("404.ejs");
    }
    const clubName = req.params.club;
    var teacherRejected;
    var rejectedMsg = "";
    var form1;
    var form2;
    var status;

    try {
      form1 = await club.findOne({ clubName: clubName });
      // console.log(form1)

      // form2 will have club members and authority users
      // authority users will be second choice
      form2 = await clubHeadForm.find({
        owner: req.user.id,
        clubselected: clubName,
      });

      if (form2.length == 0) {
        status = 0;
      }
      if (form1.members.includes(req.user.name)) {
        status = 1;
      }
      if (form1.clubHeads.includes(req.user.name)) {
        status = 2;
      }
      if (form2.length != 0) {
        var last = form2.length - 1;
        if (form2[last].memberStatus == 200) {
          status = form2[last].memberStatus;
        }
        if (form2[last].memberStatus == 100) {
          status = form2[0].memberStatus;
          // teacherRejected = form2[0].teacherrejected;
          // rejectedMsg = form2[0].rejectedmessage;
        }
        status = form2[last].memberStatus;
        teacherRejected = form2[last].teacherrejected;
        rejectedMsg = form2[last].rejectedmessage;
      }

      // console.log(form2.length)
      // console.log(status)
      // console.log("Second Form")
      // console.log(form2);
    } catch (e) {
      res.status(404);
      console.log("Error: ", e);
    }
  }
);

router.post(
  "/:club/saveMembershipForm",
  ensureAuthenticated,
  async (req, res) => {
    if (req.user.position !== "Student") {
      res.render("404.ejs");
    }
    // console.log(clubHeadFormData)
    try {
      const clubName = req.params.club;
      // console.log(clubName)

      const clubHeadFormData = new clubHeadForm({
        ...req.body,
        clubselected: clubName,
        owner: req.user._id,
      });

      await clubHeadFormData.save();

      if (req.body.clubposition == "Authority User") {
        await clubHeadFormData.updateOne({ $set: { memberStatus: 200 } });
      } else {
        await clubHeadFormData.updateOne({ $set: { memberStatus: 100 } });
      }

      res.status(201);
      res.render("student/afterAnimation.hbs");
    } catch (e) {
      res.status(400);
      console.log("Error: ", e);
    }
  }
);

module.exports = router;
