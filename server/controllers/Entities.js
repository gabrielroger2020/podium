const db = require("../database/db");
const bcrypt = require("bcrypt");
const mailPreDef = require("../mail/mailPreDef");
const dayjs = require("dayjs");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const jwt = require("jsonwebtoken");
const googlemaps = require("@google/maps");
const gmaps = googlemaps.createClient({key: "AIzaSyAja-y8xoOUm11dpr7Z2yXDaYM2-XTPZDs", Promise: Promise});
const auth = require("../config/auth.json");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

//Função para registrar uma nova categoria de entidades.
const RegisterCategory = (req, res)=>{

    const {name, user_creator} = req.body;

    let ip = null;

    if(req.connection.remoteAddress.startsWith("::ffff")){
        ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
    }else{
        ip = req.connection.remoteAddress;
    }

    try{

        db.query("SELECT id FROM entities_categories WHERE name = ?", [name], (err,result)=>{
            if(err){
                return res.status(500).json({message: "O cadastro da categoria de entidade não foi realizado."});
            }
            if(result.length > 0){
                return res.status(400).json({message: "O cadastro da categoria de entidade não foi realizado, pois já existe uma categoria criada com esse nome."});
            }else{
                db.query("INSERT INTO entities_categories(name, date_creation, user_creator, ip_creator) VALUES (?,NOW(),?,?)",[name, user_creator, ip],(err, result)=>{
                    if(err){
                        return res.status(500).json({message: "O cadastro da categoria de entidade não foi realizado."});
                    }
                    return res.status(200).json({message: "O cadastro da categoria de entidade foi realizado."})
                })
            }
        })

        
    }catch(error){
        return res.status(500).json({message: "O cadastro da categoria de entidade não foi realizado."});
    }
}

//Rota para selecionar todas as categorias cadastradas.
const SelectCategories = (req, res)=>{
    try{
        db.query("SELECT id, name FROM entities_categories", (err, result)=>{
            if(err){
                return res.status(500).json({message: "Não foi possível selecionar todas as categorias de entidades."});
            }
            return res.status(200).json(result);
        })
    }catch{
        return res.status(500).json({message: "Não foi possível selecionar todas as categorias de entidades."});
    }
}

//Rota para selecionar categorias especificas.
const SelectCategory = (req, res)=>{
    try{
        const {id} = req.params;
        db.query("SELECT id, name FROM entities_categories WHERE id = ?", id, (err, result)=>{
            if(err){
                return res.status(500).json({message: "Não foi possível selecionar categoria de entidades."});
            }
            return res.status(200).json(result);
        })
    }catch{
        return res.status(500).json({message: "Não foi possível selecionar categoria de entidades."});
    }
}

//Rota para deletar categoria.
const DeleteCategory = (req,res)=>{
    const {id} = req.params;

    try{
        db.query("DELETE FROM entities_categories WHERE id = ?", [id], (err, result)=>{
            if(err){
                return res.status(500).json({message: "Não foi possível deletar as categoria de entidades."});
            }
            return res.status(200).json({message: "A categoria de entidade foi apagada."});
        })
    }catch(error){
        return res.status(500).json({message: "Não foi possível deletar as categoria de entidades."});
    }
}

//Rota para editar categoria.
const EditCategory = (req, res)=>{

    const {id , name} = req.body;

    try{

        db.query("SELECT id FROM entities_categories WHERE name = ? AND id != ?", [name, id], (err,result)=>{
            if(err){
                return res.status(500).json({message: "A edição da categoria de entidade não foi realizada."});
            }
            if(result.length > 0){
                return res.status(400).json({message: "A edição da categoria de entidade não foi realizada, pois já existe uma categoria criada com esse nome."});
            }else{
                db.query("UPDATE entities_categories SET name = ? WHERE id = ?",[name, id],(err, result)=>{
                    if(err){
                        return res.status(500).json({message: "A edição da categoria de entidade não foi realizada."});
                    }
                    return res.status(200).json({message: "A edição da categoria de entidade foi realizada."})
                })
            }
        })

        
    }catch(error){
        return res.status(500).json({message: "A edição da categoria de entidade não foi realizada."});
    }
}

