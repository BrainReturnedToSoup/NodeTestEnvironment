function serveLoginView(req, res) {
  if (req.user) {
    res.redirect("/");
  }
  //if there is already a user logged in
  //by checking for the presence of the 'user' property

  res.render("loginPage");
}

const loginPageMW = [serveLoginView];
//for simply serving the web page used to
//login to the site on a GET request if applicable

module.exports = loginPageMW;
