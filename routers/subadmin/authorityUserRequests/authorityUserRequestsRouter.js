const express = require("express");
const router = express.Router();
// Load User model
const User = require("../../../models/User");
const Form = require("../../../models/form");
const clubHeadForm = require("../../../models/clubHeadForm");
const {
  ensureAuthenticated,
  forwardAuthenticated,
} = require("../../../config/auth");
const { findById } = require("../../../models/form");
const club = require("../../../models/club");
const { sendEmail } = require("../../../common_functionalities/MailSender");
const { Console } = require("console");

//for authority user
router.post("/submitReasonClubHeads", async (req, res) => {
  if (req.user.position !== "Teacher") {
    res.render("404.ejs");
  }
  await clubHeadForm.findByIdAndUpdate(req.body.id, {
    rejectedmessage: req.body.message,
  });
  res.status(200).send();
});

// my activity so club included
router.get(
  "/teacherdashboard/:club/clubHeadForms/:filter",
  ensureAuthenticated,
  async (req, res) => {
    try {
      if (req.user.position !== "Teacher") {
        res.render("404.ejs");
      }
      const filter = req.params.filter;
      const teacherName = req.user.name;
      const clubName = req.params.club;
      const allforms = await clubHeadForm.find({
        $and: [
          {
            teacherselected: teacherName,
          },
          {
            clubselected: clubName,
          },
        ],
      });
      // console.log(filter)
      // console.log(clubName)
      // console.log(allforms)

      if (filter == "approved") {
        const approvedforms = allforms.filter((form) => {
          if (form.memberStatus === 1 || form.memberStatus === 2) {
            return true;
          } else return false;
        });

        var approvedForms = [];
        for (var i = 0; i < approvedforms.length; i++) {
          var ownerName = await User.findById({
            _id: approvedforms[i].owner,
          });
          approvedForms.push({
            ...approvedforms[i]._doc,
            ownerName: ownerName.name,
          });
        }

        res.render("subadmin/teacherHeadRequest", {
          user: req.user,
          allforms: approvedForms,
          clubName: clubName,
        });
      }

      if (filter == "pending") {
        const pendingforms = allforms.filter((form) => {
          //100 -> member request is sent
          //200 -> authority request is sent
          if (form.memberStatus === 100 || form.memberStatus == 200) {
            return true;
          } else return false;
        });

        var pendingForms = [];
        for (var i = 0; i < pendingforms.length; i++) {
          var ownerName = await User.findById({
            _id: pendingforms[i].owner,
          });
          pendingForms.push({
            ...pendingforms[i]._doc,
            ownerName: ownerName.name,
          });
        }
        // console.log("Pending : "+ pendingForms)

        res.render("subadmin/teacherHeadRequest", {
          user: req.user,
          allforms: pendingForms,
          clubName: clubName,
        });
      }

      if (filter == "rejected") {
        const rejectedforms = allforms.filter((form) => {
          if (form.memberStatus === -1 || form.memberStatus === -2) {
            return true;
          } else return false;
        });

        var rejectedForms = [];
        for (var i = 0; i < rejectedforms.length; i++) {
          var ownerName = await User.findById({
            _id: rejectedforms[i].owner,
          });
          rejectedForms.push({
            ...rejectedforms[i]._doc,
            ownerName: ownerName.name,
          });
        }

        res.render("subadmin/teacherHeadRequest", {
          user: req.user,
          allforms: rejectedForms,
          clubName: clubName,
        });
      }

      if (filter == "all") {
        var allForms = [];
        for (var i = 0; i < allforms.length; i++) {
          var ownerName = await User.findById({
            _id: allforms[i].owner,
          });
          allForms.push({
            ...allforms[i]._doc,
            ownerName: ownerName.name,
          });
        }
        res.render("subadmin/teacherHeadRequest", {
          user: req.user,
          allforms: allForms,
          clubName: clubName,
        });
      }
    } catch (e) {
      res.status(404);
      console.log("Error: ", e);
    }
  }
);

router.get(
  "/teacherdashboard/clubHeadForms/:filter",
  ensureAuthenticated,
  async (req, res) => {
    try {
      if (req.user.position !== "Teacher") {
        res.render("404.ejs");
      }
      const filter = req.params.filter;
      const teachername = req.user.name;
      const allforms = await clubHeadForm.find({
        teacherselected: teachername,
      });

      if (filter == "approved") {
        const approvedforms = allforms.filter((form) => {
          if (form.status === "approved") {
            return true;
          } else return false;
        });

        // var approvedForms = []
        for (var i = 0; i < approvedforms.length; i++) {
          var ownerName = await User.findById({
            _id: approvedforms[i].owner,
          });
          approvedForms.push({
            ...approvedforms[i]._doc,
            ownerName: ownerName.name,
          });
        }

        res.render("subadmin/teacherHeadRequest", {
          user: req.user,
          allforms: approvedForms,
        });
      }

      if (filter == "pending") {
        const pendingforms = allforms.filter((form) => {
          if (form.status === "pending") {
            return true;
          } else return false;
        });

        var pendingForms = [];
        for (var i = 0; i < pendingforms.length; i++) {
          var ownerName = await User.findById({
            _id: pendingforms[i].owner,
          });
          pendingForms.push({
            ...pendingforms[i]._doc,
            ownerName: ownerName.name,
          });
        }

        res.render("subadmin/teacherHeadRequest", {
          user: req.user,
          allforms: pendingForms,
        });
      }

      if (filter == "rejected") {
        const rejectedforms = allforms.filter((form) => {
          if (form.status === "rejected") {
            return true;
          } else return false;
        });

        var rejectedForms = [];
        for (var i = 0; i < rejectedforms.length; i++) {
          var ownerName = await User.findById({
            _id: rejectedforms[i].owner,
          });
          rejectedForms.push({
            ...rejectedforms[i]._doc,
            ownerName: ownerName.name,
          });
        }

        res.render("subadmin/teacherHeadRequest", {
          user: req.user,
          allforms: rejectedForms,
        });
      }

      if (filter == "all") {
        var allForms = [];
        for (var i = 0; i < allforms.length; i++) {
          var ownerName = await User.findById({
            _id: allforms[i].owner,
          });
          allForms.push({
            ...allforms[i]._doc,
            ownerName: ownerName.name,
          });
        }
        res.render("subadmin/teacherHeadRequest", {
          user: req.user,
          allforms: allForms,
        });
      }
    } catch (e) {
      res.status(404).send("error");
    }
  }
);

