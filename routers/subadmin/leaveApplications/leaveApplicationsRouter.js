const express = require("express");
const router = express.Router();
const { sendEmail } = require("../../../common_functionalities/MailSender");

const User = require("../../../models/User");
const leaveApplicationForm = require("../../../models/leaveApplicationForm");
const {
  ensureAuthenticated,
  forwardAuthenticated,
} = require("../../../config/auth");

//for authority user
router.post("/submitLeaveReason", async (req, res) => {
  if (req.user.position !== "Teacher") {
    res.render("404.ejs");
  }
  await leaveApplicationForm.findByIdAndUpdate(req.body.id, {
    rejectedmessage: req.body.message,
  });
  res.status(200).send();
});

router.get(
  "/teacherdashboard/leaveApplications/:filter",
  ensureAuthenticated,
  async (req, res) => {
    try {
      if (req.user.position !== "Teacher") {
        res.render("404.ejs");
      }
      const filter = req.params.filter;
      const teachername = req.user.name;
      const allforms = await leaveApplicationForm.find({
        teacherselected: teachername,
      });

      if (filter == "approved") {
        const approvedforms = allforms.filter((form) => {
          if (form.status === "approved") {
            return true;
          } else return false;
        });

        var approvedForms = [];
        for (var i = 0; i < approvedforms.length; i++) {
          var ownerName = await User.findById({ _id: approvedforms[i].owner });
          approvedForms.push({
            ...approvedforms[i]._doc,
            ownerName: ownerName.name,
          });
        }

        res.render("subadmin/teacherLeaveForms", {
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
          var ownerName = await User.findById({ _id: pendingforms[i].owner });
          pendingForms.push({
            ...pendingforms[i]._doc,
            ownerName: ownerName.name,
          });
        }

        res.render("subadmin/teacherLeaveForms", {
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
          var ownerName = await User.findById({ _id: rejectedforms[i].owner });
          rejectedForms.push({
            ...rejectedforms[i]._doc,
            ownerName: ownerName.name,
          });
        }

        res.render("subadmin/teacherLeaveForms", {
          user: req.user,
          allforms: rejectedForms,
        });
      }

      if (filter == "all") {
        var allForms = [];
        for (var i = 0; i < allforms.length; i++) {
          var ownerName = await User.findById({ _id: allforms[i].owner });
          allForms.push({
            ...allforms[i]._doc,
            ownerName: ownerName.name,
          });
        }
        res.render("subadmin/teacherLeaveForms", {
          user: req.user,
          allforms: allForms,
        });
      }
    } catch (e) {
      res.status(404);
      console.log("Error: ", e);
    }
  }
);

// to view particular request(form)
router.get("/approveLeaveReq/:id", ensureAuthenticated, async (req, res) => {
  try {
    if (req.user.position !== "Teacher") {
      res.render("404.ejs");
    }

    const teachername = req.user.name;

    const _id = req.params.id;
    // console.log(_id);
    const form = await leaveApplicationForm.findById(_id);

    const ownerid = form.owner;
    // console.log(ownerid);

    const ownercred = await User.findById(ownerid);
    // console.log(ownercred);

    // console.log(form);

    var sdate = form.datefrom;
    var sday = String(sdate.getDate()).padStart(2, "0");
    var smonth = String(sdate.getMonth() + 1).padStart(2, "0");
    var syear = sdate.getFullYear();

    var edate = form.dateto;
    var eday = String(edate.getDate()).padStart(2, "0");
    var emonth = String(edate.getMonth() + 1).padStart(2, "0");
    var eyear = edate.getFullYear();

    var disabled = "no";
    for (var i = 0; i < form.teacherapproved.length; i = i + 1) {
      if (form.teacherapproved[i] == teachername) {
        disabled = "yes";
      }
    }

    for (var i = 0; i < form.teacherrejected.length; i = i + 1) {
      if (form.teacherrejected[i] == teachername) {
        disabled = "yes";
      }
    }

    res.render("subadmin/openLeaveForm.ejs", {
      user: req.user,
      form,
      teachername,
      ownercred,
      sday,
      smonth,
      syear,
      eday,
      emonth,
      eyear,
      disabled,
    });
  } catch (e) {
    res.status(404);
    console.log("Error: ", e);
  }
});

// after clicking on approve
router.get(
  "/approveLeaveReq/:id/approved/:teacherName",
  ensureAuthenticated,
  async (req, res) => {
    try {
      if (req.user.position !== "Teacher") {
        res.render("404.ejs");
      }
      const teachername = req.params.teacherName;
      const _id = req.params.id;
      // _id is of form selected

      const form = await leaveApplicationForm.findByIdAndUpdate(
        _id,
        { $push: { teacherapproved: teachername } },
        { new: true, runValidators: true }
      );

      if (form.teacherrejected.length == 0) {
        await leaveApplicationForm.findByIdAndUpdate(
          _id,
          { $set: { status: "approved" } },
          { runValidators: true }
        );
      }
      //send mail
      const owner = await User.findById(form.owner);
      var email = owner.email;
      var emailbody =
        "You have now been authorised for your leave from " +
        form.datefrom.toString() +
        " to " +
        form.dateto.toString();
      sendEmail(email, "Authorised", emailbody);
      res.render("subadmin/afterapproved.hbs", {
        redirectURL: "/teacherdashboard/leaveApplications/pending",
      });
    } catch (e) {
      res.status(404);
      console.log("Error: ", e);
    }
  }
);

// after teacher clicking on reject for event requests
router.get(
  "/approveLeaveReq/:id/rejected/:teacherName",
  ensureAuthenticated,
  async (req, res) => {
    try {
      if (req.user.position !== "Teacher") {
        res.render("404.ejs");
      }
      const teachername = req.params.teacherName;
      const _id = req.params.id;
      // _id is of form selected

      const form = await leaveApplicationForm.findByIdAndUpdate(
        _id,
        {
          $push: { teacherrejected: teachername },
          $set: { status: "rejected" },
        },
        { new: true, runValidators: true }
      );

      res.render("subadmin/afterrejected.hbs", {
        formID: _id.toString(),
        redirectURL: "/teacherdashboard/leaveApplications/pending",
        submitReasonAt: "submitLeaveReason",
      });
    } catch (e) {
      res.status(404);
      console.log("Error: ", e);
    }
  }
);

module.exports = router;
