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

//Registro de usuário
const Register = (req, res)=>{

    //Capturando os valores enviados na requisição da API.
    let {name, gender, pcd, birth, cpf, email, cellphone, password, confPassword, ip, user_creator} = req.body;

    //Deixando os campos CPF e Cellphone somente com números.
    cpf = cpfAux.cpfExtract(cpf);
    cellphone = phoneAux.phoneExtract(cellphone);

    birth = dayjs(birth).format("YYYY-MM-DD");

    //Capturando o ip de quem fez a requisição.

    if(req.connection.remoteAddress.startsWith("::ffff")){
        ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
    }else{
        ip = req.connection.remoteAddress;
    }
    
    try{
        //Resposta da API se tudo ocorrer bem.

        bcrypt.hash(password, 10, (err, hash)=>{

            try{
                if(err){
                    return res.status(400).json(err);
                }

                let valuesQuery = [];

                if(user_creator == undefined){
                    valuesQuery = [name, gender, pcd, birth, cpf, email, cellphone, hash, 0, null,ip,"active"];
                }else{
                    valuesQuery = [name, gender, pcd, birth, cpf, email, cellphone, hash, 0, user_creator,ip,"active"];
                }

                db.query("INSERT INTO sc_podium.users (name, gender, pcd, date_birth, cpf, email, phone_number, password, twofa, date_creation, user_creator, ip_creator, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)",valuesQuery,(err, result)=>{
                    if(err){
                        return res.status(400).json({message: "Já existe um usuário cadastrado com algumas dessas informações: CPF, e-mail e celular."});
                    }

                    db.query("SELECT MAX(id) FROM users",(err,result)=>{
                        db.query("INSERT INTO access_group_permissions_users(user_id,access_group_id,date_creation,user_creation,ip_creation) VALUES (?,?,NOW(),?,?)",[result[0]["MAX(id)"],29,valuesQuery[8],valuesQuery[9]],(err, response)=>{
                        })
                    })

                    return res.status(200).json({cpf: cpf, cellphone: cellphone});
                })
            }catch(error){
                return res.status(400).json(error);
            }
            
        })
        

    }catch(error){
        //Resposta da API se der errado.
        return res.status(400).json(error);
    }

}

//Deletar usuário
const Delete = (req, res)=>{

    const {user} = req.params;

    try{

        db.query("DELETE FROM users WHERE id = ?", [user],(err, result)=>{
            if(err){
                return res.status(400).json({message: "Erro ao deletar usuário. Verifique se ele não está ligado a nenhum outro cadastro (entidades e equipes)."})
            }
            return res.status(200).json({message: "O usuário foi deletado."});
        });

    }catch(error){
        return res.status(500).json({message: "Erro ao deletar usuário. Verifique se ele não está ligado a nenhum outro cadastro (entidades e/ou equipes)."})
    }
}

//Alteração de usuário
const Update = (req, res) =>{
    const {user} = req.params;
    let {email, cellphone} = req.query;
    try{
        cellphone = phoneAux.phoneExtract(cellphone);

        db.query("SELECT id FROM users WHERE (email = ? OR phone_number = ?) AND id != ?",[email,cellphone,user], (error, result)=>{
            if(error){
                return res.status(500).json({message: "Erro ao alterar dados cadastrais."});
            }
            if(result.length == 0){
                db.query("UPDATE users SET email = ?, phone_number = ? WHERE id = ?", [email,cellphone,user], (error, result)=>{
                    if(error){
                        return res.status(500).json({message: "Erro ao alterar dados cadastrais."});
                    }
        
                    return res.status(200).json({message: "Dados cadastrais alterados."})
                });
            }else{
                return res.status(400).json({message: "E-mail e/ou telefone já cadastrados."})
            }
        })

        

    }catch(error){
        return res.status(500).json({message: "Erro ao alterar dados cadastrais."});
    }
    
}

//Alterar senha
const UpdatePassword = (req,res)=>{
    const {user, password} = req.body;
    try{

        bcrypt.hash(password,10,(err,hash)=>{
            if(err){
                
                return res.status(500).json({message: "Não foi possível alterar sua senha."});
            }
            db.query("UPDATE users SET password = ? WHERE id = ?", [hash, user],(err, result)=>{
                if(err){
                    return res.status(500).json({message: "Não foi possível alterar sua senha."});
                }
    
                return res.status(200).json({message: "Senha alterada com sucesso!"});
            })
        })
        
    }catch(error){
        return res.status(500).json({message: "Não foi possível alterar sua senha."});
    }
}

