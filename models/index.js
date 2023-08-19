"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
//const config = require(__dirname + '/../config/config.json')[env];
const db = {};

const cDatabase = process.env.DB_NAME || "cinema_gt";
const cUsername = process.env.DB_USER || "root";
const cPassword = process.env.DB_PASS || null;

let sequelize;
console.log(env);
if (env == "development") {
  sequelize = new Sequelize(cDatabase, cUsername, cPassword, {
    host: "127.0.0.1",
    dialect: "mysql",
  });
} else {
  sequelize = new Sequelize(cDatabase, cUsername, cPassword, {
    host: "127.0.0.1",
    dialect: "mysql",
    dialectOptions: {
      socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
    },
  });
}

/* let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
} */

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
