const mysql = require("mysql2/promise");
require("dotenv").config();
const mySqlPool = mysql.createPool({
  host: "srv1267.hstgr.io",
  user: "u323738017_u_groman",
  password: "|zG=9Fyfn2",
  database: "u323738017_grocery_manage",
});
// const mySqlPool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

module.exports = mySqlPool;
