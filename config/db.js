const mysql = require('mysql');
const util = require('util');
async function executeQuery(q, params, host, db, user, pwd){
    try{
        var connection = mysql.createConnection({host: "bpljpcfsmqiqvhoxdvqh-mysql.services.clever-cloud.com", user: "u8kfdnffyf9qj7zc", password: "KkGtfMqjdvjQDJRWskKp", database: "bpljpcfsmqiqvhoxdvqh"});
        // var connection = mysql.createConnection({host: "localhost", user: "root", password: "sqladmin", database: "innopolis1.1"});
        // var connection = mysql.createConnection({host: "mysql-innoplis-farbenzent-569a.a.aivencloud.com", user: "avnadmin",password:"AVNS__SRX8MsbFHgTm0olUQr", database: "innopolis",connectTimeout: 30000, ssl: {ca: './ca/ca(1).pem', rejectUnauthorized: false}, port: 28235, family: '4'});
console.info("config",connection)
    } catch(e){
        throw ('MySql connection error', e);
    }
        
    try{
        const query = util.promisify(connection.query).bind(connection);
        const rows = await query(q, params);
        connection.destroy();
        return rows;    
    } catch(e){
        connection.destroy();
        console.info("Mysql error ::: ",e);
        // throw ("MySQL query error", e);
    }
}
module.exports = executeQuery; 