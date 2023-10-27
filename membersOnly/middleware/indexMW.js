const indexPageMW = [];
//handles GET requests on the root path
//will display the page of all present messages made by users
//also displays a box that you can click and add a message to
//the new message box is only available if you are logged in

const indexNewMessageMW = [];
//handles the POST requests on the root path
//will be the entry point used to submit new messages
//can only submit messages by a valid user, which it
//with their serialization

module.exports = { indexPageMW, indexNewMessageMW };
