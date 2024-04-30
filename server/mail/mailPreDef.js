const mailer = require("./mailer.js");
const fs = require("fs");
const path = require("path");
const {user} = require("../config/mail.json");

const recoveryPasswordMessage = async (mail, newPassword)=>{
    let html = "";

    fs.readFile(path.join(__dirname, "./html/recoveryPassword.html"), {encoding: "utf-8"},async (err,result)=>{
        html = result;
        await mailer.transport.sendMail({
            from: user,
            to: mail,
            subject: "Nova senha gerada com sucesso! | PODIUM SISTEMA DE COMPETIÇÕES",
            html: html + `<b>${newPassword}</b>`
        });
    })

    

    console.log("|PODIUM - SISTEMA DE E-MAIL 🏆|\n->A new password recovery email has just been sent.<-");
}

module.exports = {recoveryPasswordMessage}
