const db = require("../database/db");
const cpfAux = require("../auxiliaries/Cpf");
const phoneAux = require("../auxiliaries/PhoneNumber");
const bcrypt = require("bcrypt");
const mailPreDef = require("../mail/mailPreDef");
const dayjs = require("dayjs");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const jwt = require("jsonwebtoken");
const auth = require("../config/auth.json");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Register = (req, res)=>{
    try{

        let {user, name, surname, date_start, date_end, gender, max_athletes_teams, max_leaders_teams, max_age_athletes, min_age_athletes, indexed_summary, registrations, registrations_date_start, registrations_date_end, max_vacancies, reregistration_athletes, image_profile, trophy, medals, min_rating_medals, medals_leaders} = req.body;

        let ip = null;

        if(req.connection.remoteAddress.startsWith("::ffff")){
            ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
        }else{
            ip = req.connection.remoteAddress;
        }

        indexed_summary = parseInt(indexed_summary,10);
        reregistration_athletes = parseInt(reregistration_athletes,10);
        image_profile = parseInt(image_profile,10);
        trophy = parseInt(trophy,10);
        medals = parseInt(medals, 10);
        medals_leaders = parseInt(medals_leaders,10);

        if(max_leaders_teams != null){
            max_leaders_teams = parseInt(max_leaders_teams, 10);
        }

        if(max_age_athletes != null){
            max_age_athletes = parseInt(max_age_athletes, 10);
        }

        if(min_age_athletes != null){
            min_age_athletes = parseInt(min_age_athletes, 10);
        }

        if(max_vacancies != null){
            max_vacancies = parseInt(max_vacancies, 10);
        }

        if(min_rating_medals != null){
            min_rating_medals = parseInt(min_rating_medals, 10);
        }

        db.query("INSERT INTO competitions (name, surname, date_start, date_end, gender, max_athletes_teams, max_leaders_teams, max_age_athletes, min_age_athletes, indexed_summary, registrations, registrations_date_start, registrations_date_end, max_vacancies, reregistrations_athletes, image_profile, trophy, medals, medals_leaders, min_rating_medals, num_trophy, num_medals, status, date_creation, user_creator, ip_creator) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'waiting',NOW(),?,?)", [name, surname, dayjs(date_start).format("YYYY-MM-DD"), dayjs(date_end).format("YYYY-MM-DD"), gender, max_athletes_teams, max_leaders_teams, max_age_athletes, min_age_athletes, indexed_summary, registrations, dayjs(registrations_date_start).format("YYYY-MM-DD"), dayjs(registrations_date_end).format("YYYY-MM-DD"), max_vacancies, reregistration_athletes, image_profile, trophy, medals, medals_leaders, min_rating_medals, num_trophy, num_medals, user,ip],(err, result)=>{
            if(err){
                console.log(err);
                return res.status(500).json({message: "Erro ao cadastrar competição."})
            }

            res.status(200).json({message: "Competição criada com sucesso!"});
        })


    }catch(error){

        console.log(error);
        return res.status(500).json({message: "Erro ao cadastrar competição."})

    }
}

module.exports = {Register}