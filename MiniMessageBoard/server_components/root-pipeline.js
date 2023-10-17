const { render } = require("ejs");
const { pool } = require("./my-sql-pool");

async function queryForMessages(req, res, next) {
  let connection;
  try {
    connection = await pool.getConnection();

    const [rows] = await connection.execute("SELECT * FROM messages_view");

    req.messages = rows;
    //store the rows in the request object so it can be passed to the next layer
    next();
  } catch (error) {
    console.error(error, error.stack);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

function renderEjsTemplate(req, res, next) {
  try {
    const { messages } = req;

    res.render("index.ejs", { messages });
    next();
  } catch (error) {
    console.error(error, error.stack);
  }
}

const rootPipeline = [queryForMessages, renderEjsTemplate];

module.exports = { ...module.exports, rootPipeline };
