var mysql = require('mysql');

var pool  = mysql.createPool({
    host     : 'localhost',
    user     : 'ali',
    password : 'men8deoxu',
    database : 'todo'
});

module.exports = pool;