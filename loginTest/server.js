const express = require("express");
const app = express();

const pool = require("./mysqlPool"); //db for users

const bcrypt = require("bcrypt"); //for hashing passwords

const passport = require("passport"); //install passport separately form passport-local
const LocalStrategy = require("passport-local").Strategy;

const flash = require("express-flash");
const session = require("express-session"); //for managing authentication sessions

//----------Configurations-----------//

app.set("view engine", "ejs");
app.set("views", "./views");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const connection = await pool.getConnection();
      const [user] = await connection.execute(
        "SELECT username FROM user WHERE username = ? AND password = ?",
        [username, password]
      ); //make sure the username and the password match what is within the db

      connection.release();

      //because the returned value of 'user' is actually an array of users
      if (user.length === 0) {
        return done(null, false, {
          message: "Either an incorrect username or password",
        }); //no match found based on the query
      }

      console.log("user", user);
      console.log("Success!");
      return done(null, user[0]); //returns the user on success
    } catch (error) {
      done(error);
    }
  })
); //ADD BEFORE passport.initialize() AND YOUR SERIALIZATION DECLARATIONS ALWAYS
//LocalStrategy is ran every time we use the passport.authenticate() middleware

passport.serializeUser((user, done) => {
  done(null, user.username);
}); //ALWAYS BEFORE THE passport.initialize()
//allows user to stay logged in as they navigate around the app
//creates a cookie to do so
//USED IN THE BACKGROUND BY passport

passport.deserializeUser(async (id, done) => {
  try {
    const connection = await pool.getConnection();
    const [user] = await connection.execute(
      "SELECT username, password FROM user WHERE username = ?",
      [id]
    ); //grabs the only returned query record

    connection.release();

    done(null, user[0]);
  } catch (error) {
    done(error);
  } //ALWAYS BEFORE THE passport.initialize()
}); //undoes the serialization on log out
//USED IN THE BACKGROUND BY passport

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));

app.use(passport.initialize()); // init passport after all of your configurations are made
app.use(passport.session()); // also init the session tracker

app.use(express.urlencoded({ extended: false }));
//so that submitted forms can be accessed via the 'body' property on the req object

//---------App-Entry-Points----------//

//index

app.get("/", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      "SELECT username, password FROM user"
    );

    connection.release();

    res.render("index", { users }); //render all of the login credentials
  } catch (error) {
    console.error(error, error.stack);
    res.status(500).send("Internal Server Error");
  }
});

//login

app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);
//authenticates the information that was received
//from the login form specifically. Will vet the 'username' and
//'password' body properties using the previously declared LocalStrategy.
//As you can see the strategy possesses the corresponding args for username
//and password, and thus you have the space to do what you need to do in order
//to check the db for the username and password combo, and execute what needs to be
//done when the user passes or fails

//register

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const connection = await pool.getConnection();
    await connection.execute(
      "INSERT INTO user (username, password) VALUES (?, ?)",
      [username, password]
    ); //insert the username and password combination into the db

    connection.release();

    res.redirect("/");
  } catch (error) {
    console.error(error, error.stack);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    console.log("logged out");
    res.redirect("/");
  });
});
//enables the ability to log out when a user is logged in
//in which the logout method was added via the passport middleware.
//Logging out will remove the serialization kept in cookies used to
//identify you as an individual user.

//------------Port-Init--------------//
const PORT = 9229;

app.listen(PORT, () => {
  console.log(`Server is on and listening on port ${PORT}`);
});
