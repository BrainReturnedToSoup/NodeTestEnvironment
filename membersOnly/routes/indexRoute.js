const router = require("express").Router;

//*******************App*********************/

const { app } = require("../Server/server");

//****************Middleware*****************/

const { indexPageMW, indexNewMessageMW } = require("../middleware/indexMW");

//******************Routes*******************/

router.get("/", indexPageMW);

router.post("/", indexNewMessageMW);

app.use("/", router);
//define the app route within the route file itself
//to avoid circular dependencies with the passport instance