//Autenticação de usuário
const Auth = (req, res) => {
    const {login, password} = req.body;

    try{
        db.query("SELECT id, password, twofa FROM users WHERE cpf = ? OR email = ? OR phone_number = ?",[login,login,login],(err, result)=>{
            if(err){
                return res.status(400).json({message: "Os dados inseridos estão incorretos."});
            }
            if(result.length == 0){
                return res.status(400).json({message: "Nenhum usuário foi encontrado cadastrado com os dados fornecidos."});
            }
            bcrypt.compare(password,result[0].password,(err, result1)=>{
                if(err){
                    return res.status(400).json({message: "Os dados inseridos estão incorretos."});
                }
                if(result1 == true){
                    bcrypt.hash(dayjs().format(), 10,(err, result3)=>{
                        if(err){
                            return res.status(500).json({message: "Erro ao gerar token de login."});
                        }
                        db.query("UPDATE users SET token_login = ? WHERE id = ?",[result3, result[0].id],(err, result4)=>{
                            if(err){
                                return res.status(500).json({message: "Erro ao gerar token de login."});
                            }

                            jwt.sign({user: result[0].id}, auth.privateKey, (err, result2)=>{
                                if(err){
                                    return res.status(500).json({message: "Erro ao gerar código API."});
                                }
                                if(result[0].twofa == 1){
                                    return res.status(201).json({id: result[0].id ,token_login: result3,token: result2,message: "Usuário conectado com sucesso."});
                                }
                                    return res.status(200).json({id: result[0].id ,token_login: result3,token: result2,message: "Usuário conectado com sucesso."});
                            })

                        })
                    })
                    
                }else{
                    return res.status(400).json({message: "A senha inserida está incorreta."});
                }
            })
            
           
        })
    }catch(error){
        console.log(error);
    }
}

//Verifica se o usuário está auntenticado ou não.
const VerifyAuth = (req, res) => {
    
    const {user, token} = req.query;
    if(user && token){
        db.query("SELECT token_login FROM users WHERE id = ?",[user],(err, result)=>{
            if(err){
                return res.status(500).json({message: "Sem permissão para acessar essa página, usuário não está logado."});
            }

            if(result.length > 0){
                if(result[0].token_login == token){
                    return res.status(200).json({message: "Usuário está autenticado."});
                }else{
                    return res.status(400).json({message: "Sem permissão para acessar essa página, usuário não está logado."});
                }
            }else{
                return res.status(400).json({message: "Sem permissão para acessar essa página, usuário não está logado."});
            }
            
        })
    }else{
        return res.status(400).json({message: "Sem permissão para acessar essa página, usuário não está logado."});
    }

}

const Verify2FA = (req, res) => {
    const {id, token} = req.body;

    try{
        db.query("SELECT twofasecret FROM users WHERE id = ?",[id],(err, result)=>{
            if(err){
                return res.status(400).json({message: "Erro ao validar autenticação de dois fatores."});
            }
            if(result.length == 0){
                return res.status(400).json({message: "Nenhum usuário foi encontrado cadastrado com os dados fornecidos."});
            }
            const tokenIsValid = speakeasy.totp.verify({
                secret: result[0].twofasecret,
                encoding: "base32",
                token: token,
                window: 1
            });

            if(tokenIsValid == true){
                return res.status(200).json({message: "Usuário autenticado."})
            }else{
                return res.status(400).json({message: "O token digitado é inválido."});
            }
           
        })


    }catch(error){
        console.log(error);
    }
}

//Recuperação de senha
const RecoveryPassword = (req, res) => {
    const {email} = req.body;

    try{
        db.query("SELECT id FROM users WHERE email = ?",[email],(err, result)=>{
            if(result.length == 0){
                return res.status(400).json({message: "Nenhuma conta cadastrada com esse e-mail."});
            }
            const newPassword = Math.round((Math.random()*(99999999-10000001) + 10000001))+"";
            bcrypt.hash(newPassword,10,(err,hash)=>{
                if(err){
                    console.log(err);
                    return res.status(500).json({message: "Erro ao gerar nova senha."});
                }
                db.query("UPDATE users SET password = ? WHERE id = ?",[hash,result[0].id],(err,result)=>{
                    if(err){
                        return res.status(500).json({message: "Erro ao gerar nova senha."});
                    }
                    mailPreDef.recoveryPasswordMessage(email, newPassword);
                    return res.status(200).json({message: "Uma nova senha foi gerada e encaminhada para o seu e-mail."});
                })
            })
        });
    }catch{
        return res.status(500).json({message: "Erro ao recuperar senha."});
    }
}

