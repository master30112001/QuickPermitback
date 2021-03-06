const express = require("express");
const router = express.Router();
// Load User model
const User = require("../../../models/User");
const Form = require("../../../models/form");
const club = require("../../../models/club");
const { createEvent } = require("../../../calendarback");
const clubHeadForm = require("../../../models/clubHeadForm");
const {
  ensureAuthenticated,
  forwardAuthenticated,
} = require("../../../config/auth");
const { findById } = require("../../../models/form");
const { sendEmail } = require("../../../common_functionalities/MailSender");

//for events
router.post("/submitReasonPermission", async (req, res) => {
  if (req.user.position !== "Teacher") {
    res.render("404.ejs");
  }
  await Form.findByIdAndUpdate(req.body.id, {
    rejectedmessage: req.body.message,
  });
  res.status(200).send();
});

// goroute -
router.get(
  "/teacherdashboard/requests/:filter",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const filter = req.params.filter;
      const teachername = req.user.name;
      const allforms = await Form.find({
        teacherselected: teachername,
      });

      if (filter == "approved") {
        const onlyapprovedforms = allforms.filter((form) => {
          for (var i = 0; i <= form.teacherapproved.length - 1; i++) {
            if (form.teacherapproved[i] == teachername) {
              return true;
            }
          }
          return false;
        });

        res.render("subadmin/eventRequestsAll", {
          user: req.user,
          allforms: onlyapprovedforms,
        });
      }

      if (filter == "pending") {
        const approvedallforms = allforms.filter((form) => {
          for (var i = 0; i <= form.teacherapproved.length - 1; i++) {
            if (form.teacherapproved[i] == teachername) {
              return false;
            }
          }
          return true;
        });

        const finalforms = approvedallforms.filter((form) => {
          for (var i = 0; i <= form.teacherrejected.length - 1; i++) {
            if (form.teacherrejected[i] == teachername) {
              return false;
            }
          }
          return true;
        });

        res.render("subadmin/eventRequestsAll", {
          user: req.user,
          allforms: finalforms,
        });
      }

      if (filter == "rejected") {
        const onlyrejectedforms = allforms.filter((form) => {
          for (var i = 0; i <= form.teacherrejected.length - 1; i++) {
            if (form.teacherrejected[i] == teachername) {
              return true;
            }
          }
          return false;
        });

        res.render("subadmin/eventRequestsAll", {
          user: req.user,
          allforms: onlyrejectedforms,
        });
      }

      if (filter == "all") {
        res.render("subadmin/eventRequestsAll", {
          user: req.user,
          allforms: allforms,
        });
      }
    } catch (e) {
      res.status(404).send("error");
    }
  }
);

// akas
router.get(
  "/teacherdashboard/:club/requests/:filter",
  ensureAuthenticated,
  async (req, res) => {
    try {
      if (req.user.position !== "Teacher") {
        res.render("404.ejs");
      }
      const filter = req.params.filter;
      const teachername = req.user.name;
      const clubName = req.params.club;
      const allforms = await Form.find({
        $and: [
          {
            teacherselected: teachername,
          },
          {
            clubselected: clubName,
          },
        ],
      });

      if (filter == "approved") {
        const onlyapprovedforms = allforms.filter((form) => {
          for (var i = 0; i <= form.teacherapproved.length - 1; i++) {
            if (form.teacherapproved[i] == teachername) {
              return true;
            }
          }
          return false;
        });

        res.render("subadmin/teacherPermissions", {
          user: req.user,
          allforms: onlyapprovedforms,
          clubName: clubName,
        });
      }

      if (filter == "pending") {
        const approvedallforms = allforms.filter((form) => {
          for (var i = 0; i <= form.teacherapproved.length - 1; i++) {
            if (form.teacherapproved[i] == teachername) {
              return false;
            }
          }
          return true;
        });

        const finalforms = approvedallforms.filter((form) => {
          for (var i = 0; i <= form.teacherrejected.length - 1; i++) {
            if (form.teacherrejected[i] == teachername) {
              return false;
            }
          }
          return true;
        });

        res.render("subadmin/teacherPermissions", {
          user: req.user,
          allforms: finalforms,
          clubName: clubName,
        });
      }

      if (filter == "rejected") {
        const onlyrejectedforms = allforms.filter((form) => {
          for (var i = 0; i <= form.teacherrejected.length - 1; i++) {
            if (form.teacherrejected[i] == teachername) {
              return true;
            }
          }
          return false;
        });

        res.render("subadmin/teacherPermissions", {
          user: req.user,
          allforms: onlyrejectedforms,
          clubName: clubName,
        });
      }

      if (filter == "all") {
        res.render("subadmin/teacherPermissions", {
          user: req.user,
          allforms: allforms,
          clubName: clubName,
        });
      }
    } catch (e) {
      res.status(404);
      console.log("Error: ", e);
    }
  }
);

