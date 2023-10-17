const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "message_board",
  port: 3306,
  connectionLimit: 10,
});

module.exports = { ...module.exports, pool }; // add pool to list of exports
