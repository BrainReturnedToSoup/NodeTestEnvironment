const router = require("express").Router;

//*******************App*********************/

const { app } = require("../Server/server");

//****************Middleware*****************/

const { signupPageMW, newSignupMW } = require("../middleware/signupMW");

//******************Routes*******************/

router.get("/", signupPageMW);

router.post("/", newSignupMW);

app.use("/sign-up", router);
//define the app route within the route file itself
//to avoid circular dependencies with the passport instance