// club member details
router.get(
  "/teacherdashboard/:clubName/clubmemberdetails",
  ensureAuthenticated,
  async (req, res) => {
    if (req.user.position !== "Teacher") {
      res.render("404.ejs");
    }

    const clubName = req.params.clubName;

    const clubDetails = await club.findOne({
      clubName,
    });

    res.render("subadmin/club/clubmemberdetails", {
      user: req.user,
      club: clubDetails,
    });
  }
);

// club event details
router.get(
  "/teacherdashboard/:clubName/clubeventdetails",
  ensureAuthenticated,
  async (req, res) => {
    if (req.user.position !== "Teacher") {
      res.render("404.ejs");
    }

    var clubName = req.params.clubName;
    var allforms = await Form.find();
    const clubDetails = await club.findOne({
      clubName,
    });

    allforms = allforms.filter((form) => {
      if (form.teacherrejected.length == 0 && form.clubselected == clubName) {
        return true;
      }
      return false;
    });
    res.render("subadmin/club/clubeventdetails", {
      user: req.user,
      club: clubDetails,
      allforms,
    });
  }
);

// to view particular request(form)
router.get("/approvereq/:id", ensureAuthenticated, async (req, res) => {
  try {
    if (req.user.position !== "Teacher") {
      res.render("404.ejs");
    }
    const teachername = req.user.name;

    const _id = req.params.id;
    // console.log(_id);
    const form = await Form.findById(_id);

    const ownerid = form.owner;
    // console.log(ownerid);

    const ownercred = await User.findById(ownerid);
    // console.log(ownercred);

    // console.log(form);

    var edate = form.dateforrequest;
    var dd = String(edate.getDate()).padStart(2, "0");
    var mm = String(edate.getMonth() + 1).padStart(2, "0");
    var yyyy = edate.getFullYear();

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

    res.render("subadmin/approvalpage.hbs", {
      form: form,
      teachername: teachername,
      ownercred: ownercred,
      dd: dd,
      mm: mm,
      yyyy: yyyy,
      disabled: disabled,
    });
  } catch (e) {
    res.status(404);
    console.log("Error: ", e);
  }
});

// after clicking on approve
router.get(
  "/approvereq/:id/approved/:teacherName",
  ensureAuthenticated,
  async (req, res) => {
    try {
      if (req.user.position !== "Teacher") {
        res.render("404.ejs");
      }
      const teachername = req.params.teacherName;
      const _id = req.params.id;
      // _id is of form selected

      const form = await Form.findByIdAndUpdate(
        _id,
        {
          $push: {
            teacherapproved: teachername,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );
      const formclub = form.clubselected;

      //to send mail
      const owner = await User.findById(form.owner);
      var email = owner.email;
      var emailbody =
        "You have now been authorised to conduct the event " +
        form.eventName.toString();
      sendEmail(email, "Authorised", emailbody);

      res.render("subadmin/afterapproved.hbs", {
        redirectURL: `/teacherdashboard/`,
      });

      if (form.teacherselected.length === form.teacherapproved.length) {
        createEvent(
          form.dateforrequest,
          form.starthr,
          form.starthr,
          form.starthr,
          form.starthr,
          form.eventName,
          "pict",
          form.description
        );
      }
    } catch (e) {
      res.status(404);
      console.log("Error: ", e);
    }
  }
);

// after teacher clicking on reject for event requests
router.get(
  "/approvereq/:id/rejected/:teacherName",
  ensureAuthenticated,
  async (req, res) => {
    try {
      if (req.user.position !== "Teacher") {
        res.render("404.ejs");
      }
      const teachername = req.params.teacherName;
      const _id = req.params.id;
      // _id is of form selected

      const form = await Form.findByIdAndUpdate(
        _id,
        {
          $push: {
            teacherrejected: teachername,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );
      console.log(_id.toString());
      // console.log(form);
      res.render("subadmin/afterrejected.hbs", {
        formID: _id.toString(),
        redirectURL: "/teacherdashboard",
        submitReasonAt: "submitReasonPermission",
      });
    } catch (e) {
      res.status(404);
      console.log("Error: ", e);
    }
  }
);

module.exports = router;
