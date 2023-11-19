/** Database config for database. */

const { Client } = require("pg");

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = `books-test`;
} else {
  DB_URI = `books`;
}

let db = new Client({
  host: "/var/run/postgresql",
  database: DB_URI
});

db.connect();

module.exports = db;
