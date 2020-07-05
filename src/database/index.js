const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const url = process.env.MONGO_URL;
let database;

module.exports.connect = () => {
  if (database) return;
  mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true });
  database = mongoose.connection;
  database.on("error", () => {
    console.error("=> Error connecting to database");
  });
  database.on("open", () => {
    console.info("=> Connected to the database");
  });
};
