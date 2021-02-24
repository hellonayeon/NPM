const express = require('express');
const path = require('path'); // 라이브러리 불러오기
const app = express();

// json 타입의 데이터 전송을 허용
app.use(express.json());

// form 타입의 데이터 전송을 허용
app.use(express.urlencoded({ extended:false }));

app.use(express.static(path.join(__dirname, 'public'))); //to use static asset (정적 리소스 공개)

app.set('views', __dirname + '/views'); // 뷰 파일이 있는 디렉토리를 설정
app.set('view engine', 'ejs'); // 뷰 엔진으로 EJS 사용 선언

app.get('/', function (req, res) {
  res.send('Hello World');
})

app.get('/ejs', function(req, res) {
    res.render('ejsTest');
})

app.post('/userData', function(req, res) { // 사용자의 요청을 POST로 받는 라우터 생성
  console.log("사용자의 요청이 발생했습니다.")
  console.log(req.body) // 서버에서 request body 를 허용한다는 선언 필요
  res.send(true);
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