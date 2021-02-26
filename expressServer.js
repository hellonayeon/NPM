const express = require('express');
const path = require('path'); // 라이브러리 불러오기
const request = require('request');
const moment = require('moment');

var jwt = require('jsonwebtoken');
var auth = require('./lib/auth');
const app = express();

// json 타입의 데이터 전송을 허용
app.use(express.json());

// form 타입의 데이터 전송을 허용
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public'))); //to use static asset (정적 리소스 공개)

app.set('views', __dirname + '/views'); // 뷰 파일이 있는 디렉토리를 설정
app.set('view engine', 'ejs'); // 뷰 엔진으로 EJS 사용 선언

var companyId = "M202111592U";

app.get('/', function (req, res) {
  res.send('Hello World');
})

app.get('/signup', function (req, res) {
  res.render('signup');
})

app.get('/login', function (req, res) {
  res.render('login');
})

app.get('/authTest', auth, function(req, res) {
  res.send("정상적으로 로그인 하셨다면 해당 화면이 보여집니다.");
})

app.get('/balance', function(req, res) {
  res.render('balance');
})

app.get('/qrcode', function(req, res) {
  res.render('qrcode');
})

app.get('/qrreader', function(req, res) {
  res.render('qrreader');
})

app.get('/authResult', function (req, res) {
  var authCode = req.query.code;
  var option = {
    method: "POST",
    url: "https://testapi.openbanking.or.kr/oauth/2.0/token",
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      code: authCode,
      client_id: "05b0e8dd-1423-48d3-adcb-caa220a0d316",
      client_secret: "3fb7ad52-239b-4be2-9388-d0c152733e48",
      redirect_uri: "http://localhost:3000/authResult",
      grant_type: "authorization_code"
    }
  }
  request(option, function (err, response, body) {
    if (err) {
      console.error(err);
      throw err;
    }
    else {
      var accessRequestResult = JSON.parse(body);
      console.log(accessRequestResult);
      res.render('resultChild', { data: accessRequestResult });
    }
  })
});

app.post('/signup', function (req, res) {
  var userName = req.body.userName;
  var userEmail = req.body.userEmail;
  var userPassword = req.body.userPassword;
  var userAccessToken = req.body.userAccessToken;
  var userRefreshToken = req.body.userRefreshToken;
  var userSeqNo = req.body.userSeqNo;

  console.log(userName, userEmail, userPassword);

  var sql = "INSERT INTO user (name, email, password, accesstoken, refreshtoken, userseqno) VALUES (?,?,?,?,?,?)"
  connection.query(sql, [userName, userEmail, userPassword, userAccessToken, userRefreshToken, userSeqNo], function (err, result) {
    if (err) {
      console.error(err);
      throw err; // 프로세스 종료
    }
    else {
      res.json();
    }
  });
})

app.post('/login', function (req, res) {
  var userEmail = req.body.userEmail;
  var userPassword = req.body.userPassword;
  console.log(userEmail, userPassword)
  var sql = "SELECT * FROM user WHERE email = ?";
  connection.query(sql, [userEmail], function (err, result) {
    if (err) {
      console.error(err);
      res.json(0);
      throw err;
    }
    else {
      console.log(result);
      if (result.length == 0) {
        res.json(3)
      }
      else {
        var dbPassword = result[0].password;
        if (dbPassword == userPassword) {
          var tokenKey = "f@i#n%tne#ckfhlafkd0102test!@#%"
          jwt.sign(
            {
              userId: result[0].id,
              userEmail: result[0].email
            },
            tokenKey, // ex) 도장찍기, 위조 신분을 못 만들게 하는 역할
            {
              expiresIn: '10d',
              issuer: 'fintech.admin',
              subject: 'user.login.info'
            },
            function (err, token) {
              console.log('로그인 성공', token)
              res.json(token)
            }
          )
        }
        else {
          res.json(2);
        }
      }
    }
  })
})

app.get('/main', function(req, res){
  res.render('main');
})

app.post('/list', auth, function(req, res){
  var user = req.decoded;
  console.log(user);
  var sql = "SELECT * FROM user WHERE id = ?";
  connection.query(sql,[user.userId], function(err, result){
      if(err) throw err;
      else { // 레코드에서 조회 후 요청 전송해야한다. [비동기 방식]
          var dbUserData = result[0];
          console.log(dbUserData);
          var option = {
              method : "GET",
              url : "https://testapi.openbanking.or.kr/v2.0/user/me",
              headers : {
                  Authorization : "Bearer " + dbUserData.accesstoken
              },
              qs : {
                  user_seq_no : dbUserData.userseqno
              }
          }
          request(option, function(err, response, body){
              if(err){
                  console.error(err);
                  throw err;
              }
              else {
                  var listRequestResult = JSON.parse(body);

                  res.json(listRequestResult)
                  console.log(listRequestResult)
              }
          })        
      }
  })
})

