var express = require('express');
var router = express.Router();
const teams = require("../controllers/Teams");
const validateJWT = require("../middlewares/validateJWT");

router.use(validateJWT);

//Rota para cadastrar equipe
router.post("/register", teams.Register);

//Rota para selecionar equipe
router.get("/select", teams.Select);

//Rota para selecionar equipe
router.get("/select/athletes", teams.SelectTeamAthlete);

//Rota para deletar equipe
router.delete("/delete/:id", teams.Delete);

router.put("/update", teams.Update);

router.put("/managers/", teams.setManager);

router.get("/managers/:team", teams.getManagers);

router.get("/athletes/:team", teams.getAthletes);

router.put("/athletes/", teams.setAthlete);

router.put("/athletes/status", teams.ChangeStatusAthletes);

module.exports = router;
