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

//Função para registrar equipe.
const Register = (req, res)=>{

    try{

        const {name, entity, modality, user_creator} = req.body;

        let ip = null;

        if(req.connection.remoteAddress.startsWith("::ffff")){
            ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
        }else{
            ip = req.connection.remoteAddress;
        }


        db.query("SELECT name FROM modalities WHERE id = ? UNION ALL SELECT name_official AS name FROM entities WHERE id = ?",[modality,entity],(err, result)=>{
            if(err){
                return res.status(500).json({message: "Não foi possível registrar equipe."});
            }
            if(result.length >= 2){
                db.query("INSERT INTO teams(name, entity, modality, date_creation, user_creator, ip_creator) VALUES (?,?,?,NOW(),?,?)",[name, entity, modality,user_creator,ip],(err, result)=>{
                    if(err){
                        return res.status(500).json({message: "Não foi possível registrar equipe."});
                    }
                    return res.status(200).json({message: "A equipe foi cadastrada."})
                })
            }else{
                return res.status(400).json({message: "A modalidade selecionada não existe."});
            }
        })
    
    }catch(error){
        console.log(error)
        return res.status(500).json({message: "Não foi possível registrar equipe."});
    }

}

//Função para deletar equipe
const Delete = (req,res)=>{
    try{

        const {id} = req.params;

        db.query("DELETE FROM teams WHERE id = ?",[id],(err, result)=>{
            if(err){
                return res.status(500).json({message: "Não foi possível deletar a equipe."})
            }
            return res.status(200).json({message: "A equipe foi deletada."})
        })

    }catch(error){
        return res.status(500).json({message: "Não foi possível deletar equipe."});
    }
}

//Função para editar equipe
const Update = (req, res)=>{
    try{
        const {name, entity, modality, id} = req.body;

        db.query("UPDATE teams SET name = ?, entity = ?, modality = ? WHERE id = ?",[name,entity,modality,id],(err, result)=>{
            if(err){
                console.log(err)
                return res.status(500).json({message: "Não foi possível editar a equipe."});
            }

            return res.status(200).json({message: "A equipe foi editada."})
        })
    }catch(error){
        console.log(error)
        return res.status(500).json({message: "Não foi possível editar a equipe."});
    }
    

}

//Função para selecionar todas as informações da equipe
const Select = (req,res)=>{
    try{
        const {id, name, entity, modality, user_id} = req.query;
        let sql = null;
        let queryValues = [];
        if(user_id == undefined){
            sql = "SELECT teams.id AS id,teams.name AS name, teams.entity AS entity_id, entities.name_official AS entity_name, teams.modality AS modality, modalities.name AS modality_name FROM teams INNER JOIN entities ON teams.entity = entities.id INNER JOIN modalities ON teams.modality = modalities.id";
        }else{
            sql = "SELECT teams.id AS id,teams.name AS name, teams.entity AS entity_id, entities.name_official AS entity_name, teams.modality AS modality, modalities.name AS modality_name FROM teams INNER JOIN entities ON teams.entity = entities.id INNER JOIN modalities ON teams.modality = modalities.id INNER JOIN managers_teams ON teams.id = managers_teams.team WHERE managers_teams.user = ?";
            queryValues.push(user_id);
        }
       
        

        if((id != undefined && id != "") || (name != undefined && name != "") || (entity != undefined && entity != "") || (modality != undefined && modality != "")){

            if(user_id == undefined){
                sql += " WHERE ";
            }else{
                sql+= " AND "
            }
            
            if(id != undefined && id != ""){
                sql += `teams.id = ? AND `;
                queryValues.push(id);
            }

            if(name != undefined && name != ""){
                let aux = `%${name}%`;
                sql += `teams.name LIKE ? AND `;
                queryValues.push(aux);
            }

            if(entity != undefined && entity != ""){
                sql += `teams.entity = ? AND `;
                queryValues.push(entity);
            }

            if(modality != undefined && modality != ""){
                sql += `teams.modality = ? AND `;
                queryValues.push(modality);
            }

            sql = sql.substring(0,sql.length-4);

        }
        console.log(sql)

        db.query(sql, queryValues, (err, result)=>{
            if(err){
                console.log(err)
                return res.status(500).json({message: "Não foi possível selecionar as equipes."});
            }
            return res.status(200).json(result);
        })
    }catch(error){
        return res.status(500).json({message: "Não foi possível selecionar as equipes."});
    }
    
}

