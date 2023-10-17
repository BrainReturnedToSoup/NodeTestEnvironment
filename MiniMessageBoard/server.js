const express = require("express");
const app = express();

const port = 8080;

app.set("view engine", "ejs");
app.set("views", "./views");

//-----------ROUTES----------//

const { rootPipeline } = require("./server_components/root-pipeline.js");
const {
  newMessagePipeline,
} = require("./server_components/new-message-pipeline.js");

app.get("/", rootPipeline, (req, res) => {
  console.log("messages page sent");
}); //page with all of the messages in the db

app.get("/add-new-message", (req, res) => {
  res.render("add-new-message.ejs"); //no var, just ejs for the possibility of templating

  console.log("add new message page sent");
}); //sends the page with the form

app.use(express.urlencoded({ extended: true }));
//to parse the data that is received by the POST endpoint below

app.post("/", newMessagePipeline, (req, res) => {
  res.redirect("/"); //takes the user back to the message board

  console.log("new message added");
}); //endpoint for form to use

//-------------MISC-----------//

app.listen(port, () => {
  console.log(`Server on listening on port ${port}`);
});
