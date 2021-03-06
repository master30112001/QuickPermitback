const express = require("express");
const router = express.Router();
// Load User model
const User = require("../../models/User");
const Form = require("../../models/form");
const clubHeadForm = require("../../models/clubHeadForm");
const {
  ensureAuthenticated,
  forwardAuthenticated,
} = require("../../config/auth");
const { findById } = require("../../models/form");
const club = require("../../models/club");
const teacherHeadForm = require("../../models/teacherHeadForm");

router.get("/requestforadmin", async (req, res) => {
  if (req.user.position !== "Teacher") {
    res.render("404.ejs");
  }

  await User.findByIdAndUpdate(req.user._id, { adminStatus: 0 });
  res.redirect("/teacherdashboard");
});

router.get("/teacherdashboard", ensureAuthenticated, async (req, res) => {
  if (req.user.position !== "Teacher") {
    res.render("404.ejs");
  }
  // const form = await teacherHeadForm.findOne({owner :req.user._id})
  //status is teacherHead for particular club
  res.render("subadmin/teacherdashboard.ejs", {
    user: req.user,
    // status: form.teacherStatus,
    approved: req.user.approved,
    authClubs: req.user.authClubs,
  });
});

//for becoming guardian clubs teacher side
router.get("/clubGuardian", ensureAuthenticated, async (req, res) => {
  try {
    if (req.user.position !== "Teacher") {
      res.render("404.ejs");
    }
    const allclubs = await club.find();
    const authClubs = req.user.authClubs;
    var newClubs = [];
    allclubs.forEach((allclub) => {
      var flag = 0;
      for (var i = 0; i < authClubs.length; i++) {
        if (allclub.clubName == authClubs[i].authClub) {
          flag = 1;
          break;
        }
      }
      if (flag == 0) {
        newClubs.push(allclub.clubName);
      }
    });

    res.render("subadmin/viewClubGuardian", {
      user: req.user,
      authClubs: req.user.authClubs,
      newClubs,
    });
  } catch (e) {
    console.log("Error", e);
    res.status(404).send();
  }
});

//club Activity page
router.get(
  "/joinClubs/:club/clubActivityG",
  ensureAuthenticated,
  async (req, res) => {
    try {
      if (req.user.position !== "Teacher") {
        res.render("404.ejs");
      }
      const clubName = req.params.club;

      const form = await club.findOne({ clubName: clubName });
      // console.log(form)
      var status = 0;
      if (form.teacherHeads.includes(req.user.name)) {
        status = 1;
      } else {
        status = 0;
      }

      res.render("subadmin/clubActivityPage", {
        user: req.user,
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
  "/joinClubs/:club/clubGuardianForm",
  ensureAuthenticated,
  async (req, res) => {
    try {
      if (req.user.position !== "Teacher") {
        res.render("404.ejs");
      }
      const clubName = req.params.club;
      const form = await club.findOne({ clubName: clubName });
      const form2 = await teacherHeadForm.findOne({
        owner: req.user.id,
        clubSelected: clubName,
      });
      var status;
      // var rejectedMsg;
      // console.log("Owner : " +req.user.id)
      // console.log("ClubName : " +clubName)
      // console.log(form2);

      if (form2 == null) {
        status = 0;
      }
      if (form2 != null) {
        status = form2.teacherStatus;
        var rejectedMsg = form2.rejectedMessage;
      }
      if (form.teacherHeads.includes(req.user.name)) {
        status = 1;
      }

      // console.log(status)
      // console.log(rejectedMsg)
      res.render("subadmin/clubGuardianForm.ejs", {
        user: req.user,
        clubName: clubName,
        status: status,
        rejectedMsg: rejectedMsg,
      });
    } catch (e) {
      res.status(404);
      console.log("Error: ", e);
    }
  }
);

router.post(
  "/:club/saveClubGuardianForm",
  ensureAuthenticated,
  async (req, res) => {
    try {
      if (req.user.position !== "Teacher") {
        res.render("404.ejs");
      }
      const clubName = req.params.club;
      // console.log(clubName)
      const form2 = new teacherHeadForm({
        clubSelected: clubName,
        owner: req.user._id,
      });

      await form2.save();
      await form2.updateOne({ $set: { teacherStatus: 100 } });
      // console.log(form2)

      res.status(201);
      res.render("subadmin/afterAnimation.hbs");
    } catch (e) {
      res.status(400, e);
    }
  }
);

module.exports = router;
