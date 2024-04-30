var express = require('express');
var router = express.Router();
const accessGroup = require("../controllers/AccessGroup");
const validateJWT = require("../middlewares/validateJWT");

router.use(validateJWT);

//Rota para cadastrar um novo grupo de acesso.
router.post("/register", accessGroup.Register);
//Rota para editar um grupo de acesso específico.
router.delete("/del/:id", accessGroup.Delete);
//Rota para editar um grupo de acesso, é POST pois preciso deletar algumas coisas para deletar.
router.post("/update", accessGroup.Edit);
//Rota que retorna todos os grupos de acesso.
router.get("/all", accessGroup.AccessGroupsInfos);
//Rota que seleciona um grupo de acesso em específico.
router.get("/select/:id", accessGroup.AccessGroupInfos)
//Editar os grupos de acesso de um determinado usuário
router.post("/user", accessGroup.UserCrudAccessGroup);
//Verificando se um determinado usuário possui permissão para acessar uma determinada página ou não.
router.get("/verify-user-access/:user", accessGroup.VerifyUserAcces);
module.exports = router;
