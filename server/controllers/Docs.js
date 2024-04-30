const db = require("../database/db");
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


// Cadastro de uma nova definição de documento.
const Register = (req, res) => {
    try{
       const {name, description, validity, validity_type, user_creator} = req.body;
       let type = req.body["type[]"];

       let example_link = req.body.example_link;
       if(example_link == ""){
            example_link = null;
       }
       
       let ip = null;

        if(req.connection.remoteAddress.startsWith("::ffff")){
            ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
        }else{
            ip = req.connection.remoteAddress;
        }

        db.query("SELECT id FROM users_docs WHERE name = ?",[name],(err,result)=>{
            if(result.length > 0){
                return res.status(400).json({message: "Já existe um documento criado com esse nome!"});
            }else{
                db.query("INSERT INTO users_docs(name, type, description, validity, validity_type, example_link, user_creator, date_creation, ip_creator) VALUES (?,?,?,?,?,?,?,NOW(),?)",[name, type.toString(),description,validity,validity_type,example_link,user_creator,ip],(err, result)=>{
                    if(err){
                        console.log(err)
                        return res.status(500).json({message: "Não foi possível criar o documento."});
                    }
        
                    return res.status(200).json({message: "O documento foi criado."})
                });
            }
        })

        

    }catch(error){
        return res.status(500).json({message: "Não foi possível criar o documento."});
    }
}

//Edita a definição de um documento.
const Update = (req, res) => {
    try{
        
        const {name,id} = req.body;

        db.query("SELECT id FROM users_docs WHERE name = ? AND id != ?",[name,id],(err,result)=>{
            if(result.length > 0){
                return res.status(400).json({message: "Já existe um documento criado com esse nome!"});
            }else{
                db.query("UPDATE users_docs SET name = ?, type = ?, description = ?, validity = ?, validity_type = ?, example_link = ?, date_alter=NOW() WHERE id = ?",[name, type.toString(),description,validity,validity_type, example_link ,id],(err, result)=>{
                    if(err){
                        console.log(err)
                        return res.status(500).json({message: "Não foi possível editar o documento."});
                    }
        
                    return res.status(200).json({message: "O documento foi editado."})
                });
            }
        })

        

    }catch(error){
        return res.status(500).json({message: "Não foi possível editar o documento."});
    }
}

//Deleta a definição de um documento.
const Delete = (req, res)=>{
    try{
        const {id} = req.params;
        db.query("DELETE FROM users_docs WHERE id = ?",[id],(err, result)=>{
            if(err){
                return res.status(500).json({message: "Não foi possível deletar o documento."});
            }
            return res.status(200).json({message: "O documento foi deletado."});
        })
    }catch(error){
        return res.status(500).json({message: "Não foi possível deletar o documento."});
    }
}

