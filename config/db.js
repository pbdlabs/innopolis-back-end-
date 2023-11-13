const mysql = require('mysql');
const util = require('util');

async function executeQuery(q, params, host, db, user, pwd){
    try{
        var connection = mysql.createConnection({host: "localhost", user: "root", password: "sqladmin", database: "innopolis-db"});
    } catch(e){
        return ('MySql connection error', e);
    }
        
    try{
        const query = util.promisify(connection.query).bind(connection);
        const rows = await query(q, params);
        // connection.end();
        connection.destroy();
        return rows;    
    } catch(e){
        // connection.end();
        connection.destroy();
        console.info("Mysql error ::: ",e);
        return ("MySQL query error", e);
    }
}

module.exports = executeQuery;