const express = require("express");
// const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const hbs = require("hbs");
const ejs = require("ejs");
require("./db/mongoose");
const mongoose = require("mongoose");
const Form = require("./models/form");
var bodyParser = require("body-parser");
const formRouter = require("./routers/form/formRouter");
const studentRouter = require("./routers/student/studentRouter");
var compression = require("compression");

//subadmin routes
const subadminRouter = require("./routers/subadmin/subadminRouter");
const authorityUserRequestsRouter = require("./routers/subadmin/authorityUserRequests/authorityUserRequestsRouter");
const eventRequestsRouter = require("./routers/subadmin/eventRequests/eventRequestsRouter");
const leaveApplicationsRouter = require("./routers/subadmin/leaveApplications/leaveApplicationsRouter");

//admin routes
const adminRouter = require("./routers/admin/adminRouter");
const excelsheet = require("./routers/admin/excelsheet");
const subadminRequestsRouter = require("./routers/admin/subadminRequests/subadminRequestsRouter");
const userAuthRequestsRouter = require("./routers/admin/userAuthRequests/userAuthRequestsRouter");

const app = express();
const port = process.env.PORT;

// Passport Config
require("./config/passport")(passport);

const publicDirectoryPath = path.join(__dirname, "./public");
const viewsPath = path.join(__dirname, "./templates/views/");

// ejs hbs
// app.use(expressLayouts);
app.set("view engine", "hbs");
app.set("view engine", "ejs");

app.set("views", viewsPath);

app.use(express.static(publicDirectoryPath));
app.use(compression()); //use compression
//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.use("/", require("./routers/index.js"));
app.use("/loginActivity", require("./routers/LoginActivity.js"));

app.use(formRouter);
app.use(studentRouter);

app.use(adminRouter);
app.use(excelsheet);
app.use(userAuthRequestsRouter);
app.use(subadminRequestsRouter);

app.use(subadminRouter);
app.use(authorityUserRequestsRouter);
app.use(eventRequestsRouter);
app.use(leaveApplicationsRouter);

// CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  next();
});

// app.use(function (req, res) {
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
//   res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS, PUT , PATCH , DELETE");

//   res.header("Access-Control-Allow-Headers", "Content-Type");
// });

app.listen(port, () => {
  console.log("Server listening on port ", port);
});

// calendar will not work
