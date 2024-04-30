var express = require('express');
var router = express.Router();
const imgprofile = require("../controllers/ImageProfile");
const validateJWT = require("../middlewares/validateJWT");

router.use(validateJWT);
//Rota para consultar todas as imagens de perfis.
router.get("/select", imgprofile.GetProfileImages);

//Rota para alterar o status da imagem de perfil.
router.put("/change-status", imgprofile.ChangeStatus);



module.exports = router;
