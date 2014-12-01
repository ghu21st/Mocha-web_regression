//sample http server by express.js
var express = require('express');
var http = require('http');
var app = express();
var server;

//Find local test machine IP
var os = require('os');
var k, k2;
var interfaces = os.networkInterfaces();
var addresses = [];
for (k in interfaces) {
    for (k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family == 'IPv4' && !address.internal) {
            addresses.push(address.address)
        }
    }
}
var localIp=addresses.toString();
console.log(localIp);
//
var http_port = 3000;

//Create HTTP server with basic response
var count = 0;
app.get('/', function(req,res){
    res.send('Hello world!\n' + count);
    --count;
})

app.get('/visit', function(req, res){
    res.send('visit count: ' + count);
    ++count;

})

console.log('http server started at port:' + http_port + ' IP:' + localIp);
server = http.createServer(app).listen(http_port, localIp);

//close http server after timeout
setTimeout(function(){
   server.close();
   console.log('http server stopped at port:' + http_port + ' IP:' + localIp);

    process.exit(0);
}, 30000);


