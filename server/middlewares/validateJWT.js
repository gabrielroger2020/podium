const jwtService = require("jsonwebtoken");
const auth = require("../config/auth.json")

const validateJWT = (req, res, next) => {
    const jwt = req.headers["authorization"];
    const privateKey = auth.privateKey;

    jwtService.verify(jwt, privateKey, (err, userInfo) => {
        if (err) {
            res.status(403).end();
            return;
        }

        req.userInfo = userInfo;
        next();
    })
}

module.exports = validateJWT;