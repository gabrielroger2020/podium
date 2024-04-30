const db = require("../database/db");
const bcrypt = require("bcrypt");
const mailPreDef = require("../mail/mailPreDef");
const dayjs = require("dayjs");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const jwt = require("jsonwebtoken");
const auth = require("../config/auth.json");


// Cadastro de um novo grupo de acesso.
const Register = (req, res) => {
    const {user_creator, name} = req.body;
    let permissions = req.body.permissions;
    let ip = null;
    if(req.connection.remoteAddress.startsWith("::ffff")){
        ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
    }else{
        ip = req.connection.remoteAddress;
    }

    try{
        db.query("SELECT name FROM access_group WHERE name = ?",[name],(er, re)=>{
            if(re.length > 0){
                return res.status(400).json({message: "Erro ao cadastrar grupo de acesso. Já existe um grupo com esse nome."});
            }else{
                db.query("INSERT INTO access_group (name, user_creator, ip_creator, date_creation) VALUES (?,?,?,NOW())",[name, user_creator, ip], (err, result)=>{
                    if(err){
                        return res.status(400).json({message: "Erro ao cadastrar grupo de acesso, verifique se todos os campos foram preenchidos corretamente."});
                    }
                    db.query("SELECT MAX(id) FROM access_group",(err1, result1)=>{
                        if(err1){
                            return res.status(500).json({message: "Erro ao cadastrar grupo de acesso."});
                        }
                        if(result1.length > 0){
                            permissions.forEach((element)=>{
                                db.query("INSERT INTO access_group_permissions (access_group_id, keyword, user_creator, ip_creator, date_creation) VALUES (?,?,?,?,NOW())",[result1[0]["MAX(id)"],element,user_creator,ip],(err, result)=>{
                                    if(err){
                                        
                                    }
                                });
                            })
        
                            return res.status(200).json({message: "Grupo de acesso criado com sucesso."});
                        }
                    })
                })
            }
        })
    }catch{
        return res.status(500).json({message: "Erro ao cadastrar grupo de acesso."})
    }
}

// Deletar um grupo de acesso específico.
const Delete = (req,res)=>{
    try{
        const {id} = req.params;

        db.query("SELECT id FROM access_group WHERE id = ?",[id],(err, result)=>{
            if(result.length > 0){
                db.query("SELECT id FROM access_group_permissions_users WHERE access_group_id = ?", [id], (err, result)=>{
                    if(result.length > 0){
                        return res.status(400).json({message: "Erro ao deletar grupo de acesso, existe usuários vinculados a esse grupo."});
                    }else{
                        db.query("DELETE FROM access_group_permissions WHERE access_group_id = ?",[id],(err, result)=>{
                            db.query("DELETE FROM access_group WHERE id = ?",[id],(err, result)=>{
                                return res.status(200).json({message: "Grupo de acesso excluído com sucesso."});
                            });

                        })
                    }
                })
                
            }else{
                return res.status(400).json({message: "Não existe nenhum grupo de acesso com esse ID."});
            }
        })
    }catch{

    }
}

// Editar um grupo de acesso.
const Edit = (req, res)=>{
    try{
        const {id,name,user_creator} = req.body;
        let permissions = req.body.permissions;
        let ip = null;
        if(req.connection.remoteAddress.startsWith("::ffff")){
            ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
        }else{
            ip = req.connection.remoteAddress;
        }

        db.query("UPDATE access_group SET name = ? WHERE id = ?", [name, id],(err, result)=>{
            if(err){
                return res.status(500).json({message: "Não foi possível editar grupo de acesso."});
            }
            db.query("SELECT id, keyword FROM access_group_permissions WHERE access_group_id = ?",[id],(err, result1)=>{
                permissions.forEach((element)=>{
                    if(result1.find((e)=>e.keyword == element) == undefined){
                        db.query("INSERT INTO access_group_permissions (access_group_id, keyword, user_creator, ip_creator, date_creation) VALUES (?,?,?,?,NOW())",[id,element,user_creator,ip],(err, result)=>{
                        });
                    }
                })

                result1.forEach((element)=>{
                    if(permissions.find((e)=>e == element.keyword) == undefined){
                        db.query("DELETE FROM access_group_permissions WHERE access_group_id = ? AND keyword = ?",[id,element.keyword],(err, result)=>{
                        });
                    }
                })

                return res.status(200).json({message: "O grupo de acesso foi editado."})
            })
        })
    }catch{

    }
}

// Selecionar TODOS grupos de acesso.
const AccessGroupsInfos = (req, res) =>{
    try{
        db.query("SELECT id, name FROM access_group", (err, result)=>{
            if(err){
                return res.status(500).json({message: "Não foi possível selecionar os grupos de acesso."});
            }
            return res.status(200).json(result);
        })
    }catch{
        return res.status(500).json({message: "Não foi possível selecionar os grupos de acesso."});
    }
}