//Rota para criar entidade.
const Register = (req, res)=>{
    let {nature, cnpj, inep_code, name_official, name_popular, category, abbreviation, email, site, cep, country, state, city, address, address_number, address_complement, date_foundation, history, user_creator} = req.body;
    date_foundation = dayjs(date_foundation).format("YYYY-MM-DD");

    if(cnpj != null && cnpj != ""){
        cnpj = cnpj.replaceAll(".","");
        cnpj = cnpj.replaceAll("/","");
        cnpj = cnpj.replaceAll("-","");
    }

    let ip = null;

    if(req.connection.remoteAddress.startsWith("::ffff")){
        ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
    }else{
        ip = req.connection.remoteAddress;
    }

    try{
        db.query("SELECT id FROM entities_categories WHERE id = ?", [category],(err, result)=>{
            if(err){
                return res.status(500).json({message: "Cadastro de entidade não realizado."});
            }
            if(result.length > 0){
                let addressAux = `${address}, ${address_number}, ${city} - ${state} (${cep})`;
                gmaps.geocode({address: addressAux}).asPromise().then((response)=>{
                    addressGeoCode = response.json.results[0].geometry.location.lat + "," + response.json.results[0].geometry.location.lng;
                    db.query("INSERT INTO entities (nature, cnpj, inep_code, name_official, name_popular, category, abbreviation, email, site, cep, country, state, city, address, address_number, address_complement, geolocation, date_foundation, history, date_creation, user_creator, ip_config) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),?,?)",[nature, cnpj, inep_code, name_official, name_popular, category, abbreviation, email, site, cep, country, state, city, address, address_number, address_complement, addressGeoCode, date_foundation, history, user_creator, ip], (error, result)=>{
                        if(error){
                            console.log(error)
                            return res.status(500).json({message: "Não foi possível realizar o cadastro da entidade."})
                        }
                        return res.status(200).json({message: "Entidade cadastrada com sucesso."})
                    })

                }).catch((error)=>{
                    return res.status(500).json({message: "Não foi possível realizar o cadastro da entidade."})
                });
                

            }else{
                return res.status(400).json({message: "A categoria informada não existe."})
            }
        })

        

    }catch(error){
        console.log(error)
        return res.status(500).json({message: "Cadastro de entidade não realizado."})
    }
}