//Selecionar todos os documentos.
const GetDocs = (req, res) => {
    try{
        let {doc, name, description, validity_type, example_link, date_creation_ini, date_creation_end, date_alter_ini, date_alter_end} = req.query;

        if(doc != undefined){
            db.query("SELECT id, name, description, type, validity, validity_type,example_link, date_creation FROM users_docs WHERE id = ?",[doc],(err, result)=>{
                if(err){
                    return res.status(500).json({message: "Não foi possível selecionar todos os documentos."});
                }
    
                let aux = [];
    
                if(result.length > 0){
                    result.forEach((element)=>{
                        let validity_type = "";
                        if(element.validity_type == "days"){
                            validity_type = "Dias";
                        }
    
                        if(element.validity_type == "months"){
                            validity_type = "Meses";
                        }
    
                        if(element.validity_type == "years"){
                            validity_type = "Anos";
                        }
                        aux.push({id: element.id, name: element.name, description: element.description, type: element.type, validity: element.validity, validity_type: validity_type,example_link: element.example_link, date_creation: dayjs(element.date_creation).format("DD/MM/YYYY")})
                    })
                }
    
                return res.status(200).json(aux[0]);
            })
        }else{
            let sql = "SELECT id, name, description, type, validity, validity_type, example_link, date_creation FROM users_docs";
            let valuesSql = [];
           
        if(doc != undefined || name != undefined || description != undefined || validity_type != undefined || example_link != undefined || date_creation_ini != undefined || date_creation_end != undefined || date_alter_ini != undefined || date_alter_end != undefined){
            
            sql += " WHERE ";

            if(name != undefined){
                name= `%${name}%`
                sql += "name LIKE ? AND ";
                valuesSql.push(name);
            }

            if(description != undefined){
                description = `%${description}%`
                sql += "description LIKE ? AND ";
                valuesSql.push(description);
            }

            if(validity_type != undefined){
                sql += "validity_type = ? AND ";
                valuesSql.push(validity_type);
            }

            if(example_link != undefined){
                if(example_link == "no"){
                    sql += "example_link IS NULL OR example_link = '' AND ";
                }else{
                    sql += "example_link IS NOT NULL AND example_link != '' AND ";
                }
                
            }

            if(date_creation_ini != undefined && date_creation_end != undefined){
                sql += "date_creation >= ? AND date_creation <= ? AND ";
                valuesSql.push(date_creation_ini);
                valuesSql.push(date_creation_end);
            }

            if(date_alter_ini != undefined && date_alter_end != undefined){
                sql += "date_alter >= ? AND date_alter <= ? AND ";
                valuesSql.push(date_alter_ini);
                valuesSql.push(date_alter_end);
            }

            sql = sql.substring(0,(sql.length)-4);

        }

        db.query(sql, valuesSql,(err, result)=>{
            if(err){
                console.log(err)
                return res.status(500).json({message: "Não foi possível selecionar todos os documentos."});
            }

            let aux = [];

            if(result.length > 0){
                result.forEach((element)=>{
                    let validity_type = "";
                    if(element.validity_type == "days"){
                        validity_type = "Dias";
                    }

                    if(element.validity_type == "months"){
                        validity_type = "Meses";
                    }

                    if(element.validity_type == "years"){
                        validity_type = "Anos";
                    }
                    aux.push({id: element.id, name: element.name, description: element.description, type: element.type, validity: element.validity, validity_type: validity_type,example_link: element.example_link, date_creation: dayjs(element.date_creation).format("DD/MM/YYYY")})
                })
            }

            return res.status(200).json(aux);
        });
        }

        

    }catch(error){
        return res.status(500).json({message: "Não foi possível selecionar todos os documentos."});
    }
}

//Selecionar todos os documentos já enviados
const GetDocsUsers = (req, res)=>{
    try{

        const {user_id,user, doc, status, date_creation, alphabetical_order} = req.query;

        let sql = "SELECT archive.id AS archive_id,archive.date_creation AS archive_date_creation, doc.id AS doc_id,doc.example_link AS doc_example_link,doc.name AS doc_name,doc.description AS doc_description, user.id AS user_id, user.name AS user_name, archive.doc_path AS archive_doc_path,archive.status AS archive_status, archive.status_description AS archive_status_description FROM users_docs_users AS archive INNER JOIN users AS user ON archive.user_id = user.id INNER JOIN users_docs AS doc ON doc.id = archive.doc_id ";

        if((user_id != undefined && user_id != "") || (user != undefined && user != "") || (doc != undefined && doc != "") || (status != undefined && status != "")){
            sql += "WHERE ";

            if(user_id != undefined && user_id != ""){
                sql += `user.id = ${user_id} AND `;
            }

            if(user != undefined && user != ""){
                sql += `user.name LIKE "%${user}%" AND `;
            }

            if(doc != undefined && doc != ""){
                sql += `doc.id = ${doc} AND `;
            }

            if(status != undefined && status != ""){
                sql += `archive.status = "${status}" AND `;
            }

            sql = sql.substring(0, sql.length-4);
        }

        if((date_creation != undefined && date_creation != "") || (alphabetical_order != undefined && alphabetical_order != "")){
            if(alphabetical_order == "yes"){
                sql += "ORDER BY user_name";
            }
            if((date_creation != undefined && date_creation != "")){
                if(date_creation == "old"){
                    sql += "ORDER BY archive_date_creation ASC";
                }else{
                    sql += "ORDER BY archive_date_creation DESC";
                }
                
            }
        }else{
            sql += "ORDER BY user_name";
        }

        db.query(sql,(error, result)=>{
            if(error){
                return res.status(500).json({message: "Não foi possível consultar os documentos dos usuários."});
            }
            return res.status(200).json(result);
        })
    }catch(error){
        return res.status(500).json({message: "Não foi possível consultar os documentos dos usuários."});
    }
}

