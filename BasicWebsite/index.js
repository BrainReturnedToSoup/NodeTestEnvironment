const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http
  .createServer((request, response) => {
    const requestedURL = request.url;
    const filePath =
      requestedURL === "/"
        ? path.join(__dirname, "paths/index.html")
        : path.join(__dirname, "paths" + requestedURL + ".html");
    // have to add the intermediary path and the file tag in order to correctly target
    //the individual pages that the url represents

    try {
      const targetPage = fs.readFileSync(filePath, "utf-8");

      response.writeHead(200, { "Content-Type": "text/html" }); //write a head meaning a successful request
      response.end(targetPage, "utf-8"); //will return the target html file that matches the request url
    } catch (error) {
      if (error.code === "ENOENT") {
        const pathNotFoundPage = fs.readFileSync(
          path.join(__dirname, "paths/404.html"),
          "utf-8"
        );

        response.writeHead(404, { "Content-Type": "text/html" });
        response.end(pathNotFoundPage, "utf-8"); // in any case that the html file for a supplied request url is not found, default to the error 404 page
      } else {
        response.writeHead(500);
        response.end(`Server Error: ${error.code}`); // represents any other type of server error besides not finding the right html file
      }
    }
  })
  .listen(8080);
