const { pool } = require("./my-sql-pool");

async function addMessageToDB(req, res, next) {
  let connection;

  try {
    connection = await pool.getConnection();
    
    const { message } = req.body;

    await connection.execute("INSERT INTO message (message) VALUES (?)", [
      message,
    ]);
    //message separated for sanitization

    await connection.release();

    next();
  } catch (error) {
    console.error(error, error.stack);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

const newMessagePipeline = [addMessageToDB];

module.exports = { ...module.exports, newMessagePipeline };
