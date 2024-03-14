require("dotenv").config();

const configMailer = {
  EMAIL: "gmail",
  EMAIL_PORT: 587,
};
module.exports = {
  nodeMailerUser: process.env.USER_MAILER,
  nodeMailerPassword: process.env.PASSWORD_MAILER,
  configMailer,
};