//Função para selecionar todas as informações da equipe que um determinado atleta participa.
const SelectTeamAthlete = (req,res)=>{
    try{
        const {id, name, entity, modality, user_id} = req.query;
        let sql = null;
        let queryValues = [];
        if(user_id == undefined){
            sql = "SELECT teams.id AS id,teams.name AS name, teams.entity AS entity_id, entities.name_official AS entity_name, teams.modality AS modality, modalities.name AS modality_name FROM teams INNER JOIN entities ON teams.entity = entities.id INNER JOIN modalities ON teams.modality = modalities.id";
        }else{
            sql = "SELECT teams.id AS id,teams.name AS name, teams.entity AS entity_id, entities.name_official AS entity_name, teams.modality AS modality, modalities.name AS modality_name FROM teams INNER JOIN entities ON teams.entity = entities.id INNER JOIN modalities ON teams.modality = modalities.id INNER JOIN teams_athletes ON teams.id = teams_athletes.teams_id WHERE teams_athletes.users_id = ?";
            queryValues.push(user_id);
        }

        if((id != undefined && id != "") || (name != undefined && name != "") || (entity != undefined && entity != "") || (modality != undefined && modality != "")){

            if(user_id == undefined){
                sql += " WHERE ";
            }else{
                sql+= " AND "
            }
            
            if(id != undefined && id != ""){
                sql += `teams.id = ? AND `;
                queryValues.push(id);
            }

            if(name != undefined && name != ""){
                let aux = `%${name}%`;
                sql += `teams.name LIKE ? AND `;
                queryValues.push(aux);
            }

            if(entity != undefined && entity != ""){
                sql += `teams.entity = ? AND `;
                queryValues.push(entity);
            }

            if(modality != undefined && modality != ""){
                sql += `teams.modality = ? AND `;
                queryValues.push(modality);
            }

            sql = sql.substring(0,sql.length-4);

        }
        console.log(sql)

        db.query(sql, queryValues, (err, result)=>{
            if(err){
                console.log(err)
                return res.status(500).json({message: "Não foi possível selecionar as equipes."});
            }
            return res.status(200).json(result);
        })
    }catch(error){
        return res.status(500).json({message: "Não foi possível selecionar as equipes."});
    }
    
}

/* INÍCIO - FUNÇÕES PARA FUNCIONAMENTO DO MULTER (PACOTE RESPONSÁVEL PELO UPLOAD DE ARQUIVOS VIA API) */
const fileFilter = (req, file, cb)=>{
    
    const ext = path.extname(file.originalname);
    
    if((".jpg,.png,.jpeg").includes(ext)){
        cb(null, true);
    }else{
        console.log(`📷 -> Entity ${req.query.teams} tried to upload image profile in the wrong format. <- ❗`)
        cb(null, false);
    }

    
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/teams-shields') // Pasta onde os uploads serão armazenados
    },
    filename: function (req, file, cb) {
        if(req.query != undefined){
            const ext = path.extname(file.originalname);
            console.log(`📷 -> Entity ${req.query.teams} uploaded shield. <- ✔`)
            cb(null, new Date().toISOString() + "img" + req.query.teams + ext);
        }else{
            
            cb(new Error('Nenhum documento para upload.'))
        }
      
    },
    
});

const multerUpload = multer({storage:storage, fileFilter: fileFilter});

/* FIM - FUNÇÕES PARA FUNCIONAMENTO DO MULTER (PACOTE RESPONSÁVEL PELO UPLOAD DE ARQUIVOS VIA API) */

//Fazendo o upload do escudo
const UploadImageShield = (req, res) =>{
    if(!req.file){
        return res.status(400).json({message: "Nenhum arquivo foi enviado."})
    }else{
        return res.status(200).json(req.file);
    }
}