// Selecionar um grupo de acesso específico.
const AccessGroupInfos = (req, res)=>{

    const {id} = req.params;

    try{
        db.query("SELECT id, name FROM access_group WHERE id = ?", [id], (err, result)=>{
            if(err){
                return res.status(500).json({message: "Não foi possível selecionar o grupo de acesso."});
            }
            if(result.length > 0){
                db.query("SELECT keyword FROM access_group_permissions WHERE access_group_id = ?",[id],(err, result1)=>{
                    let aux = result1.map((element)=>{
                        return element.keyword;
                    })
                    return res.status(200).json({id: result[0].id, name: result[0].name, permissions: aux});
                })
            }else{
                return res.status(400).json({message: "Nenhum grupo de acesso cadastrado com esse id."});
            }
        })
    }catch{
        return res.status(500).json({message: "Não foi possível selecionar os grupos de acesso."});
    }
}

// Adicionar/remover usuário a um determinado grupo de acesso.
const UserCrudAccessGroup = (req, res)=>{
    try{
        const {user, user_creator} = req.body;
        
        let groups = [];

        groups = req.body.groups;

        if(groups.length == 0){
            return res.status(400).json({message: "Nenhum grupo de acesso solicitado para inserção ou remoção."});
        }else{

            let ip = null;
        if(req.connection.remoteAddress.startsWith("::ffff")){
            ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
        }else{
            ip = req.connection.remoteAddress;
        }

        db.query("SELECT id, access_group_id FROM access_group_permissions_users WHERE user_id = ?", [user], (err, result)=>{
            if(err){
                return res.status(500).json({message: "Não foi possível editar os grupos de acesso desse usuário!"});
            }

            if(result.length > 0){

                result.forEach((group)=>{
                    
                    if(groups.find((e)=> e == group.access_group_id) == undefined){
                        db.query("DELETE FROM access_group_permissions_users WHERE id = ?", [group.id], (err, result)=>{
                            if(err){
                                return res.status(500).json({message: "Não foi possível editar os grupos de acesso do usuário."});
                            }
                        })
                    }
                })

                groups.forEach((group)=>{
                    if(result.find((e)=> e.access_group_id == group) == undefined){
                        db.query("INSERT INTO access_group_permissions_users (user_id, access_group_id, date_creation, user_creation, ip_creation) VALUES (?,?,NOW(),?,?)",[user, group, user_creator, ip],(err, result)=>{
                            if(err){
                                return res.status(500).json({message: "Não foi possível editar os grupos de acesso do usuário."});
                            }
                        })
                    }
                    
                })

                return res.status(200).json({message: "Os grupos de acesso do usuário foram editados."});

            }else{
                if(groups != undefined){
                    groups.forEach((group)=>{
                        db.query("INSERT INTO access_group_permissions_users (user_id, access_group_id, date_creation, user_creation, ip_creation) VALUES (?,?,NOW(),?,?)",[user, group, user_creator, ip],(err, result)=>{
                            if(err){
                                return res.status(500).json({message: "Não foi possível editar os grupos de acesso do usuário."});
                            }
                        })
                    })
                    return res.status(200).json({message: "Os grupos de acesso do usuário foram editados."});
                }else{
                    return res.status(500).json({message: "Não foi possível editar os grupos de acesso do usuário."});
                }
            }

           
        })

        }

    }catch(error){
        return res.status(500).json({message: "Não foi possível editar os grupos de acesso do usuário."});
    }
}

//Verificando se um determinado usuário possui permissão para acessar uma determinada página ou não.
const VerifyUserAcces = (req, res)=>{
    try{

        const {user} = req.params;
        const {keyword} = req.query;

        if(user != undefined && keyword != undefined){
            db.query("SELECT access_group_permissions.keyword FROM access_group_permissions INNER JOIN access_group_permissions_users ON access_group_permissions.access_group_id = access_group_permissions_users.access_group_id WHERE access_group_permissions_users.user_id = ? AND access_group_permissions.keyword = ?",[user, keyword],(err,result)=>{

                if(result.length > 0){
                    return res.status(200).json({access: true});
                }else{
                    return res.status(200).json({access: false});
                }

            })
        }else{
            return res.status(500).json({message: "Não foi possível verificar as permissçoes do usuário."})
        }

        

    }catch(error){
        return res.status(500).json({message: "Não foi possível verificar as permissçoes do usuário."});
    }
}




module.exports = {Register,AccessGroupsInfos, AccessGroupInfos, Delete, Edit, UserCrudAccessGroup, VerifyUserAcces};