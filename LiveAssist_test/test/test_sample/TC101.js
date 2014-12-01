/**
TC101: Verify that express(http server) + SuperTest basic setup and URL test (sample test)
 **/
//QA test case description, verification & assertion check
describe("TC101: Verify that express(http server) + SuperTest basic setup and URL test (sample test)", function () {
    //QA test setup ----------------------------------------------
    //load modules for testing
    var chai = require('chai');
//    var sinonChai = require('sinon-chai');
    var sinon = require('sinon');
    var expect = chai.expect;
    var assert = sinon.assert;
    var async = require('async');
    var request = require('request');
    request = request.defaults({jar: true}); //note: this case need cookie for VXML grammar event testing!
    var winston = require('winston'); //console/file logging module for testing

//    var nock = require('nock');   //mock library, REST API: post/put/get/delete/...
//    var nockOptions = {allowUnmocked: true};

    //define variables for QA test
    var case_ID = 101;
    var TEST_HOST = '127.0.0.1';
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
    var logFile = testlog_location + '\\' + case_ID + '.log';    //test log file name
    var logger;
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
    var spy_httpServerSetup;

    //QA: hijack the process.stdout.write function
    (function(){
        var log = process.stdout.write;
        process.stdout.write = function(message) {
            var args = Array.prototype.slice.call(arguments);
            //logger.info(message);
            output_string += message;
            //
            return log.apply(this, args);
        };
    })();

    //QA: hijack the process.stderr.write function
    (function(){
        var log = process.stderr.write;
        process.stderr.write = function(message) {
            var args = Array.prototype.slice.call(arguments);
            //logger.info(message);
            output_string += message;
            //
            return log.apply(this, args);
        };
    })();

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
            //Create HTTP server with basic response
            var count = 0;
            app.get('/', function(req,res){
                res.send('Hello world!\n' + count);
                --count;
            });

            app.get('/visit', function(req, res){
                res.send('visit count: ' + count);
                ++count;

            });

            console.log('http server started at port:' + http_port + ' IP:' + localIp);
            server = http.createServer(app).listen(http_port, localIp);

        },
        stop: function(){
            server.close();
            console.log('http server stopped at port:' + http_port + ' IP:' + localIp);
        }

    };

    //------------------------------------

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

        //setup spy on object.method
        spy_httpServerStart = sandbox.spy(test_server, "start");
        spy_httpServerStop = sandbox.spy(test_server, "stop");
        spy_httpServerSetup = sandbox.spy(test_server, "setup");

        //start http server
        test_server.setup(); //setup express http server
        test_server.start(); //start http server
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


    it("TC101: Verify that express(http server) + SuperTest basic setup and URL test (sample test)", function (done) {
        //start async series task ~~~~~~~~~~~~~~~~
        var testBaseURL = 'http://'+TEST_HOST+':'+TEST_PORT;

        var request = require('supertest');

        //using try & catch block to customize the output message if the case failed
            //http response return assertion check
            request = request(testBaseURL);

            try{
                request.get('/visit').expect(200, function(err){
                    err_array.push(err);
                    logger.info(err);
                });

                request.get('/visit').expect('visit count: 0', function(err){
                    err_array.push(err);
                    logger.info(err);

                });

                request.get('/visit').expect(200, function(err){
                    err_array.push(err);
                    logger.info(err);
                });

                request.get('/visit').expect('visit count: 2', function(err){
                    err_array.push(err);
                    logger.info(err);
                });

                //spy function call assertion and check
                expect(spy_httpServerStart.calledOnce).to.eql(true);
                expect(spy_httpServerStop.calledOnce).to.eql(false);
                expect(spy_httpServerSetup.called).to.eql(true);

                //Logged error message check
                expect(err_array).not.to.contain('error');
                expect(err_array).to.have.length(0);

                //log for post test check
                var pass_msg = '\nTest passed! ' + 'Output string:\n' + output_string + '\nError: ' + err_array;
//                pass_msg += '\n\nHttp server status code: ' + resReturn.statusCode + '\nHttp server body return: \n' + bodyReturn;
                logger.info(pass_msg);
                //
                done();

            }catch(e){
                //log for post test check
                var fail_msg = '\nTest failed! ' + 'Error:\n' + JSON.stringify(e);
//                fail_msg += '\n\nOutput string\n' + output_string + '\n\nHttp server status code: ' + resReturn.statusCode + '\nHttp server body return: \n' + bodyReturn;
                logger.info(fail_msg);
                //
                var fail_error = 'Test case ' + case_ID + ' failed! Please check case log for details';
                var err_ret = new ReferenceError(fail_error);
                done(err_ret);
            }
        });

});

