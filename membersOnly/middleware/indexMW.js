const userCollection = require("../Server/mongodb");
const mysqlPool = require("../Server/mysql");

//****************GET******************/

function getCurrentUserUsername(req, res, next) {
  if (!req.user) {
    next();
    //just skip to the next stage if
    //the user isn't logged in
    //shouldn't prevent them from seeing comments but
    //will not allow them to add any unless they are logged in
  }

  const { user } = req;

  userCollection
    .findOne({ _id: user._id })
    .then((user) => {
      req.user.username = user.username;
      //store the username in the req.user object
      //so that the username can be rendered on screen
      //for the profile tab

      next();
    })
    .catch((error) => {
      next(error);
    });
}

function getAllComments(req, res, next) {
  let connection;

  mysqlPool
    .getConnection()
    .then((conn) => {
      connection = conn;
      //store the connection instance in the outer scope
      //so it can be accessed by the catch block in the event of an
      //error

      const messages = conn.execute("SELECT user_id, message FROM message"); //get all messages themselves
      conn.release();
      //after the data is retrieved, release the connection

      return messages;
    })
    .then((messages) => {
      //use the user id values attached to each message to retrieve corresponding
      const retrievedUsernames = {}; //cache for usernames

      const packagedMessages = messages.map((message) => {
        if (message.user_id in retrievedUsernames) {
          message.username = retrievedUsernames[message.user_id]; //if the corresponding username was already retrieved before
          delete message.user_id;
          //don't want to save the serialization value after the username was already retrieved
          //especially for those that aren't the user themselves

          return message;
        } else {
          userCollection
            .findOne({ _id: message.user_id })
            .then((user) => {
              retrievedUsernames[message.user_id] = user.username; //cache the corresponding username
              message.username = user.username;
              delete message.user_id;

              return message; //add the corresponding username value to each message present
            })
            .catch((error) => {
              if (connection) {
                connection.release();
              } //release the connection in the event of an error

              next(error);
            });
        }
      });

      req.messages = packagedMessages;
      //add the packaged messages with the message and their username to a custom 'messages' property on the req

      next();
    })
    .catch((error) => {
      connection.release();
      next(error);
    });
}

function serveHomePage(req, res) {
  const { messages } = req;

  if (req.user) {
    const { user } = req;

    res.render("index", { messages, user });
    //when the end user is a logged in user
  }

  res.render("index", { messages });
  //when it's a non logged in user

  //supply the messsages and the user object to be used in rendering the view
  //if there isn't user object on the req, then a guest version of the home page
  //is rendered. Basically, this just disallows anyone from adding messages unless
  //they are logged in.
}

const indexPageMW = [getCurrentUserUsername, getAllComments, serveHomePage];
//handles GET requests on the root path
//will display the page of all present messages made by users
//also displays a box that you can click and add a message to
//the new message box is only available if you are logged in

//****************POST*****************/

function validateUserSource(req, res, next) {
  if (!req.user) {
    res.status(400).json({
      message:
        "Message supplied failed to validate, new message source is not serialized",
    });
  } //check for existing user serialization

  const { _id } = req.user;

  userCollection
    .findOne({ _id: _id })
    .then((user) => {
      if (!user) {
        res.status(400).json({
          message:
            "Message supplied failed to validate, supplied serialization is not linked to a valid user",
        });
      } //check if the stored serialization id is linked to an existing user

      next();
      //if so, move onto validating the message itself
    })
    .catch((error) => {
      next(error);
    });
}

function validateNewMessage(req, res, next) {
  const { message } = req.body;
  const maxMessageLength = 150;
  const messageLength = message.split("").length;

  if (messageLength > maxMessageLength) {
    res.status(400).json({
      message:
        "Message supplied failed to validate, message supplied exceeded the 150 character limit ",
    });
  } //make sure the message isn't too big to store in a single message record in mysql

  next(); //if such is small enough, move onto actually adding the message to the db
}

function addNewMessageToDB(req, res, next) {
  const { message } = req.body;
  const { _id } = req.user;
  let connection;

  mysqlPool
    .getConnection()
    .then((conn) => {
      connection = conn;

      conn.execute(
        "INSERT INTO message (user_id, message) VALUES (?,?)"[(_id, message)] //prevent SQL injection
      );
      conn.release();
      //after the message is inserted, release the connection

      next();
    })
    .catch((error) => {
      if (connection) {
        connection.release();
      }
      next(error);
    });
}
//if the message passes, then

function refreshHomePage(req, res) {
  res.redirect("/"); //refresh by redirecting to home
}

const indexNewMessageMW = [
  validateUserSource,
  validateNewMessage,
  addNewMessageToDB,
  refreshHomePage,
];
//handles the POST requests on the root path
//will be the entry point used to submit new messages
//can only submit messages by a valid user, which it
//with their serialization

module.exports = { indexPageMW, indexNewMessageMW };