//Ativação do Google Authenticator
const ActivationGoogleAuthenticator = (req, res) => {

    const {user} = req.body;

    try{

        db.query("SELECT twofa FROM users WHERE id = ? AND twofa != 1",[user],(err, result)=>{
            if(err){
                
                return res.status(500).json({
                    message: "Erro ao ativar autenticação de dois fatores.",
                })
            }
    
            if(result.length > 0){
    
                const secret = speakeasy.generateSecret({length: 20});
                const token = speakeasy.totp({
                    secret: secret.base32,
                    encoding: "base32"
                });

                const tokenIsValid = speakeasy.totp.verify({
                    secret: secret.base32,
                    encoding: "base32",
                    token: token
                });

                if(tokenIsValid == true){

                    const qrcodeSecret = qrcode.toDataURL(secret.otpauth_url, (err, data_url)=>{
                        if(err){
                            return res.status(500).json({
                                message: "Erro ao ativar autenticação de dois fatores.",
                            });
                        }
                        
                        db.query("UPDATE users SET twofa = 1,twofasecret = ? WHERE id = ? AND twofa != 1", [secret.base32,user],(err, result)=>{
                            if(err){
                                console.log(err)
                                return res.status(500).json({
                                    message: "Erro ao ativar autenticação de dois fatores.",
                                });
                            }
                            
                            console.log("|PODIUM 2FA 🏆|\n->An account has just activated the two-factor authentication method.<-\n");

                            return res.status(200).json({
                            message: "Autenticação de dois fatores ativada com sucesso.",
                            qrcode: data_url
                            });
                        });
                        
                    })
                    
                }else{
                    
                    return res.status(500).json({
                        message: "Erro ao ativar autenticação de dois fatores.",
                    })
                }
    
            }else{
                return res.status(400).json({
                    message: "Usuário não registrado.",
                })
            }
        })
        
    }catch(error){
        return res.status(500).json({
            message: "Erro ao ativar autenticação de dois fatores.",
        })
    }
    

}

//Desativação do Google Authenticator
const DeactivationGoogleAuthenticator = (req, res) => {

    const {user} = req.body;

    try{

        db.query("SELECT twofa FROM users WHERE id = ? AND twofa = 1",[user],(err, result)=>{
            if(err){
                
                return res.status(500).json({
                    message: "Erro ao desativar autenticação de dois fatores.",
                })
            }
    
            if(result.length > 0){
    
                db.query("UPDATE users SET twofa = 0 WHERE id = ? AND twofa = 1", [user],(err, result)=>{
                    if(err){
                        console.log(err)
                        return res.status(500).json({
                            message: "Erro ao desativar autenticação de dois fatores.",
                        });
                    }
                    
                    console.log("|PODIUM 2FA 🏆|\n->An account has just deactivated the two-factor authentication method.<-\n");

                    return res.status(200).json({
                    message: "Autenticação de dois fatores desativada com sucesso.",
                    });
                });
    
            }else{
                return res.status(400).json({
                    message: "Usuário não registrado.",
                })
            }
        })
        
    }catch(error){
        return res.status(500).json({
            message: "Erro ao desativar autenticação de dois fatores.",
        })
    }
    

}

//Buscar todas as informações de um usuário
const UserInfos = (req, res) => {

    const {user} = req.params;

    try{
        db.query("SELECT name, gender, pcd, date_birth, cpf, email, phone_number, twofa, status FROM users WHERE id = ?",[user],(err, result)=>{
            if(err){
                return res.status(500).json({message: "Erro ao realizar consulta de usuário."});
            }else{
                if(result.length > 0){
                    let infos = result[0];
                    infos.cpf = infos.cpf.substring(0,3) + ".XXX.XXX-" + infos.cpf.substring(infos.cpf.length-2,infos.cpf.length);
                    infos.phone_number = `(${infos.phone_number.substring(0,2)}) ${infos.phone_number.substring(2,3)} ${infos.phone_number.substring(3,7)}-${infos.phone_number.substring(7,11)}`
                    return res.status(200).json(infos);
                }else{
                    return res.status(400).json({message: "Usuário não encontrado."});
                }
                
            }
        });
    }catch(err){
        return res.status(500).json({message: "Erro ao realizar consulta de usuário."});
    }
}

