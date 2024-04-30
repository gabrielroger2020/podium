const db = require("../database/db");
const bcrypt = require("bcrypt");
const mailPreDef = require("../mail/mailPreDef");
const dayjs = require("dayjs");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const jwt = require("jsonwebtoken");
const auth = require("../config/auth.json");


//Função para selecionar todas as imagens de perfil de todos os usuários
const GetProfileImages = (req, res)=>{
    try{
        const {user, name, pcd, status, date_order, alphabetical_order} = req.query;
        let sql = "SELECT img.id AS img_id, img.path AS img_path, img.status AS img_status, img.status_description AS img_status_description, img.date_creation AS img_date_creation, user.id AS user_id, user.name AS user_name, user.gender AS user_gender, user.pcd AS user_pcd, user.email AS user_email FROM image_profile img inner join users user ON img.user_id = user.id ";
        
        if((user != undefined && user != "") || (name != undefined && name != "") || (pcd != undefined && pcd != "") || (status != undefined && status != "")){
            
           

            sql += " WHERE ";

            if(user != undefined && user != ""){
                sql += `user.id = ${user} AND `
            }

            if(name != undefined && name != ""){
                sql += `user.name LIKE '%${name}%' AND `
            }

            if(pcd != undefined && pcd != ""){
                sql += `user.pcd = '${pcd}' AND `
            }

            if(status != undefined && status != ""){
                sql += `img.status = '${status}' AND `
            }

            sql = sql.substring(0, sql.length-4);
        }
        

        if((date_order != undefined && date_order != "") || (alphabetical_order != undefined && alphabetical_order != "")){
            if(alphabetical_order == "yes"){
                sql += "ORDER BY user_name";
            }
            if((date_order != undefined && date_order != "")){
                if(date_order == "old"){
                    sql += "ORDER BY img_date_creation ASC";
                }else{
                    sql += "ORDER BY img_date_creation DESC";
                }
                
            }
        }else{
            sql += "ORDER BY user_name";
            
        }

        db.query(sql,(err, result)=>{
            if(err){
                return res.status(500).json({message: "Não foi possível selecionar as imagens de perfil."})
            }

            return res.status(200).json(result);
        })
    }catch(error){
        return res.status(500).json({message: "Não foi possível selecionar as imagens de perfil."})
    }
}

const ChangeStatus = (req, res)=>{
    try{
        const {status, description} = req.query;
        const {user, img} = req.body;
        
        if((img != undefined && img != "") && (status != undefined && status != "") && (user != undefined)){
            let sql = "";
            let queryValues = [];

            if(description != undefined && description.length > 0){
                sql = "UPDATE image_profile SET status = ?, status_description = ?, user_status = ? WHERE id = ?";
                queryValues.push(status);
                queryValues.push(description);
                queryValues.push(user);
                queryValues.push(img);
            }else{
                sql = "UPDATE image_profile SET status = ?, user_status = ? WHERE id = ?";
                queryValues.push(status);
                queryValues.push(user);
                queryValues.push(img);
            }

            
            db.query(sql, queryValues, (err, result)=>{
                if(err){
                    return res.status(500).json({message: "Não foi possível alterar o status da imagem de perfil."});
                }
                return res.status(200).json({message: "O status da imagem de perfil foi alterado."});
            });
        }else{
            
            return res.status(500).json({message: "Não foi possível alterar o status da imagem de perfil."});
        }

    }catch(error){
        console.log(error)
        return res.status(500).json({message: "Não foi possível alterar o status da imagem de perfil."});
    }
}


module.exports = {GetProfileImages, ChangeStatus};