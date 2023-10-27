const passport = require("passport"); //install passport separately form passport-local
const LocalStrategy = require("passport-local").Strategy;

//************Misc-Dependencies*************/

const userCollection = require("./mongodb");
const bcrypt = require("bcrypt");

function initPassportLocal() {
  passport.use(
    new LocalStrategy((email, password, done) => {
      userCollection
        .findOne({ email: email }) //FOR FINDING THE CORRES USER
        .then((user) => {
          if (!user) {
            return done(null, false, {
              message: "Either your email or password is incorrect.",
            });
          } //when a user with the email wasn't found

          bcrypt //FOR PASSWORD VALIDATION
            .compare(password, user.passport, (error, isMatch) => {
              if (error) {
                return done(error);
              } //something went wrong with bcrypt

              if (!isMatch) {
                return done(null, false, {
                  message: "Either your email or password is incorrect.",
                });
              } //when the supplied password is not a match

              return done(null, user);
            })
            .catch((error) => {
              done(error);
            });
        });
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user._id); //supply the assigned mongo ID to be serialized
  });
  //allows user to stay logged in as they navigate around the app
  //creates a cookie to do so. USED IN THE BACKGROUND BY passport

  passport.deserializeUser((user, done) => {
    userCollection
      .findOne({ _id: id })
      .then((user) => {
        done(null, user);
      })
      .catch((error) => {
        done(error);
      });
  });
  //upon any type of request the user makes
  //their stored _id will be compared against what
  //is in the db to make sure the serialization corresponds to an actual user

  return passport; //return the initialized instance from the function
}

module.exports = initPassportLocal;
