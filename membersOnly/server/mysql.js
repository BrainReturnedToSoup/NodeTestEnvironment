const mysql = require("mysql2/promise");

const HOST = process.env.MYSQL_HOST,
  USER = process.env.MYSQL_USER,
  PW = process.env.MYSQL_PW,
  DB = process.env.MYSQL_DB;

const pool = mysql.createPool({
  host: HOST,
  user: USER,
  password: PW,
  database: DB,
  connectionLimit: 10,
});

module.exports = pool;
