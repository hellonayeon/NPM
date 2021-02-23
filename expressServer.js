const express = require('express');
const app = express();

app.set('views', __dirname + '/views'); // 뷰 파일이 있는 디렉토리를 설정
app.set('view engine', 'ejs'); // 뷰 엔진으로 EJS 사용 선언

app.get('/', function (req, res) {
  res.send('Hello World');
})

app.get('/ejs', function(req, res) {
    res.render('ejsTest');
})

app.get('/user', function (req, res) {
    connection.query('SELECT * FROM user', function (error, results, fields) {
        if (error) throw error;
        console.log(results);
        res.send(results[0]);
    });
})

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '19980815',
  database : 'fintech'
});
connection.connect(); 
//connection.end();
 
app.listen(3000);