//Rota para pegar todas as informações de uma entidade.
const GetEntities = (req, res)=>{

    try{

        const {id, name, abbreviation, category, nature, user_id} = req.query;

        let sql = "SELECT entities.id, entities.nature, entities.cnpj, entities.inep_code, entities.name_official, entities.name_popular, entities.category, entities_categories.name AS category_name, entities.abbreviation, entities.email, entities.site, entities.cep, entities.country, entities.state, entities.city, entities.address, entities.address_number, entities.address_complement, entities.geolocation, entities.date_foundation, entities.history FROM entities INNER JOIN entities_categories ON entities.category = entities_categories.id";
        let queryValues = [];

        if((id != undefined && id != "") || (name != undefined && name != "") || (abbreviation != undefined && abbreviation != "") || (category != undefined && category != "") || (nature != undefined && nature != "")){

            if(user_id != undefined && user_id != ""){
                sql = "SELECT entities.id, entities.nature, entities.cnpj, entities.inep_code, entities.name_official, entities.name_popular, entities.category, entities_categories.name AS category_name, entities.abbreviation, entities.email, entities.site, entities.cep, entities.country, entities.state, entities.city, entities.address, entities.address_number, entities.address_complement, entities.geolocation, entities.date_foundation, entities.history FROM entities INNER JOIN entities_categories ON entities.category = entities_categories.id INNER JOIN managers_entities ON managers_entities.entity = entities.id INNER JOIN users ON users.id = managers_entities.user WHERE users.id = ? AND ";
                queryValues.push(user_id);
            }else{
                sql += " WHERE ";
            }

            

            if(id != undefined && id != ""){
                sql += "entities.id = ? AND ";
                queryValues.push(id);
            }

            if(name != undefined && name != ""){
                sql += "entities.name_official LIKE ? AND ";
                queryValues.push("%"+name+"%");
            }

            if(abbreviation != undefined && abbreviation != ""){
                sql += "entities.abbreviation LIKE ? AND ";
                queryValues.push("%"+abbreviation+"%");
            }

            if(category != undefined && category != ""){
                sql += "entities.category = ? AND ";
                queryValues.push(category);
            }

            if(nature != undefined && nature != ""){
                sql += "entities.nature = ? AND ";
                queryValues.push(nature);
            }

            sql = sql.substring(0, sql.length-4)

        }

        db.query(sql, queryValues, (err, result)=>{
            if(err){
                console.log(err)
                return res.status(500).json({message: "Não foi possível selecionar as entidades"});
            }
            if(result.length == 0){
                return res.status(400).json([{message: "Nenhuma entidade encontrada."}]);
            }else{
                return res.status(200).json(result);
            }
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({message: "Não foi possível selecionar as entidades"});
    }
    
}

//Rota para deletar informações de uma entidade.
const Delete = (req, res)=>{
    try{

        const {id} = req.params;

        db.query("SELECT id FROM managers_entities WHERE entity = ? UNION ALL SELECT id FROM teams WHERE entity = ?",[id,id],(err, result)=>{
            if(err){
                return(res.status(500).json({message: "Não foi possível excluir entidade."}));
            }

            db.query("DELETE FROM entities WHERE id = ?",[id],(err, result)=>{
                if(err){
                    console.log(err)
                    return(res.status(500).json({message: "Não foi possível excluir entidade."}))
                }
                return res.status(200).json({message: "A entidade foi excluída."})
            })
        })

    }catch(error){
        
        return res.status(500).json({message: "Não foi possível excluir entidade."})
    }
}

//Rota para criar entidade.
const Update = (req, res)=>{
    let {id, nature, cnpj, inep_code, name_official, name_popular, category, abbreviation, email, site, cep, country, state, city, address, address_number, address_complement, date_foundation, history, user_creator} = req.body;
    date_foundation = dayjs(date_foundation).format("YYYY-MM-DD");

    if(cnpj != null && cnpj != ""){
        cnpj = cnpj.replaceAll(".","");
        cnpj = cnpj.replaceAll("/","");
        cnpj = cnpj.replaceAll("-","");
    }

    let ip = null;

    if(req.connection.remoteAddress.startsWith("::ffff")){
        ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
    }else{
        ip = req.connection.remoteAddress;
    }

    try{
        db.query("SELECT id FROM entities_categories WHERE id = ?", [category],(err, result)=>{
            if(err){
                return res.status(500).json({message: "Edição de entidade não realizado."});
            }
            if(result.length > 0){
                let addressAux = `${address}, ${address_number}, ${city} - ${state} (${cep})`;
                gmaps.geocode({address: addressAux}).asPromise().then((response)=>{
                    addressGeoCode = response.json.results[0].geometry.location.lat + "," + response.json.results[0].geometry.location.lng;
                    db.query("UPDATE entities SET nature = ?, cnpj = ?, inep_code = ?, name_official = ?, name_popular = ?, category = ?, abbreviation = ?, email = ?, site = ?, cep = ?, country = ?, state = ?, city = ?, address = ?, address_number = ?, address_complement = ?, geolocation = ?, date_foundation = ?, history = ? WHERE id = ?",[nature, cnpj, inep_code, name_official, name_popular, category, abbreviation, email, site, cep, country, state, city, address, address_number, address_complement, addressGeoCode, date_foundation, history, id], (error, result)=>{
                        if(error){
                            console.log(error)
                            return res.status(500).json({message: "Não foi possível realizar a edição da entidade."})
                        }
                        return res.status(200).json({message: "Entidade editada com sucesso."})
                    })

                }).catch((error)=>{
                    return res.status(500).json({message: "Não foi possível realizar a edição da entidade."})
                });
                

            }else{
                return res.status(400).json({message: "A categoria indicada não existe."})
            }
        })

        

    }catch(error){
        console.log(error)
        return res.status(500).json({message: "Edição de entidade não realizada."})
    }
}

const Managers = (req, res)=>{

    try{

        let {managers, entity, user} = req.body;
        let ip = null;

        if(req.connection.remoteAddress.startsWith("::ffff")){
            ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
        }else{
            ip = req.connection.remoteAddress;
        }

        db.query("SELECT id FROM entities WHERE id = ?",[entity],(err, result)=>{
            if(result.length > 0){

                db.query("SELECT * FROM managers_entities WHERE entity = ?", [entity],(err, result)=>{
                    let managersEntities = result;
                    if(managers == null || managers == undefined){
                        managers = [];
                    }

                    managers.forEach((manager)=>{
                        let aux = managersEntities.find((m)=> m.user == manager);
                        if(aux == null){
                            db.query("INSERT INTO managers_entities(user, entity, date_creation, user_creation, ip_creation) VALUES (?,?,NOW(),?,?)",[manager, entity, user, ip],(err, result=>{
                                if(err){
                                    console.log(err);
                                }
                            }))
                        }
                    })

                    managersEntities.forEach((manager)=>{
                        let aux = managers.find((m)=> m == manager.user);
                        if(aux == null){
                            db.query("DELETE FROM managers_entities WHERE user = ? AND entity = ?",[manager.user, entity],(err, result=>{
                                if(err){
                                    console.log(err);
                                }
                            }))
                        }
                    })
                })

                return res.status(200).json({message: "Os gerentes de entidades foram definidos."});
            }else{
                return res.status(400).json({message: "Nenhuma entidade encontrada com o id passado."})
            }
        })

    }catch(error){
        return res.status(500).json({message: "Não foi possível realizar a alteração de gerentes de entidade."})
    }

}

const getManagers = (req, res)=>{
    try{

        const {entity} = req.params;

        db.query("SELECT user AS id FROM managers_entities WHERE entity = ?", [entity], (err,result)=>{
            if(err){
                return res.status(500).json({message: "Não foi possível localizar os gerentes de entidades."});
            }
            return res.status(200).json(result)
        })

    }catch(error){
        return res.status(500).json({message: "Não foi possível localizar os gerentes de entidades."});
    }
}

/* INÍCIO - FUNÇÕES PARA FUNCIONAMENTO DO MULTER (PACOTE RESPONSÁVEL PELO UPLOAD DE ARQUIVOS VIA API) */
const fileFilter = (req, file, cb)=>{
    
    const ext = path.extname(file.originalname);
    
    if((".jpg,.png,.jpeg").includes(ext)){
        cb(null, true);
    }else{
        console.log(`📷 -> Entity ${req.query.entity} tried to upload image profile in the wrong format. <- ❗`)
        cb(null, false);
    }

    
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/entity-shields') // Pasta onde os uploads serão armazenados
    },
    filename: function (req, file, cb) {
        if(req.query != undefined){
            const ext = path.extname(file.originalname);
            console.log(`📷 -> Entity ${req.query.entity} uploaded shield. <- ✔`)
            cb(null, new Date().toISOString() + "img" + req.query.entity + ext);
        }else{
            
            cb(new Error('Nenhum documento para upload.'))
        }
      
    },
    
});

