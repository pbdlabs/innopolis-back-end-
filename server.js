const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const mysql = require('mysql');
const port = process.env.PORT;

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "sqladmin",
    database: "innopolis-db",
})

db.connect((err)=>{
    if(err){
        console.error('Error connecting to MySql : ', err.stack);
    }
    console.info('Connected to MySQL as id ' + db.threadId);
})


app.use(express.json());

app.use("/api/login", require('./routes/loginRoutes'));

app.listen( port, ()=>{
    console.info(`Server running on port : ${port}`);
})

