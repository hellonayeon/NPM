var http = require("http");

http.createServer(function (req, res) { // node.js 가 기본적으로 가지고 있는 서버 생성 라이브러리 사용
    var body = "hello Server";
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end("안녕하세요")
}).listen(3000); // 3000 port