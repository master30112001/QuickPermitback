const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const clubHeadForm = require("../models/clubHeadForm");
// Load User model
const User = require("../models/User");
const Form = require("../models/form");
const {
  sendOtpEmail,
  sendEmail,
} = require("../common_functionalities/MailSender");
const { forwardAuthenticated, ensureAuthenticated } = require("../config/auth");

// Login Page
router.get("/login", forwardAuthenticated, async (req, res) =>
  res.render("home/login")
);

router.get("/forgotpassword", (req, res) => res.render("home/forgotpassword"));

router.get("/newpassword/:id", async (req, res) => {
  var id = req.params.id;
  id = id.toString();
  `  `;

  console.log(req.user);

  res.render("home/newpassword", {
    id,
  });
});

router.post("/loginPageAfterForgotPassword", async (req, res) => {
  try {
    var id = req.body.id;
    var password = req.body.password;
    bcrypt.genSalt(10, async (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) throw err;
        password = hash;
        const doc = await User.findOneAndUpdate(
          {
            _id: id,
          },
          {
            password,
          }
        );
        if (doc) {
          res.json({
            status: "success",
          });
          return null;
        } else {
          res.json({
            status: "error",
          });
          return null;
        }
      });
    });
  } catch (e) {
    res.status(404);
    console.log("Error: ", e);
  }
});

router.post("/verifyingEmail", async (req, res) => {
  var email = req.body.email;

  User.find({
    email,
  }).then((exists) => {
    if (exists.length == 1) {
      var otp = sendOtpEmail(email);

      res.json({
        status: "success",
        otp,
        object_id: exists[0]._id,
      });
      return null;
    } else {
      console.log("error");
      res.json({
        status: "error",
      });
      return null;
    }
  });
});

// Register Page
router.get("/register", async (req, res) => res.render("home/register"));

// Register
router.post("/register", (req, res) => {
  const { name, email, password, password2, regid, position, year } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({
      msg: "Please enter all fields",
    });
  }

  if (password != password2) {
    errors.push({
      msg: "Passwords do not match",
    });
    res.render("home/register", {
      errors,
      name,
      email,
      password,
      password2,
      regid,
    });
  }

  if (password.length < 6) {
    errors.push({
      msg: "Password must be at least 6 characters",
    });
  }

  if (errors.length > 0) {
    res.render("home/register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    User.findOne({
      $or: [{ email: email }, { regid: regid.toLowerCase() }],
    }).then((user) => {
      if (user) {
        errors.push({
          msg: "Email or Registration ID already exists",
        });
        res.render("home/register", {
          errors,
          name,
          email,
          password,
          password2,
          regid,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          regid,
          position,
          year,
        });
        sendEmail(
          email,
          "Account creation request",
          "Congratulations !! Your request to create an account on QUICK PERMIT was successfully sent to admin. Your account will be approved soon..."
        );

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash("success_msg", "Registration request sent");
                res.redirect("/loginActivity/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post("/login", async (req, res, next) => {
  if (req.body.email == "admin@gmail.com") {
    passport.authenticate("local", {
      successRedirect: "/admindashboard",
      failureRedirect: "/loginActivity/login",
      failureFlash: true,
    })(req, res, next);
  } else {
    const user = await User.findOne({ email: req.body.email });
    if (user && user.position === "Teacher") {
      passport.authenticate("local", {
        successRedirect: "/teacherdashboard",
        failureRedirect: "/loginActivity/login",
        failureFlash: true,
      })(req, res, next);
    } else {
      passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/loginActivity/login",
        failureFlash: true,
      })(req, res, next);
    }
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/loginActivity/login");
});

router.get("/passwordchange", forwardAuthenticated, (req, res) => {
  res.render("home/passwordchange.hbs");
});

module.exports = router;
