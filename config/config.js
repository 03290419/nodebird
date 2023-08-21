const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  development: {
    username: "root",
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: "nodebird2",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  test: {
    username: "root",
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: "nodebird_test",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql",
  },
};
