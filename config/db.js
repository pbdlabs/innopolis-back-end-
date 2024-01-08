// const mysql = require('mysql');
const util = require('util');
const path = require('path');

const mysql = require('mysql2');

// async function executeQuery(q, params, host, db, user, pwd){
//     try{
//         // var connection = mysql.createConnection({host: "bpljpcfsmqiqvhoxdvqh-mysql.services.clever-cloud.com", user: "u8kfdnffyf9qj7zc", password: "KkGtfMqjdvjQDJRWskKp", database: "bpljpcfsmqiqvhoxdvqh"});
//         // var connection = mysql.createConnection({host: "localhost", user: "root", password: "sqladmin", database: "innopolis1.1"});
//         // var connection = mysql.createConnection({host: "mysql-innoplis-farbenzent-569a.a.aivencloud.com", user: "avnadmin", database: "innopolis",connectTimeout: 30000, ssl: {ca: './ca/ca(1).pem', rejectUnauthorized: false}, port: 28235, family: '4'});
//         var connection = mysql.createConnection({
//             charset: 'utf8mb4',
//             connectTimeout: 10,
//             user: 'avnadmin',
//             password: 'AVNS__SRX8MsbFHgTm0olUQr',
//             database: 'innopolis',
//             host: 'mysql-innoplis-farbenzent-569a.a.aivencloud.com',
//             port: 28235,
//           });
//         console.info("config",connection)
//     } catch(e){
//         throw ('MySql connection error', e);
//     }
        
//     try{
//         const query = util.promisify(connection.query).bind(connection);
//         const rows = await query(q, params);
//         connection.destroy();
//         return rows;    
//     } catch(e){
//         connection.destroy();
//         console.info("Mysql error ::: ",e);
//         // throw ("MySQL query error", e);
//     }
// }

async function executeQuery(q, params) {
    try {
      // Replace these values with your Aiven MySQL database credentials
      const connection = mysql.createConnection({
        host: 'mysql-innoplis-farbenzent-569a.a.aivencloud.com',
        user: 'avnadmin',
        password: 'AVNS__SRX8MsbFHgTm0olUQr',
        database: 'innopolis',
        port: 28235, // Aiven MySQL usually uses port 3306
        ssl: {
            rejectUnauthorized: false,
          ca: path.resolve(__dirname, 'ca', 'ca(1).pem'), // Path to your Aiven CA certificate
        },
        insecureAuth: true,
      });
  
      const query = util.promisify(connection.query).bind(connection);
      const rows = await query(q, params);
      connection.end();
  
      return rows;
    } catch (e) {
      console.error('MySQL error:', e);
      throw e;
    }
  }
  
module.exports = executeQuery; 