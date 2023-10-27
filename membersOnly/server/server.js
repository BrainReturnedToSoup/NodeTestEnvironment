require("dotenv").config();

const express = require("express");
const app = express();

const PORT = 9229;

//*****************Auth-Service******************/

const initPassportLocal = require("./passport");
const passport = initPassportLocal();
//returns the passport instance configured to local strategy
//includes declaring the serialization and deserialization as well

app.use(passport.initialize());
app.use(passport.session()); //for passport auth and session serialization/deserialization

//******************App-Config*******************/

app.set("view engine", "ejs");
app.set("views", "../views"); //view engine

app.use(express.urlencoded({ extended: false }));
//so we can reference form body data in form req objects received

app.listen(PORT, () => {
  console.log(`Server is on, listening on port ${PORT}`);
});

//*******************Exports*********************/

module.exports = { app, passport }; //export the passport to be used in the routes folder
