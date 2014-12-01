//Test http server 1
//QA test setup ----------------------------------------------
var chai = require('chai');
var sinonChai = require('sinon-chai');
var sinon = require('sinon');
var expect = chai.expect;
var assert = sinon.assert;
//chai.use(sinonChai);
var async = require('async');

//test case ID
var case_id = 13;

//setup QA test sandbox, spy...
var sandbox_config = {
    injectInto: null,
    properties: ["spy"],
    useFakeTimers: false,
    useFakeServer: false
};
var sandbox = sinon.sandbox.create(sandbox_config);

var spy_httpServerStart;
var spy_httpServerStop;
var spy_httpServerExec;
var spy_httpClientGet;
var spy_httpClientPost;

//sample http server by express.js-----------------------------
var express = require('express');
var http = require('http');
var app = express();

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

//Setup http server & client for testing -------------------------------------------
var TEST_PORT = 3000+ case_id;
var TEST_HOST = localIp;

 var test_server =  {
        server_obj: "",
        count: 0,
        start: function(){
            //start http server
            console.log('http server started at port:' + TEST_PORT + ' IP:' + TEST_HOST);
            this.server_obj = http.createServer(app).listen(TEST_PORT, TEST_HOST);
        },
        stop: function(){
            console.log('http server stopped at port:' + TEST_PORT + ' IP:' + TEST_HOST);
            this.server_obj.close();
        },
        exec: function(){
            app.use(express.logger('QA')); //all express logs send to stdout

            app.get('/', function(req,res){
                res.send('Hello world!');
            });

            app.get('/visit', function(req, res){
                res.send('visit count: ' + this.count);
                ++this.count;

            });
        }
 };

var test_client = {
        get: function(url, cb){
            http_get(TEST_HOST, TEST_PORT, url, cb);
        },
        post: function(url, cb){
            http_post(TEST_HOST, TEST_PORT, url, cb);
        }

};

function http_post(host, port, url, cb){
    var options = {
        host: host,
        port: port,
        path: url,
        method: 'POST'
    };
    var ret = false;
    var req = http.request(options, function(res) {
        var buffer = '';
        res.on('data', function(data) {
            buffer += data;
        });
        res.on('end',function(){
            cb(null,buffer);
        });
    });
    req.end();
    req.on('error', function(e) {
        if (!ret) {
            cb(e, null);
        }
    });
}

function http_get(host, port, url, cb){
    var options = {
        host: host,
        port: port,
        path: url,
        method: 'GET'
    };
    var ret = false;
    var req = http.request(options, function(res) {
        var buffer = '';
        res.on('data', function(data) {
            buffer += data;
        });
        res.on('end',function(){
            cb(null,buffer);
        });
    });
    req.end();
    req.on('error', function(e) {
        if (!ret) {
            cb(e, null);
        }
    });
}

//-------------------------------------------------------
describe("TC13: Test http server 1", function () {
/*    //redirect all the stdout (from target test app/function/API) to a QA test case specific file
        var stdo = require('fs').createWriteStream('/usr/src/test/test_outputs/' + case_id + '_log.txt');
        process.stdout.write = (function(write){
            return function(string, encoding, fd){
                stdo.write(string);
            }
        })(process.stdout.write);
*/
        before(function(done1){
            //setup spy on object.method
            spy_httpServerStart = sandbox.spy(test_server, "start");
            spy_httpServerStop = sandbox.spy(test_server, "stop");
            spy_httpServerExec = sandbox.spy(test_server, "exec");
            spy_httpClientGet = sandbox.spy(test_client, "get");
            spy_httpClientPost = sandbox.spy(test_client, "post");

            //start http server
            test_server.start();
            test_server.exec();
           //
            done1();
        });

        after(function(done2){
            async.series({
                sandbox_restore: function(callback){
                    //restore object.method, no more spy
                    sandbox.restore();
                    callback(null, 1);
                },
                stop_http_server: function(callback){
                    //close http server after timeout
                    test_server.stop();
                    callback(null, 2);

                },
                remove_modules: function(callback){
                  //remove all loaded module before case exit
                    var cnt=0;
                    console.log('\nmodule key #' + Object.keys(require.cache).length);

                    async.whilst(
                        function(){ return cnt < Object.keys(require.cache).length; },
                        function(cb){
                            var key = Object.keys(require.cache).pop();
//                            console.log('\ndeleted module:' + key);
                            delete require.cache[key];
                            cnt++;
                            setTimeout(cb, 20);
                        },
                        function(err){
                            if(err){ //the second #2 task/function found error
                                callback(err, 3);
                            }else{
                                callback(null, 3);
                            }
                        }
                    );
                }
            },function(err,results){
                if(err){
                    console.log('\nError happened from the case afterEach block!\n');
                }
                //

                done2();
            });
        });

        it("test http server response", function (done) {
                //GET /
                test_client.get('/', function(err, res){
                   expect(res).to.match(/Hello world/);
                   console.log('\n'+res+'\n');
                });
                //GET /visit
                test_client.get('/visit', function(err, res){
                    expect(res).to.match(/visit count/);
                    console.log('\n'+res+'\n');
                });

                //spy function check
                assert.callOrder(spy_httpServerStart, spy_httpServerExec, spy_httpClientGet);     //
                expect(spy_httpServerStart.calledOnce).to.eql(true);
                expect(spy_httpServerStop.calledOnce).to.eql(false);

                expect(spy_httpServerExec.called).to.eql(true);
                expect(spy_httpClientGet.called).to.eql(true);
                expect(spy_httpClientPost.called).to.eql(false);

                expect(spy_httpServerStart.calledBefore(spy_httpClientGet)).to.eql(true);
//                expect(spy_httpServerStart.calledBefore(spy_httpClientPost)).to.eql(true);

            done();
        });

});

