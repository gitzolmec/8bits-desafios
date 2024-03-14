const nodemailer = require("nodemailer");
const {
  nodeMailerUser,
  nodeMailerPassword,
  configMailer,
} = require("../configs/nodemailer.config");

const transporter = nodemailer.createTransport({
  service: configMailer.EMAIL,
  port: configMailer.EMAIL_PORT,
  auth: {
    user: nodeMailerUser,
    pass: nodeMailerPassword,
  },
});
module.exports = transporter;
