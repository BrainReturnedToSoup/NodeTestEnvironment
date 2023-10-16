const express = require("express");
const app = express();
const port = 8080;

const fs = require("fs");

app.listen(port, () => {
  console.log(`Running server on port ${port}`);
});

const mw1 = (req, res, next) => {
  console.log("middleware 1");
  next();
};

const mw2 = (req, res, next) => {
  console.log("middleware 2");
  next();
};

const mw3 = (req, res, next) => {
  console.log("middleware 3");
  next();
};

const pipeline = [mw1, mw2, mw3]; //defines the middleware function pipeline to execute in order when supplied to a api endpoint

app.get("/", ...pipeline, (req, res) => {
  console.log("Response");
  res.end();
});
