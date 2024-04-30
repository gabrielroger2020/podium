const mysql = require("mysql2");
const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '..', '.env')});

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

connection.connect((err)=>{
    if(err) {
        console.error("Error mysql: " + err.stack);
        return;
    }

    console.log("(MYSQL) Connected successfully!")
});

module.exports = connection;