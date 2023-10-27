const userCollection = require("../Server/mongodb");
const bcrypt = require("bcrypt");
const { passport } = require("../Server/server");

//*******************GET*******************/

function serveSignupView(req, res) {
  if (req.user) {
    res.redirect("/");
  }
  //if there is already a user logged in
  //by checking for the presence of the 'user' property

  res.render("signupPage");
}

const signupPageMW = [serveSignupView];
//for serving the sign up page with the form
//to the user on a GET request

//********************POST*****************/

function checkIfAlreadyLoggedIn(req, res, next) {
  if (req.user) {
    res.status(400).json({
      message:
        "Failed to accept new sign up request, as it was made by an already logged in user",
    });
  }

  next();
  //if the source isn't from a logged in user,
  //then proceed with the sign up field validation
}

function checkIfEmailAlreadyExists(req, res, next) {
  const { email } = req.body;

  userCollection
    .findOne({ email: email })
    .then((user) => {
      if (user) {
        res.status(400).json({
          message:
            "Failed to accept new sign up request, as it appears the supplied email is already tied to an existing user",
        });
      }

      next();
      //if the supplied email address isn't linked to an existing user
      //then proceed with the username validation as well
    })
    .catch((error) => {
      next(error);
    });
}

function checkIfUsernameIsTaken(req, res, next) {
  const { username } = req.body;

  userCollection
    .findOne({ username: username })
    .then((user) => {
      if (user) {
        res.status(400).json({
          message:
            "Failed to accept new sign up request, as it appears the supplied username is already tied to an existing user",
        });
      }

      next();
      //if the supplied username address isn't linked to an existing user
      //then proceed with the creation of the new user in the system
    })
    .catch((error) => {
      next(error);
    });
}

function addNewUser(req, res, next) {
  const { email, username, password } = req.body;

  const hashedPassword = bcrypt.hash(password, 10); //simple but strong hash

  userCollection.insertOne({
    email: email,
    password: hashedPassword,
    username: username,
  });

  next();
  //user has been added, proceed to automatically logging them in
}

function autoLoginNewUser(req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/sign-in",
    failureFlash: true,
  })(req, res, next);
  //uses the same req.body value to then validate
  //based on email and password like normal
  //and thus automatically logs in the user
  //after they created their account
}

const newSignupMW = [
  checkIfAlreadyLoggedIn,
  checkIfEmailAlreadyExists,
  checkIfUsernameIsTaken,
  addNewUser,
  autoLoginNewUser,
];
//for processing a new sign up for the app on a POST request
//will check to see if a user with the same email already exists and or
//username already exists.
//If so, the form will invalidate and they will be asked to try again based on
//whatever caused the issue

module.exports = { signupPageMW, newSignupMW };
