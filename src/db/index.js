const mongoose = require("mongoose");
const { dbUser, dbPassword, dbHost, dbName } = require("../configs/db.config");
const { logger } = require("../middlewares/logger.middleware");

const mongoConnect = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${dbUser}:${dbPassword}@${dbHost}/${dbName}?retryWrites=true&w=majority`
    );
    logger.info("Connected to DB");
  } catch (err) {
    console.log(err);
  }
};

module.exports = mongoConnect;
