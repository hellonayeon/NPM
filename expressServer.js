const express = require('express')
const app = express()
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '19980815',
  database : 'fintech'
});
connection.connect(); 
//connection.end();

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.get('/user', function (req, res) {
    connection.query('SELECT * FROM user', function (error, results, fields) {
        if (error) throw error;
        console.log(results);
        res.send(results[0])
    });
})
 
app.listen(3000)