//Salvando o upload do escudo no banco de dados.
const SaveImageShield = (req, res)=>{

    const {team, file} = req.body;

    let ip = null;

    if(req.connection.remoteAddress.startsWith("::ffff")){
        ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
    }else{
        ip = req.connection.remoteAddress;
    }
    
    try{
        if(file != undefined && file != null){
            db.query("SELECT image FROM team WHERE id = ?",[team],(err, result1)=>{
                if(result1.length > 0 ){
                    db.query("UPDATE team SET image = ?, status_image = 'waiting', status_description = NULL, image_send_date = NOW() WHERE id = ?",[file,team],(err, result)=>{
                        if(err){
                            console.log(err)
                            return res.status(500).json({message: "Upload de imagem não concluído."});
                        }
                        if(result1[0].image != null){
                            fs.unlink(path.join(__dirname,"..","public","teams-shields",result1[0].image),(err)=>{});
                        }
                        return res.status(200).json({message: "O upload da imagem foi realizado."});
                    });
                }else{
                    db.query("UPDATE team SET image = ?, status_image = 'waiting', status_description = NULL, image_send_date = NOW() WHERE id = ?",[file,team],(err, result)=>{
                        if(err){
                            console.log(err)
                            return res.status(500).json({message: "Upload de imagem não concluído."});
                        }
                        return res.status(200).json({message: "O upload da imagem foi realizado."});
                    });
                }
            })
        }
    }catch(error){
        return res.status(400).json({message: "Nenhum documento selecionado para upload."})
    }
}

//Adiconar atletas
const AddAthletes = (req, res)=>{
    try{
        
        const {user_creator, athletes, team} = req.body;

        if(req.connection.remoteAddress.startsWith("::ffff")){
            ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
        }else{
            ip = req.connection.remoteAddress;
        }

        let status = [];

        if(athletes == undefined || athletes.length == 0){
            return res.status(400).json({message: "Nenhum atleta enviado para cadastro."});
        }

        athletes.forEach((athlete)=>{
            db.query("SELECT users.id AS users_id, access_group_permissions_users.id AS group_id FROM users INNER JOIN access_group_permissions_users ON users.id = access_group_permissions_users.user_id WHERE users.id = ? AND access_group_permissions_users.access_group_id = 34", [athlete],(err, result)=>{
                if(err){
                    status.push({
                        athlete: athlete,
                        status: "no"
                    })
                }else{
                    if(result.length == 0){
                        status.push({
                            athlete: athlete,
                            status: "no"
                        })
                    }else{
                        db.query("INSERT INTO teams_athletes(users_id, teams_id, status, date_creation, user_creation, ip_creation) VALUES (?,?,'active',NOW(),?,?)",[athlete, team, user_creator,ip],(err, result)=>{
                            if(err){
                                status.push({
                                    athlete: athlete,
                                    status: "no"
                                })
                            }else{
                                status.push({
                                    athlete: athlete,
                                    status: "yes"
                                })
                            }
                        })
                    }
                }
            })
        })

        return res.status(200).json({message: "Atletas cadastrados com sucesso!"});

    }catch(error){
        return res.status(500).json({message: "Não foi possível adicionar atletas na equipe."})
    }
}

