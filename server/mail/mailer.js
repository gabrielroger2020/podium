const nodemailer = require("nodemailer");
const {user, pass} = require("../config/mail.json");

const transport = nodemailer.createTransport({
    service: "hotmail",
    auth: {user, pass}
})

module.exports = {transport};