//Buscar todos os usuários
const UsersInfos = (req, res) => {
    try{

        let {name, group, gender, date_birth_ini, date_birth_end, status} = req.query;

        let sql = "SELECT users.id, users.name, users.gender, users.pcd, users.date_birth, users.cpf, users.email, users.phone_number, users.twofa FROM users INNER JOIN access_group_permissions_users  ON users.id = access_group_permissions_users.user_id";
        let valuesSql = [];

        if(name != undefined || group != undefined || gender != undefined || date_birth_ini != undefined || date_birth_end != undefined || status != undefined){
            sql += " WHERE "
            if(name != undefined){
                name= `%${name}%`
                sql += "users.name LIKE ? AND ";
                valuesSql.push(name);
            }
    
            if(group != undefined && group != ""){
                sql += "access_group_permissions_users.access_group_id = ? AND ";
                valuesSql.push(group);
            }
    
            if(gender != undefined){
                sql += "users.gender = ? AND ";
                valuesSql.push(gender);
            }
    
            if(date_birth_ini != undefined && date_birth_end != undefined){
                sql += "users.date_birth >= ? AND users.date_birth <= ? AND ";
                valuesSql.push(date_birth_ini);
                valuesSql.push(date_birth_end);
            }
    
            if(status != undefined){
                sql += "users.status = ? AND ";
                valuesSql.push(status);
            }

            sql = sql.substring(0,(sql.length)-4);
        }

        sql += " GROUP BY users.id"

        db.query(sql,valuesSql,(err, result)=>{
            if(err){
                console.log(err);
                return res.status(500).json({message: "Erro ao realizar consulta de usuário."});
            }else{
                if(result.length > 0){
                    let infos = result;
                    infos.forEach((element, index)=>{
                        infos[index].cpf = infos[index].cpf.substring(0,3) + ".XXX.XXX-" + infos[index].cpf.substring(infos[index].cpf.length-2,infos[index].cpf.length);
                        infos[index].phone_number = `(${infos[index].phone_number.substring(0,2)}) ${infos[index].phone_number.substring(2,3)} ${infos[index].phone_number.substring(3,7)}-${infos[index].phone_number.substring(7,11)}`;
                        infos[index].date_birth = dayjs(infos[index].date_birth).format("DD/MM/YYYY");
                        infos[index].gender = (infos[index].gender == "female")?("Feminino"):("Masculino");
                    })
                    return res.status(200).json(infos);
                }else{
                    return res.status(400).json({message: "Nenhum usuário registrado."});
                }
                
            }
        });
    }catch(err){
        return res.status(500).json({message: "Erro ao realizar consulta de usuários."});
    }
}

//Desativa a autenticação de dois fatores do usuário
const Disable2FA = (req, res) =>{
    try{
        const {user} = req.params;

        db.query("SELECT twofa FROM users WHERE id = ?", [user], (err, result)=>{
            if(result.length == 0){
                return res.status(400).json({message: "A 2FA não foi desativada, nenhum usuário cadastrado com essas informações."});
            }else{
                if(result[0].twofa == 1){
                    db.query("UPDATE users SET twofa = 0 WHERE id = ?",[user], (err, result)=>{
                        if(err){
                            return res.status(500).json({message: "Não foi possível desativar a 2FA dessa conta."});
                        }
                        return res.status(200).json({message: "A 2FA foi desativada."})
                    })
                }else{
                    return res.status(400).json({message: "A 2FA dessa conta já está desativada."});
                }
            }
        })

    }catch{

    }
}

//Muda o status do usuário
const UpdateStatus = (req, res)=>{
    try{
        const {user} = req.params;
        let {status} = req.query;

        if(status == "false"){
            status = "disabled";
        }

        if(status == "true"){
            status = "active";
        }

        db.query("SELECT status FROM users WHERE id = ?", [user], (err, result)=>{
            if(result.length == 0){
                return res.status(400).json({message: "O status do usuário não foi alterado, não existe nenhum usuário cadastrado com essas informações."});
            }else{
                db.query("UPDATE users SET status = ? WHERE id = ?",[status,user], (err, result)=>{
                    if(err){
                        return res.status(500).json({message: "Não foi possível alterar o status desse usuário."});
                    }
                    return res.status(200).json({message: "O status do usuário foi alterado."})
                })
            }
        })

    }catch(error){
        return res.status(500).json({message: "Não foi possível alterar o status desse usuário."});
    }
}

