var express = require('express');
var router = express.Router();
const competitions = require("../controllers/Competitions");
const validateJWT = require("../middlewares/validateJWT");

router.use(validateJWT);

//Rota para cadastrar equipe
router.post("/register", competitions.Register);


module.exports = router;
