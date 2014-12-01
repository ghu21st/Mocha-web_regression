/**
 TC103: Verify that express + supertest + nock mcdule on REST API sample test
 Note:
 Test RPC over HTTP or REST API with QA customized sample http server + supertest + nock
 **/
//QA test case description, verification & assertion check
describe("TC103: Verify that express(http server) + request + nockjs basic setup and URL test (sample test)", function () {
    //QA test setup ----------------------------------------------
    //load modules for testing
    var chai = require('chai');
    var sinon = require('sinon');
    var expect = chai.expect;
    var async = require('async');
//    var request = require('request');
    var request = require('supertest');
    var winston = require('winston'); //console/file logging module for testing

    var nock = require('nock');   //mock library, REST API: post/put/get/delete/...
    var nockOptions = {allowUnmocked: true};

    //define variables for QA test
    var case_ID = 103;
    var TEST_HOST = 'http://localhost';
    var TEST_PORT = 3000 + case_ID;

    var err_msg;    //temp single error message
    var err_array;  //error message array
    var output_string=''; //result return array
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
    before(function(done1){
        //record test start time
        test_startTime = new Date();

        //initialize for testing
        err_msg='';    //temp single error message
        err_array=[];  //error message array
        output_string=''; //result return array

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
                    maxsize: 10340,
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


    it("TC103: Verify that express + supertest + nock mcdule on REST API sample test", function (done) {
        //start async series task ~~~~~~~~~~~~~~~~
        var testBaseURL = 'http://'+TEST_HOST+':'+TEST_PORT;

/*        //create http server mocking by nockjs
        var scope = nock(testBaseURL, nockOptions)
            .get('/counter/reset')
            .reply(201, 'nock mocked reset')
            .get('/counter/increase')
            .reply(201, 'nock mocked increased')
            .get('/counter/decrease')
            .reply(201, 'nock mocked decreased')
            .get('/counter/query')
            .reply(201, 'nock mocked query');
        //        .get('/')
        //        .reply(201, 'nock mocked base URL')

        nock(testBaseURL)
            .post('/createQuery', 'partA=test1&partB=test2')
            .reply(200, "nock1-nock2");

        //nock.recorder.rec();
  */
        try{
            request(testBaseURL).get('/')
                .expect(200)
                .expect(/Hello, QA test!/)
                .end(function(err, res){
                    if(err){
                        err_array.push(err);
                        throw err;
                    }
                    output_string += '\nDebug: send get request done';//for debugging
                    output_string += '\nstatusCode: ' + res.statusCode;//for debugging
                    output_string += '\nResponse: ' + res.body;//for debugging
                    console.log(output_string);
                });

            request(testBaseURL).get('/counter/reset')
                .expect(200)
                .expect(/counter reset/)
                .end(function(err, res){
                    if(err){
                        err_array.push(err);
                        throw err;
                    }
                    output_string += '\nDebug: send get request done';//for debugging
                    output_string += '\nstatusCode: ' + res.statusCode;//for debugging
                    output_string += '\nResponse: ' + res.body;//for debugging
                    console.log(output_string);
                });

            var testBodyParam = {partA: 'test1', partB: 'test2'};
            request(testBaseURL).post('/createQuery')
                .send(testBodyParam)
                .expect(200)
                .expect(/test1-test2/)
                .end(function(err, res){
                    if(err){
                        err_array.push(err);
                        throw err;
                    }
                    output_string += '\nDebug: send get request done';//for debugging
                    output_string += '\nstatusCode: ' + res.statusCode;//for debugging
                    output_string += '\nResponse: ' + res.body;//for debugging
                    console.log(output_string);
                });

            //Logged error message check
//            expect(err_array).not.to.contain('error');
//            expect(err_array).to.have.length(0);

            //log for post test check
            var pass_msg = '\nTest passed! ' + 'Output string:\n' + output_string;
//                pass_msg += '\n\nHttp server status code: ' + resReturn.statusCode + '\nHttp server body return: \n' + bodyReturn;
            logger.info(pass_msg);
            //
            done();

        }catch(e){
            //log for post test check
            var fail_msg = '\nTest failed! ' + 'Error:\n' + JSON.stringify(e);
//                fail_msg += '\n\nOutput string\n' + output_string + '\n\nHttp server status code: ' + resReturn.statusCode + '\nHttp server body return: \n' + bodyReturn;
            fail_msg += '\n\nOutput string\n' + output_string;
            logger.info(fail_msg);
            //
            var fail_error = 'Test case ' + case_ID + ' failed! Please check case log for details';
            var err_ret = new ReferenceError(fail_error);
            done(err_ret);
        }
    });

});