//Busca os grupos de acesso do usuário
const GetAccessGroup = (req, res) => {
    try{
        const {user} = req.params;

        db.query("SELECT access_group_id FROM access_group_permissions_users WHERE user_id = ?", [user], (err, result)=>{
            console.log(err)
            if(result != undefined && result.length > 0){
                let aux = [];

                result.forEach((element)=>{
                    aux.push(element.access_group_id);
                });

                return res.status(200).json({user: user, access_groups: aux});

            }else{
                return res.status(400).json({message: "Esse usuário não está cadastrado a nenhum grupo de acesso."});
            }
            
        })
    }catch{
        return res.status(500).json({message: "Erro ao selecionar grupos de acesso do usuário."});
    }
}

/* INÍCIO - FUNÇÕES PARA FUNCIONAMENTO DO MULTER (PACOTE RESPONSÁVEL PELO UPLOAD DE ARQUIVOS VIA API) */
const fileFilter = (req, file, cb)=>{
    
    const ext = path.extname(file.originalname);
    
    if((".jpg,.png,.jpeg").includes(ext)){
        cb(null, true);
    }else{
        console.log(`📷 -> User ${req.query.user} tried to upload image profile in the wrong format. <- ❗`)
        cb(null, false);
    }

    
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/user-images') // Pasta onde os uploads serão armazenados
    },
    filename: function (req, file, cb) {
        if(req.query != undefined){
            const ext = path.extname(file.originalname);
            console.log(`📷 -> User ${req.query.user} uploaded image profile. <- ✔`)
            cb(null, new Date().toISOString() + "img" + req.query.user + ext);
        }else{
            
            cb(new Error('Nenhum documento para upload.'))
        }
      
    },
    
});

const multerUpload = multer({storage:storage, fileFilter: fileFilter});

/* FIM - FUNÇÕES PARA FUNCIONAMENTO DO MULTER (PACOTE RESPONSÁVEL PELO UPLOAD DE ARQUIVOS VIA API) */

const UploadImageProfile = (req, res) =>{
    if(!req.file){
        return res.status(400).json({message: "Nenhum arquivo foi enviado."})
    }else{
        return res.status(200).json(req.file);
    }
}

const SaveImageProfile = (req, res)=>{

    const {user, file} = req.body;

    let ip = null;

    if(req.connection.remoteAddress.startsWith("::ffff")){
        ip = req.connection.remoteAddress.substring(7, req.connection.remoteAddress.length);
    }else{
        ip = req.connection.remoteAddress;
    }
    
    try{
        if(file != undefined && file != null){
            db.query("SELECT path FROM image_profile WHERE user_id = ?",[user],(err, result1)=>{
                if(result1.length > 0){
                    db.query("UPDATE image_profile SET path = ?, status = 'waiting', date_creation=NOW(), user_creator = ?, ip_creator = ? WHERE user_id = ?",[file,user, ip, user],(err, result)=>{
                        if(err){
                            return res.status(500).json({message: "Upload de imagem não concluído."});
                        }
                        fs.unlink(path.join(__dirname,"..","public","user-images",result1[0].path),(err)=>{});
                        return res.status(200).json({message: "O upload da imagem foi realizado."});
                    });
                }else{
                    db.query("INSERT INTO image_profile (user_id, path, status, date_creation, user_creator, ip_creator) VALUES (?,?,'waiting',NOW(),?,?)",[user,file,user, ip],(err, result)=>{
                        if(err){
                            console.log(err);
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

const GetImageProfile = (req, res)=>{
    
    try{
        const {user} = req.params;

        if(user != undefined && user != null){
            db.query("SELECT id, user_id , path, status, status_description FROM image_profile WHERE user_id = ?",[user],(err, result)=>{
                if(err){
                    return res.status(500).json({message: "Erro ao procurar foto de perfil."}); 
                }
                return res.status(200).json(result[0]);
            })
        }else{
            return res.status(400).json({message: "Nenhum usuário selecionado."});
        }

    }catch{

    }

}

module.exports = {Register, Auth, RecoveryPassword, ActivationGoogleAuthenticator, DeactivationGoogleAuthenticator, VerifyAuth, Verify2FA, UserInfos, UsersInfos, Update, Delete, UpdatePassword, Disable2FA, UpdateStatus, GetAccessGroup, multerUpload, UploadImageProfile, SaveImageProfile, GetImageProfile};