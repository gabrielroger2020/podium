var express = require('express');
var router = express.Router();
const user = require("../controllers/User");
const validateJWT = require("../middlewares/validateJWT");

router.post('/register', user.Register);
router.post('/login', user.Auth);
router.get('/login', user.VerifyAuth);
router.put('/recovery-password', user.RecoveryPassword);
router.post('/2fa-verify', user.Verify2FA);


router.use(validateJWT);
//Rota para ativar a autenticação de dois fatores.
router.post('/2fa', user.ActivationGoogleAuthenticator);
router.post('/2fa-deactivation', user.DeactivationGoogleAuthenticator);
//Rota para alterar senha.
router.put('/password', user.UpdatePassword);
//Rota para puxar as informações de um determinado usuário.
router.get('/:user', user.UserInfos);
//Rota para puxar as informações de todos os usuários.
router.get('/users/all', user.UsersInfos);
//Rota para selecionar todos os grupos de acesso que um determinado usuário faz parte.
router.get('/access-group/:user', user.GetAccessGroup);
//Rota para atualizar as informações de um usuário específico.
router.put('/:user', user.Update);
//Rota para deletarum usuário específico.
router.delete('/:user', user.Delete);
//Rota para desativar 2FA de um usuário específico.
router.put('/disable-2fa/:user', user.Disable2FA);
//Rota para alterar status do usuário
router.put('/update-status/:user', user.UpdateStatus);
//Rota para fazer o upload do arquivo
router.post("/image-profile",user.multerUpload.single('file'), user.UploadImageProfile);
//Rota para salvar o upload do arquivo no banco de dados.
router.post("/save-image-profile", user.SaveImageProfile);
//Rota para usuário encontrar sua foto de perfil.
router.get("/profile-image/:user", user.GetImageProfile);



module.exports = router;
