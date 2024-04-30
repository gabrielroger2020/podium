var express = require('express');
var router = express.Router();
const docs = require("../controllers/Docs");
const validateJWT = require("../middlewares/validateJWT");

router.use(validateJWT);
//Rota para cadastrar definição de documento.
router.post("/register",docs.Register);
//Rota para editar definição de documento.
router.post("/update",docs.Update);
//Rota para consultar as definições de documentos cadastrados.
router.get("/select", docs.GetDocs);
//Rota para verificar se o usuário tem o documento cadastrado ou não.
router.get("/doc-user", docs.GetDocsUser);
//Rota para deletar definição de documento.
router.delete("/delete/:id", docs.Delete);
//Rota para fazer o upload do arquivo
router.post("/archive",docs.multerUpload.single('file'), docs.Upload);
//Rota para salvar o upload do arquivo no banco de dados.
router.post("/save-archive", docs.SaveUpload);
//Rota para editar o upload do arquivo no banco de dados.
router.put("/edit-archive", docs.EditUpload);
//Rota para deletar documento
router.delete("/archive/:doc", docs.DeleteUpload);
//Rota para selecionar os documentos de todos os usuários.
router.get("/docs-users", docs.GetDocsUsers);
//Rota para alterar o status de um determinado documento.
router.put("/change-status", docs.ChangeStatus);




module.exports = router;
