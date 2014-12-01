/**
TC102: Verify that express(http server) + request + nockjs basic setup and URL test (sample test)
Note:
 Test RPC over HTTP or REST API with QA customized sample http server + request + nockjs
 **/
//QA test case description, verification & assertion check
describe("TC102: Verify that express(http server) + request + nockjs basic setup and URL test (sample test)", function () {
    //QA test setup ----------------------------------------------
    //load modules for testing
    var chai = require('chai');
    var sinon = require('sinon');
    var expect = chai.expect;
    var async = require('async');
    var request = require('request');
    request = request.defaults({jar: true}); //note: this case need cookie for VXML grammar event testing!
    var winston = require('winston'); //console/file logging module for testing

    var nock = require('nock');   //mock library, REST API: post/put/get/delete/...
    var nockOptions = {allowUnmocked: true};

    //define variables for QA test
    var case_ID = 102;
    var TEST_HOST = 'http://localhost';
    var TEST_PORT = 3000 + case_ID;

    var err_msg;    //temp single error message
    var err_array;  //error message array
    var output_string=''; //result return array
    var output_msg='';  //temp single result return
    var test_startTime;
    var test_endTime; //for time elapse calculation
    var test_elapse = 0;

    var test_location = 'c:\\LiveAssist_test\\test';                        //test base folder
    var testlog_location = 'c:\\LiveAssist_test\\test\\test_outputs';        //test log folder
    var logFile = testlog_location + '/' + case_ID + '.log';    //test log file name
    var logger;

    //---------------------------------------------
    //QA http server setup
    //sample http server by express.js
    var express = require('express');
    var http = require('http');
    var os = require('os');
    var app = express();
    var server;
    var http_port = TEST_PORT;
    var localIp;

    var test_server = {
        setup: function(){
            //Find local test machine IP
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
            localIp=addresses.toString();
            TEST_HOST = localIp;
            console.log(localIp);


        },
        start: function(){
            app.use(express.bodyParser());

            //Create HTTP server with basic response
            var count = 0;
            app.get('/', function(req,res){
                count = 0;
                res.send('Hello, QA test! \n');

            });
            app.get('/counter/reset', function(req, res){
                count = 0;
                res.send('counter reset');

            });
            app.get('/counter/increase', function(req, res){
                ++count;
                res.send('counter increased');

            });
            app.get('/counter/decrease', function(req,res){
                --count;
                res.send('counter decreased');
            });
            app.get('/counter/query', function(req,res){
                res.send('counter value: ' + count);
            });
            app.post('/createQuery', function(req, res){
                var message = req.body.partA + '-' + req.body.partB;
                res.send (message);
            });
            //console.log('http server started at port:' + http_port + ' IP:' + localIp);
            server = http.createServer(app).listen(http_port, localIp);
        },
        stop: function(){
            server.close();
            console.log('http server stopped at port:' + http_port + ' IP:' + localIp);
        }

    };

    //------------------------------------

    //QA http test client setup ------------------------------------------
    var test_client = {
        //Get method http client request
        get: function(url, cb){
            request(url, function(err, res, body){
                if(err){
                    err_msg='\ntest client http get request found error: ' + err;
                    err_array.push(err_msg);
                    console.log(err_msg, err);
                    cb(err, res, body);
                }
                cb(null, res, body);
            });
        },
        //post method http client request
        post: function(url, bodyParam, cb){
            request(
                { method: 'post'
                    , uri: url
                    , form: {
                    partA: bodyParam.partA,
                    partB: bodyParam.partB
                  }
                }
                ,function (err, res, body) {
                    if(err){
                        err_msg='\ntest client http get request found error: ' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        cb(err, res, body);
                    }
                    cb(null, res, body);
                }
            );
        }
    };

    //-------------------------------------------------------

    before(function(done1){
        //record test start time
        test_startTime = new Date();

        //initialize for testing
        err_msg='';    //temp single error message
        err_array=[];  //error message array
        output_string=''; //result return array
        output_msg='';  //temp single result return

        //setup QA logging
        require('fs').unlink(logFile, function(err){
            if(err){
                console.log('Remove file error or no ' + logFile + ' exist at all\n');
            }
        });
        logger = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)({level: 'info'}),
                new (winston.transports.File)({
                    filename: logFile,
                    level: 'info',
                    maxsize: 10240,
                    maxFiles: 100,
                    json: false,
                    timestamp: false
                })
            ]
        });
        logger.info('Test started and logging at'+ logFile);
        //logger.extend(console); //log everything from console to logger(save to log file)

        //start http server
        test_server.setup(); //setup express http server
        test_server.start(); //start http server

        //
        done1();
    });

    after(function(done2){
        async.series({
            restoring: function(callback){
                //cleanup and restore nock
     //           nock.cleanAll();
                nock.restore();
                callback(null, 1);
            },
            stop_http_server: function(callback){
                //close http server after timeout
                test_server.stop();
                callback(null, 2);

            },
            remove_logger: function(callback){
                logger.remove(winston.transports.Console);
                logger.remove(winston.transports.File);
                callback(null, 3);
            },
            remove_modules: function(callback){
                setTimeout(function(){
                    //calculate test elapse
                    test_endTime = new Date();
                    test_elapse = test_endTime - test_startTime;
                    console.log('Test elapsed=' + test_elapse);

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
                                callback(err, 4);
                            }else{
                                callback(null, 4);
                            }
                        }
                    );
                }, 2000);
            }

        },function(err,results){
            if(err){
                console.log('\nError happened from the case afterEach block!\n');
            }
            //calculate test elapse
            test_endTime = new Date();
            test_elapse = test_endTime - test_startTime;
            console.log('Test elapsed=' + test_elapse);
            //
            done2();
        });
    });


    it("TC102: Verify that express(http server) + request + nockjs test (sample test)", function (done) {
        //start async series task ~~~~~~~~~~~~~~~~
        var testBaseURL = 'http://'+TEST_HOST+':'+TEST_PORT;

        //create http server mocking by nockjs
        var scope = nock(testBaseURL, nockOptions)
            .get('/')
            .reply(201, 'nock mocked base URL')
            .get('/counter/reset')
            .reply(201, 'nock mocked reset')
            .get('/counter/increase')
            .reply(201, 'nock mocked increased')
            .get('/counter/decrease')
            .reply(201, 'nock mocked decreased')
            .get('/counter/query')
            .reply(201, 'nock mocked query');

        nock(testBaseURL)
            .post('/createQuery', 'partA=test1&partB=test2')
            .reply(200, "nock1-nock2");

       //nock.recorder.rec();

        async.series([
            function(callback){
                //send the first request '/start.vxml
                test_client.get(testBaseURL + '/', function(err, res, body){
                    if(err){
                        err_msg='Error found from test_client request' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        callback(err, 1);
                    }
                    output_string += '\n\nDebug: send get request \'\/\' done\n\n';//for debugging
                    output_string += '\nResponse: ' + res;//for debugging
                    output_string += '\nBody: ' + body;//for debugging

                    var result=[res, body];
                    callback(null, result);
                });
            },
            function(callback){
                // send the second request '/vxmlappdialog?sessionid=0a0325e7_000011a2_520c0d06_0006_0001'
                test_client.get(testBaseURL + '/counter/reset', function(err, res, body){
                    if(err){
                        err_msg='Error found from test_client request' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        callback(err, 3);
                    }
                    output_string += '\n\nDebug: send get request \'\/counter\/reset\' done\n\n';//for debugging
                    output_string += '\nResponse: ' + res;//for debugging
                    output_string += '\nBody: ' + body;//for debugging

                    var result=[res, body];
                    callback(null, result);
                });
            },
            function(callback){
                // send the second request '/vxmlappdialog?sessionid=0a0325e7_000011a2_520c0d06_0006_0001'
                test_client.get(testBaseURL + '/counter/increase', function(err, res, body){
                    if(err){
                        err_msg='Error found from test_client request' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        callback(err, 3);
                    }
                    output_string += '\n\nDebug: send get request \'\/counter\/increase\' done\n\n';//for debugging
                    output_string += '\nResponse: ' + res;//for debugging
                    output_string += '\nBody: ' + body;//for debugging

                    var result=[res, body];
                    callback(null, result);
                });
            },
            function(callback){
                // send the second request '/vxmlappdialog?sessionid=0a0325e7_000011a2_520c0d06_0006_0001'
                test_client.get(testBaseURL + '/counter/decrease', function(err, res, body){
                    if(err){
                        err_msg='Error found from test_client request' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        callback(err, 3);
                    }
                    output_string += '\n\nDebug: send get request \'\/counter\/decrease\' done\n\n';//for debugging
                    output_string += '\nResponse: ' + res;//for debugging
                    output_string += '\nBody: ' + body;//for debugging

                    var result=[res, body];
                    callback(null, result);
                });
            },
            function(callback){
                // send the second request '/vxmlappdialog?sessionid=0a0325e7_000011a2_520c0d06_0006_0001'
                test_client.get(testBaseURL + '/counter/query', function(err, res, body){
                    if(err){
                        err_msg='Error found from test_client request' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        callback(err, 3);
                    }
                    output_string += '\n\nDebug: send get request \'\/counter\/query\' done\n\n';//for debugging
                    output_string += '\nResponse: ' + res;//for debugging
                    output_string += '\nBody: ' + body;//for debugging

                    var result=[res, body];
                    callback(null, result);
                });
            },
            function(callback){
                // send the third request post '/vxmlappgrammarevent' with grammar input change in the body msg
                var testBodyParam = {partA: 'test1', partB: 'test2'};
                test_client.post(testBaseURL + '/createQuery', testBodyParam, function(err, res, body){
                    if(err){
                        err_msg='Error found from test_client request' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        callback(err, 3);
                    }
                    output_string += '\n\nDebug: send post request \'\/createQuery\' done\n\n';//for debugging
                    output_string += '\npost test body param: ' + JSON.stringify(testBodyParam); //for debugging
                    output_string += '\nResponse: ' + res;//for debugging
                    output_string += '\nBody: ' + body;//for debugging

                    var result=[res, body];
                    callback(null, result);
                });
            },
            function(callback){
                // send the second request '/vxmlappdialog?sessionid=0a0325e7_000011a2_520c0d06_0006_0001'
                test_client.get(testBaseURL + '/counter/increase', function(err, res, body){
                    if(err){
                        err_msg='Error found from test_client request' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        callback(err, 3);
                    }
                    output_string += '\n\nDebug: send get request \'\/counter\/increase\' done\n\n';//for debugging
                    output_string += '\nResponse: ' + res;//for debugging
                    output_string += '\nBody: ' + body;//for debugging

                    var result=[res, body];
                    callback(null, result);
                });
            },
            function(callback){
                // send the second request '/vxmlappdialog?sessionid=0a0325e7_000011a2_520c0d06_0006_0001'
                test_client.get(testBaseURL + '/counter/decrease', function(err, res, body){
                    if(err){
                        err_msg='Error found from test_client request' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        callback(err, 3);
                    }
                    output_string += '\n\nDebug: send get request \'\/counter\/decrease\' done\n\n';//for debugging
                    output_string += '\nResponse: ' + res;//for debugging
                    output_string += '\nBody: ' + body;//for debugging

                    var result=[res, body];
                    callback(null, result);
                });
            },
            function(callback){
                // send the second request '/vxmlappdialog?sessionid=0a0325e7_000011a2_520c0d06_0006_0001'
                test_client.get(testBaseURL + '/counter/query', function(err, res, body){
                    if(err){
                        err_msg='Error found from test_client request' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        callback(err, 3);
                    }
                    output_string += '\n\nDebug: send get request \'\/counter\/query\' done\n\n';//for debugging
                    output_string += '\nResponse: ' + res;//for debugging
                    output_string += '\nBody: ' + body;//for debugging

                    var result=[res, body];
                    callback(null, result);
                });
            },
            function(callback){
                // send the third request post '/vxmlappgrammarevent' with grammar input change in the body msg
                var testBodyParam = {partA: 'test1', partB: 'test2'};
                    test_client.post(testBaseURL + '/createQuery', testBodyParam, function(err, res, body){
                    if(err){
                        err_msg='Error found from test_client request' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        callback(err, 3);
                    }
                    output_string += '\n\nDebug: send post request \'\/createQuery\' done\n\n';//for debugging
                    output_string += '\npost test body param: ' + JSON.stringify(testBodyParam); //for debugging
                    output_string += '\nResponse: ' + res;//for debugging
                    output_string += '\nBody: ' + body;//for debugging

                    var result=[res, body];
                    callback(null, result);
                });
            }
        ],
            function(err, result){
                if(err){
                    console.log('\n\nERROR found during http request sending to the server, quit!\n' + err + '\n\n');
                    expect(err).to.have.length(0);
                    done();
                }

                //using try & catch block to customize the output message if the case failed
                try{
                    //http response return assertion check
                    expect(result[0][0].statusCode).to.eql(201);
                    expect(result[0][1]).to.match(/nock mocked base URL/);

                    expect(result[1][0].statusCode).to.eql(201);
                    expect(result[1][1]).to.match(/nock mocked reset/);

                    expect(result[2][0].statusCode).to.eql(201);
                    expect(result[2][1]).to.match(/nock mocked increased/);

                    expect(result[3][0].statusCode).to.eql(201);
                    expect(result[3][1]).to.match(/nock mocked decreased/);

                    expect(result[4][0].statusCode).to.eql(201);
                    expect(result[4][1]).to.match(/nock mocked query/);

                    expect(result[5][0].statusCode).to.eql(200);
                    expect(result[5][1]).to.match(/nock1-nock2/);

                    expect(result[6][0].statusCode).to.eql(200);
                    expect(result[6][1]).to.match(/counter increased/);

                    expect(result[7][0].statusCode).to.eql(200);
                    expect(result[7][1]).to.match(/counter decreased/);

                    expect(result[8][0].statusCode).to.eql(200);
                    expect(result[8][1]).to.match(/counter value: 0/);

                    expect(result[9][0].statusCode).to.eql(200);
                    expect(result[9][1]).to.match(/test1-test2/);

                    //logged message check
                   expect(output_string).to.match(/nock mocked/);

                    //Logged error message check
                    expect(err_array).not.to.contain('error');
                    expect(err_array).to.have.length(0);

                    //log for post test check
                    var pass_msg = '\nTest passed! ' + 'Output string:\n' + output_string;
                   // pass_msg += '\n\nHttp server status code: ' + resReturn.statusCode + '\nHttp server body return: \n' + bodyReturn;
                    logger.info(pass_msg);
                    //
                    done();

                }catch(e){
                    //log for post test check
                    var fail_msg = '\nTest failed! ' + 'Error:\n' + JSON.stringify(e);
                    fail_msg += '\n\nOutput string\n' + output_string;
                    logger.info(fail_msg);
                    //
                    var fail_error = 'Test case ' + case_ID + ' failed! Please check case log for details';
                    var err_ret = new ReferenceError(fail_error);
                    done(err_ret);
                }
            });
    });

});

