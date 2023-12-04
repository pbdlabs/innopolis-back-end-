const mysql = require('mysql');
const util = require('util');

async function executeQuery(q, params, host, db, user, pwd){
    try{
        var connection = mysql.createConnection({host: "bpljpcfsmqiqvhoxdvqh-mysql.services.clever-cloud.com", user: "u8kfdnffyf9qj7zc", password: "KkGtfMqjdvjQDJRWskKp", database: "bpljpcfsmqiqvhoxdvqh"});
        // var connection = mysql.createConnection({host: "localhost", user: "root", password: "sqladmin", database: "innopolis-db"});
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
        throw ("MySQL query error", e);
    }
}
module.exports = executeQuery; 