//Alterar status de atletas
const ChangeStatusAthletes = (req, res)=>{
    try{
        const {athlete, status} = req.body;

        if(athlete == undefined || athlete == "" || status == undefined || status == ""){
            return res.status(500).json({message: "Não foi possível alterar status do atleta da equipe, falta de informações."})
        }

        db.query("UPDATE teams_athletes SET status = ? WHERE id = ?",[status, athlete], (err, result)=>{
            if(err){
                return res.status(500).json({message: "Não foi possível alterar status do atleta."})
            }
            return res.status(200).json({message: "O status do atleta na equipe foi alterado."})
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({message: "Não foi possível alterar status do atleta da equipe."})
    }
}

//Definir gerentes de equipe
const setManager = (req, res)=>{
    try{

        let {managers, team, user} = req.body;
        let ip = null;

        if(req.connection.remoteAddress.startsWith("::ffff")){
            ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
        }else{
            ip = req.connection.remoteAddress;
        }

        db.query("SELECT id FROM teams WHERE id = ?",[team],(err, result)=>{
            if(result.length > 0){

                db.query("SELECT * FROM managers_teams WHERE team = ?", [team],(err, result)=>{
                    let managersEntities = result;
                    if(managers == null || managers == undefined){
                        managers = [];
                    }

                    managers.forEach((manager)=>{
                        let aux = managersEntities.find((m)=> m.user == manager);
                        if(aux == null || aux == undefined){
                            db.query("INSERT INTO managers_teams(user, team, date_creation, status, user_creation, ip_creation) VALUES (?,?,NOW(),'active',?,?)",[manager, team, user, ip],(err, result=>{
                                if(err){
                                    console.log(err);
                                }
                            }))
                        }
                    })

                    managersEntities.forEach((manager)=>{
                        let aux = managers.find((m)=> m == manager.user);
                        if(aux == null || aux == undefined){
                            db.query("DELETE FROM managers_teams WHERE user = ? AND team = ?",[manager.user, team],(err, result=>{
                                if(err){
                                    console.log(err);
                                }
                            }))
                        }
                    })
                })

                return res.status(200).json({message: "Os gerentes da equipe foram definidos."});
            }else{
                return res.status(400).json({message: "Nenhuma equipe encontrada com o id passado."})
            }
        })

    }catch(error){
        return res.status(500).json({message: "Não foi possível realizar a alteração de gerentes de equipe."})
    }

}

const setAthlete = (req, res)=>{
    try{

        let {managers, team, user} = req.body;
        console.log(managers)
        let ip = null;

        if(req.connection.remoteAddress.startsWith("::ffff")){
            ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
        }else{
            ip = req.connection.remoteAddress;
        }

        db.query("SELECT id FROM teams WHERE id = ?",[team],(err, result)=>{
            if(result.length > 0){

                db.query("SELECT * FROM teams_athletes WHERE teams_id = ?", [team],(err, result)=>{
                    let managersEntities = result;
                    if(managers == null || managers == undefined){
                        managers = [];
                    }

                    managers.forEach((manager)=>{
                        let aux = managersEntities.find((m)=> m.users_id == manager);
                        if(aux == null || aux == undefined){
                            db.query("INSERT INTO teams_athletes(users_id, teams_id, date_creation, status, user_creation, ip_creation) VALUES (?,?,NOW(),'active',?,?)",[manager, team, user, ip],(err, result=>{
                                if(err){
                                    console.log(err);
                                }
                            }))
                        }
                    })

                    managersEntities.forEach((manager)=>{
                        let aux = managers.find((m)=> `${m}` == manager.users_id);
                        console.log(aux)
                        if(aux == null || aux == undefined){
                            db.query("DELETE FROM teams_athletes WHERE users_id = ? AND teams_id = ?",[manager.users_id, team],(err, result=>{
                                if(err){
                                    console.log(err);
                                }
                            }))
                        }
                    })
                })

                return res.status(200).json({message: "Os atletas da equipe foram definidos."});
            }else{
                return res.status(400).json({message: "Nenhuma equipe encontrada com o id passado."})
            }
        })

    }catch(error){
        return res.status(500).json({message: "Não foi possível realizar a alteração de atletas da equipe."})
    }

}

const getManagers = (req, res)=>{
    try{

        const {team} = req.params;

        db.query("SELECT user AS id FROM managers_teams WHERE team = ?", [team], (err,result)=>{
            if(err){
                return res.status(500).json({message: "Não foi possível localizar os gerentes da equipe."});
            }
            return res.status(200).json(result)
        })

    }catch(error){
        return res.status(500).json({message: "Não foi possível localizar os gerentes da equipe."});
    }
}

const getAthletes = (req, res)=>{
    try{

        const {team} = req.params;

        db.query("SELECT teams_athletes.id, teams_athletes.users_id, users.name, teams_athletes.teams_id, teams_athletes.status FROM teams_athletes INNER JOIN users ON users.id = teams_athletes.users_id WHERE teams_id = ?", [team], (err,result)=>{
            if(err){
                console.log(err);
                return res.status(500).json({message: "Não foi possível localizar os gerentes da equipe."});
            }
            return res.status(200).json(result)
        })

    }catch(error){
        console.log(error);
        return res.status(500).json({message: "Não foi possível localizar os gerentes da equipe."});
    }
}

module.exports = {Register, Delete, Update, Select, multerUpload, SaveImageShield, UploadImageShield, ChangeStatusAthletes, AddAthletes, setManager, getManagers, getAthletes, setAthlete, SelectTeamAthlete}