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

//Função para registrar modalidade.
const Register = (req, res)=>{
    try{
        const {name, type, type_marker, user_creator} = req.body;

        let ip = null;

        if(req.connection.remoteAddress.startsWith("::ffff")){
            ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
        }else{
            ip = req.connection.remoteAddress;
        }

        sql = "INSERT INTO modalities (name, type, type_marker, date_creation, user_creator, ip_creator) VALUES (?,?,?,NOW(),?,?)";

        db.query(sql, [name, type, type_marker, user_creator, ip], (err, result)=>{
            if(err){
                return res.status(500).json({message: "Não foi possível registrar a modalidade."});
            }

            return res.status(200).json({message: "A modalidade foi criada."});
        })

    }catch{
        return res.status(500).json({message: "Não foi possível registrar a modalidade."});
    }
}

//Função para editar a modalidade.
const Update = (req, res)=>{
    try{

        const {name, type, type_marker,id} = req.body;

        db.query("SELECT id FROM modalities WHERE name = ? AND id != ?", [name, id], (err, result)=>{
            if(err){
                return res.status(500).json({message: "Não foi possível editar essa modalidade."});
            }
            if(result.length > 0){
                return res.status(400).json({message: "Já existe uma modalidade com esse nome."});
            }else{
                db.query("UPDATE modalities SET name = ?, type = ?, type_marker = ? WHERE id = ? ",[name, type, type_marker,id], (err, result)=>{
                    if(err){
                        return res.status(500).json({message: "Não foi possível editar essa modalidade."});
                    }
                    return res.status(200).json({message: "A modalidade foi editada."});
                })
            }
        })

    }catch(error){
        return res.status(500).json({message: "Não foi possível editar essa modalidade."})
    }
}

//Função para deletar modalidade.
const Delete = (req, res)=>{
    try{

        const {id} = req.params;

        db.query("DELETE FROM modalities WHERE id = ?",[id],(err, result)=>{
            if(err){
                return res.status(500).json({message: "Não foi possível excluir a modalidade."});
            }
            return res.status(200).json({message: "A modalidade foi excluída."})
        })

    }catch{
        return res.status(500).json({message: "Não foi possível excluir a modalidade."})
    }
}

//Função para selecionas as modalidades.
const Select = (req, res)=>{

    try{

        const {id, name, type, type_marker} = req.query;

        let sql = "SELECT id, name, type,type_marker FROM modalities";
        let queryValues = [];

        if((id != undefined && id != "") || (name != undefined && name != "") || (type != undefined && type != "") || (type_marker != undefined && type_marker != "")){
            sql += " WHERE ";

            if(id != undefined && id != ""){
                sql += "id = ? AND ";
                queryValues.push(id);
            }

            if(type != undefined && type != ""){
                sql += "type = ? AND ";
                queryValues.push(type);
            }

            if(name != undefined && name != ""){
                let aux = `%${name}%`;
                sql += "name LIKE ? AND ";
                queryValues.push(aux);
            }

            

            if(type_marker != undefined && type_marker != ""){
                sql += "type_marker = ? AND ";
                queryValues.push(type_marker);
            }

            
            sql = sql.substring(0, sql.length-4);
        }

        db.query(sql,queryValues,(err, result)=>{
            if(err){
                console.log(err)
                return res.status(500).json({message: "Não foi possível selecionar as modalidades."});
            }

            return res.status(200).json(result);
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({message: "Não foi possível selecionar as modalidades."});
    }

}

module.exports = {Register, Update, Delete, Select}