var express = require('express');
var router = express.Router();
const entities = require("../controllers/Entities");
const validateJWT = require("../middlewares/validateJWT");

router.use(validateJWT);

//Rota para cadastrar entidade
router.post("/register", entities.Register);

//Rota para selecionar entidades
router.get("/select", entities.GetEntities);

//Rota para deletar entidade
router.delete("/delete/:id", entities.Delete);

//Rota para editar entidade
router.put("/update", entities.Update)

//Rota para cadastrar definição de documento.
router.post("/category/register",entities.RegisterCategory);

//Rota para selecionar todas as categorias de entidades.
router.get("/category/select", entities.SelectCategories);

//Rota para selecionar categoria de entidades.
router.get("/category/select/:id", entities.SelectCategory);

//Rota para editar categoria de entidade.
router.put("/category/update", entities.EditCategory);

//Rota para deletar categoria de entidade.
router.delete("/category/delete/:id", entities.DeleteCategory);

//Rota para selecionar os gerentes de uma entidade
router.get("/managers/:entity", entities.getManagers);

//Rota para editar os gerentes de uma entidade
router.put("/managers/:entity", entities.Managers);

//Rota para fazer o upload do arquivo
router.post("/image-entity",entities.multerUpload.single('file'), entities.UploadImageShield);

//Rota para salvar o upload do arquivo no banco de dados.
router.post("/save-image-entity", entities.SaveImageShield);

//Rota para usuário encontrar sua foto de perfil.
router.get("/shield-image/:entity", entities.GetEntityShield);

//Rota para pegar as informações de todos os escudos com status != null
router.get("/shield-image/select/all", entities.GetShieldsEntities);

router.put("/shield-image/change-status", entities.ChangeShieldStatus);

module.exports = router;