//Seleciona dos documentos de um usuário específico.
const GetDocsUser = (req, res)=> {
    try{
        const {user, doc} = req.query;
        db.query("SELECT id, doc_id, user_id, doc_path, status, status_description, date_creation FROM users_docs_users WHERE user_id = ? AND doc_id = ?", [user, doc],(err,result)=>{
            if(err){
                return res.status(500).json({message: "Não foi possível encontrar o documento do usuário."});
            }
            return res.status(200).json(result)
        })
    }catch(error){
        return res.status(500).json({message: "Não foi possível encontrar o documento do usuário."});
    }
}

/* INÍCIO - FUNÇÕES PARA FUNCIONAMENTO DO MULTER (PACOTE RESPONSÁVEL PELO UPLOAD DE ARQUIVOS VIA API) */
const fileFilter = (req, file, cb)=>{
    
    if(req.query.formats != undefined){
        const ext = path.extname(file.originalname);
       
        if(req.query.formats.includes(ext)){
            cb(null, true);
        }else{
            console.log(`📄 -> User ${req.query.user} tried to upload document ${req.query.doc} in the wrong format. <- ❗`)
            cb(null, false);
        }
    }else{
        cb(new Error("Formatos não passados para verificação"))
    }
    
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/user-docs') // Pasta onde os uploads serão armazenados
    },
    filename: function (req, file, cb) {
        if(req.query != undefined){
            const ext = path.extname(file.originalname);
            console.log(`📄 -> User ${req.query.user} uploaded document ${req.query.doc}. <- ✔`)
            cb(null, new Date().toISOString() + "doc" + req.query.user + req.query.doc + ext);
        }else{
            
            cb(new Error('Nenhum documento para upload.'))
        }
      
    },
    
});

const multerUpload = multer({storage:storage, fileFilter: fileFilter});

/* FIM - FUNÇÕES PARA FUNCIONAMENTO DO MULTER (PACOTE RESPONSÁVEL PELO UPLOAD DE ARQUIVOS VIA API) */

//Envia um documento para a pasta user-docs.
const Upload = (req, res)=>{
    if(!req.file){
        return res.status(400).json({message: "Nenhum arquivo foi enviado."})
    }else{
        return res.status(200).json(req.file);
    }
}

//Insere o documento no banco de dados.
const SaveUpload = (req, res)=>{

    const {user, doc, file} = req.body;

    let ip = null;

    if(req.connection.remoteAddress.startsWith("::ffff")){
        ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
    }else{
        ip = req.connection.remoteAddress;
    }
    
    try{
        if(file != undefined && file != null){
            db.query("SELECT id FROM users_docs WHERE id = ? UNION ALL SELECT id FROM users WHERE id = ?",[doc,user], (err, result)=>{
                if(result.length < 2){
                    return res.status(400).json({message: "O documento e/ou o usuário informados não existem."})
                }else{
                    db.query("INSERT INTO users_docs_users (doc_id, user_id, doc_path, status, date_creation, user_creator, ip_creator) VALUES (?,?,?,'waiting',NOW(),?,?)",[doc, user,file,user, ip],(err, result)=>{
                        if(err){
                            console.log(err);
                            return res.status(500).json({message: "Upload de documento não concluído."});
                        }
                        return res.status(200).json({message: "O upload do documento foi realizado."});
                    })
                }
            })
        }
        
    }catch(error){
        return res.status(400).json({message: "Nenhum documento selecionado para upload."})
    }
}