app.post('/balance', auth, function(req, res) {
  //사용자 정보 조회
  //사용자 정보를 바탕으로 request (잔액조회 api) 요청 작성하기
  var user = req.decoded;
  var finusernum = req.body.fin_use_num;
  var countnum = Math.floor(Math.random() * 1000000000) + 1;
  var transId = companyId + countnum;
  var transdtime = moment(new Date()).format('YYYYMMDDhhmmss');
  console.log(transdtime);
  var sql = "SELECT * FROM user WHERE id = ?";
  connection.query(sql, [user.userId], function (err, result) {
    if (err) throw err;
    else {
      var dbUserData = result[0];
      console.log(dbUserData);
      var option = {
        method: "GET",
        url: "https://testapi.openbanking.or.kr/v2.0/account/balance/fin_num",
        headers: {
          Authorization: "Bearer " + dbUserData.accesstoken
        },
        qs: {
          bank_tran_id: transId,
          fintech_use_num: finusernum,
          tran_dtime: transdtime
        }
      }
      request(option, function (err, response, body) {
        if (err) {
          console.error(err);
          throw err;
        }
        else {
          var balanceRquestResult = JSON.parse(body);
          res.json(balanceRquestResult)
        }
      })
    }
  })
})

app.post('/transactionList', auth, function(req, res){
  var user = req.decoded;
  var finusernum = req.body.fin_use_num;
  var countnum = Math.floor(Math.random() * 1000000000) + 1;
  var transId = companyId + countnum;
  var transdtime = moment(new Date()).format('YYYYMMDDhhmmss');
  var transddate = moment(new Date()).format('YYYYMMDD'); // "거래일자" 사용자로부터 입력 받기
  console.log(transdtime);
  var sql = "SELECT * FROM user WHERE id = ?";
  connection.query(sql, [user.userId], function (err, result) {
    if (err) throw err;
    else {
      var dbUserData = result[0];
      console.log(dbUserData);
      var option = {
        method: "GET",
        url: "https://testapi.openbanking.or.kr/v2.0/account/transaction_list/fin_num",
        headers: {
          Authorization: "Bearer " + dbUserData.accesstoken
        },
        qs: {
          bank_tran_id: transId,
          fintech_use_num: finusernum,
          inquiry_type: 'A',
          inquiry_base: 'D',
          from_date: transddate,
          to_date: transddate,
          sort_order: 'D',
          tran_dtime: transdtime
        }
      }
      request(option, function (err, response, body) {
        if (err) {
          console.error(err);
          throw err;
        }
        else {
          var transactionListRequestResult = JSON.parse(body);
          res.json(transactionListRequestResult)
        }
      })
    }
  })
}) 

// QR 코드를 읽히면 결제 팝업 생성
app.post('/withdraw', auth, function(req, res) {
  // 사용자 출금 이체 API 수행하기
  console.log(req.body);
  var user = req.decoded;
  var countnum = Math.floor(Math.random() * 1000000000) + 1;
  var transId = companyId + countnum;
  var sql = "SELECT * FROM user WHERE id = ?";
  connection.query(sql, [user.userId], function (err, result) {
    if (err) throw err;
    else {
      var dbUserData = result[0];
      console.log(dbUserData);
      var option = {
        method: "POST",
        url: "https://testapi.openbanking.or.kr/v2.0/transfer/withdraw/fin_num",
        headers: {
          Authorization: "Bearer " + dbUserData.accesstoken,
          'Content-Type': 'application/json; charset=UTF-8'
        },
        json: { // 헤더에 Content-Type이 자동으로 붙도록 만들어줌.
          bank_tran_id: transId,
          cntr_account_type: "N",
          cntr_account_num: "100000000001",
          dps_print_content: "쇼핑몰환불",
          fintech_use_num: "120211159288932125761183",
          wd_print_content: "오픈뱅킹출금",
          tran_amt: "10000",
          tran_dtime: "20210225164000",
          req_client_name: "홍길동",
          req_client_fintech_use_num: "120211159288932125761183",
          req_client_num: "HONGGILDONG1234",
          transfer_purpose: "TR",
          recv_client_name: "권나연",
          recv_client_bank_code: "097",
          recv_client_account_num: "123412341234"
        }
      }
      request(option, function (err, response, body) {
        if (err) {
          console.error(err);
          throw err;
        }
        else {
          console.log("print withdraw result");
          var withdrawRequestResult = body;
          console.log(body);
          res.json(withdrawRequestResult)
        }
      })
    }
  })
})

var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '19980815',
  database: 'fintech'
});
connection.connect();
//connection.end();

app.listen(3000);