//authority user request visible to sub admin.
router.get(
  "/approveHeadReq/:id/approved",
  ensureAuthenticated,
  async (req, res) => {
    try {
      if (req.user.position !== "Teacher") {
        res.render("404.ejs");
      }
      const _id = req.params.id;
      // _id is of form selected

      //---------akash---------------//
      //for update in clubHeadForm
      var clubName;
      var form3 = await clubHeadForm.findById(_id);
      var status = form3.memberStatus;

      //find the name of owner
      const owner = await User.findById(form3.owner);
      // console.log(ownerName)
      // console.log(ownerName.name)
      if (form3.clubposition == "Club Member") {
        status = 1;
      } else if (form3.clubposition == "Authority User") {
        status = 2;
      }

      form3 = await clubHeadForm.findByIdAndUpdate(
        _id,
        {
          $set: { memberStatus: status },
          $push: { teacherapproved: req.user.name },
        },
        { new: true, runValidators: true }
      );

      clubName = form3.clubselected;
      // console.log(form3)

      //for update in club collection
      var form2 = await club.findOne({
        clubName: clubName,
      });
      if (form3.clubposition == "Club Member" && form3.memberStatus == 1) {
        form2 = await club.findOneAndUpdate(
          {
            clubName: clubName,
          },
          {
            $push: {
              members: owner.name,
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );

        owner.clubs = owner.clubs.concat({ club: clubName });
        await owner.save();
      }
      if (form3.clubposition == "Authority User" && form3.memberStatus == 2) {
        form2 = await club.findOneAndUpdate(
          {
            clubName: clubName,
          },
          {
            $push: {
              clubHeads: owner.name,
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );
        owner.clubs = owner.clubs.concat({ club: clubName });
        owner.authClubs = owner.authClubs.concat({ authClub: clubName });
        await owner.save();
      }
      // console.log(form2)
      console.log(owner);

      //---------akash---------------//
      //to send mail
      var email = owner.email;
      var emailbody =
        "You have now been authorised as authority user for  " +
        clubName.toString();
      sendEmail(email, "Authorised", emailbody);

      res.render("subadmin/afterapproved.hbs", {
        redirectURL: `/teacherdashboard/${clubName}/clubHeadForms/pending`,
      });
    } catch (e) {
      res.status(500);
      console.log("Error : " + e);
    }

    // const form = await clubHeadForm.findByIdAndUpdate(
    //   _id,
    //   {$set: { status: "approved" }},
    //   { new: true, runValidators: true }
    // );

    // console.log(form.clubselected)

    // const newClub = { authClub: form.clubselected}
    // const user = await User.findByIdAndUpdate(
    //   form.owner,
    //   {$set: { adminStatus: 1},
    //   $push: { authClubs: newClub}},
    //   { new: true, runValidators: true }
    // )

    // console.log(user)
  }
);

router.get(
  "/approveHeadReq/:id/rejected",
  ensureAuthenticated,
  async (req, res) => {
    const _id = req.params.id;
    try {
      if (req.user.position !== "Teacher") {
        res.render("404.ejs");
      }

      // _id is of form selected
      var clubName;

      //---------akash---------------//
      //for update in clubHeadForm
      var form3 = await clubHeadForm.findByIdAndUpdate(_id);
      var status = form3.memberStatus;
      clubName = form3.clubselected;
      if (form3.clubposition == "Club Member") {
        status = -1;
      } else if (form3.clubposition == "Authority User") {
        status = -2;
      }

      form3 = await clubHeadForm.findByIdAndUpdate(
        _id,
        {
          $set: { memberStatus: status },
          $push: { teacherrejected: req.user.name },
        },
        { new: true, runValidators: true }
      );

      // console.log(form3)
      //---------akash---------------//
    } catch (e) {
      res.status(404);
      console.log("Error : " + e);
    }

    // console.log(user)
    res.render("subadmin/afterrejected.hbs", {
      formID: _id.toString(),
      redirectURL: `/teacherdashboard/${clubName}/clubHeadForms/pending`,
      submitReasonAt: "submitReasonClubHeads",
    });
  }
);

module.exports = router;
