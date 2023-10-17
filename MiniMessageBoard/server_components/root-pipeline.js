const { render } = require("ejs");
const pool = require("./my-sql-connection");

async function queryForMessages(req, res, next) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT * FROM message_view");

    req.messages = rows;
    //store the rows in the request object so it can be passed to the next layer

    next();
  } catch (error) {
    console.error(error, error.stack);
  }
}

function renderEjsTemplate(req, res, next) {
  try {
    const { messages } = req;

    res.render("../views/index.ejs", { messages });
    next();
  } catch (error) {
    console.error(error, error.stack);
  }
}

const rootPipeline = [queryForMessages, renderEjsTemplate];

module.exports = { ...module.exports, rootPipeline };