////Insere o documento no banco de dados.
const EditUpload = (req, res)=>{

    const {user, doc, file, filename_previous, defDoc} = req.body;

    let ip = null;

    if(req.connection.remoteAddress.startsWith("::ffff")){
        ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
    }else{
        ip = req.connection.remoteAddress;
    }
    
    try{
        if(file != undefined && file != null){
            db.query("SELECT id FROM users_docs WHERE id = ? UNION ALL SELECT id FROM users WHERE id = ?",[defDoc,user], (err, result)=>{
                if(result.length < 2){
                    return res.status(400).json({message: "O documento e/ou o usuário informados não existem."})
                }else{
                    console.log(file);
                    db.query("UPDATE users_docs_users SET doc_path = ?, status = 'waiting', date_creation = NOW() WHERE id = ?",[file, doc],(err, result)=>{
                        if(err){
                            console.log(err);
                            return res.status(500).json({message: "Upload de documento não concluído."});
                        }
                        fs.unlink(path.join(__dirname,"..","public","user-docs",filename_previous),(err)=>{});
                        return res.status(200).json({message: "A edição do documento foi realizada."});
                    })
                }
            })
        }
        
    }catch(error){
        return res.status(400).json({message: "Nenhum documento selecionado para upload."})
    }
}

//Deleta o arquivo de um documento.
const DeleteUpload = (req, res)=>{
    try{
        const {doc} = req.params;

        db.query("SELECT doc_path FROM users_docs_users WHERE id = ?",[doc],(err, result1)=>{
            if(err){
                console.log(err);
                return res.status(500).json({message: "Não foi possível excluir o documento."})
            }else{
                if(result1.length > 0){
                    db.query("DELETE FROM users_docs_users WHERE id = ?",[doc],(err, result)=>{
                        if(err){
                            console.log(err);
                            return res.status(500).json({message: "Não foi possível excluir o documento."});
                        }else{
                            fs.unlink(path.join(__dirname,"..","public","user-docs",result1[0].doc_path),(err)=>{});
                            return res.status(200).json({message: "O documento foi deletado."})
                        }
                    });
                }else{
                    return res.status(400).json({message: "O documento que você está tentando excluir não existe."})
                }
            }
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({message: "Não foi possível excluir o documento."})
    }
}

const ChangeStatus = (req, res)=>{
    try{
        const {status, description} = req.query;
        const {user, doc} = req.body;
        if((doc != undefined && doc != "") && (status != undefined && status != "") && (user != undefined)){
            let sql = "";
            let queryValues = [];

            if(description != undefined && description.length > 0){
                sql = "UPDATE users_docs_users SET status = ?, status_description = ?, user_status = ? WHERE id = ?";
                queryValues.push(status);
                queryValues.push(description);
                queryValues.push(user);
                queryValues.push(doc);
            }else{
                sql = "UPDATE users_docs_users SET status = ?, user_status = ? WHERE id = ?";
                queryValues.push(status);
                queryValues.push(user);
                queryValues.push(doc);
            }

            
            db.query(sql, queryValues, (err, result)=>{
                if(err){
                    return res.status(500).json({message: "Não foi possível alterar o status do documento."});
                }
                return res.status(200).json({message: "O status do documento foi alterado."});
            });
        }else{
            
            return res.status(500).json({message: "Não foi possível alterar o status do documento."});
        }

    }catch(error){
        console.log(error)
        return res.status(500).json({message: "Não foi possível alterar o status do documento."});
    }
}

module.exports = {Register, GetDocs, Update, Delete, GetDocsUser, multerUpload, Upload, SaveUpload, DeleteUpload, EditUpload, GetDocsUsers, ChangeStatus};