const express = require("express");
const app = express();

const port = 8080;

app.set("view engine", "ejs");
app.set("views", "./views");

//-----------ROUTES----------//

const rootPipeline = require("./server_components/root-pipeline.js");

app.get("/", ...rootPipeline, (req, res) => {
  console.log("messages page sent");
});

app.get("/new-message", )
