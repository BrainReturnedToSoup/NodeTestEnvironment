const router = require("express").Router;

//*******************App*********************/

const { app, passport } = require("../Server/server");

//****************Middleware*****************/

const loginPageMW = require("../middleware/loginMW");

//******************Routes*******************/

router.get("/", loginPageMW);

router.post(
  "/",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.use("/log-in", router);
//define the app route within the route file itself
//to avoid circular dependencies with the passport instance
