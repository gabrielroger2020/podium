var express = require('express');
var router = express.Router();
const modalities = require("../controllers/Modalities");
const validateJWT = require("../middlewares/validateJWT");

router.use(validateJWT);

//Rota para cadastrar entidade
router.post("/register", modalities.Register);

//Rota para selecionar entidades
router.get("/select", modalities.Select);

//Rota para deletar entidade
router.delete("/delete/:id", modalities.Delete);

//Rota para editar entidade
router.put("/update", modalities.Update)

module.exports = router;