const multerUpload = multer({storage:storage, fileFilter: fileFilter});

/* FIM - FUNÇÕES PARA FUNCIONAMENTO DO MULTER (PACOTE RESPONSÁVEL PELO UPLOAD DE ARQUIVOS VIA API) */

const UploadImageShield = (req, res) =>{
    if(!req.file){
        return res.status(400).json({message: "Nenhum arquivo foi enviado."})
    }else{
        return res.status(200).json(req.file);
    }
}

const SaveImageShield = (req, res)=>{

    const {user, entity, file} = req.body;

    let ip = null;

    if(req.connection.remoteAddress.startsWith("::ffff")){
        ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
    }else{
        ip = req.connection.remoteAddress;
    }
    
    try{
        if(file != undefined && file != null){
            db.query("SELECT image FROM entities WHERE id = ?",[entity],(err, result1)=>{
                if(result1.length > 0 ){
                    db.query("UPDATE entities SET image = ?, status_image = 'waiting', status_description = NULL WHERE id = ?",[file,entity],(err, result)=>{
                        if(err){
                            console.log(err)
                            return res.status(500).json({message: "Upload de imagem não concluído."});
                        }
                        if(result1[0].image != null){
                            fs.unlink(path.join(__dirname,"..","public","entity-shields",result1[0].image),(err)=>{});
                        }
                        return res.status(200).json({message: "O upload da imagem foi realizado."});
                    });
                }else{
                    db.query("UPDATE entities SET image = ?, status_image = 'waiting', status_description = NULL WHERE id = ?",[file,entity],(err, result)=>{
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

const GetEntityShield = (req, res)=>{
    try{

        const {entity} = req.params;

        let sql = "SELECT image, status_image, status_description FROM entities WHERE id = ?";

        db.query(sql,[entity],(err, result)=>{
            if(err){
                return res.status(500).json({message: "Erro ao obter escudo da entidade."});
            }
            if(result.length > 0){
                return res.status(200).json(result[0]);
            }else{
                return res.status(200).json(null);
            }
        })


    }catch{
        return res.status(500).json({message: "Erro ao obter escudo da entidade."});
    }
}


module.exports = {RegisterCategory, SelectCategories, DeleteCategory, EditCategory, SelectCategory, Register, GetEntities, Delete, Update, Managers, getManagers, SaveImageShield, UploadImageShield, GetEntityShield, multerUpload};