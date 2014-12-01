/**
 TC2999: cleanup Live Assist server sessions
  **/
//QA test case description, verification & assertion check
    //QA test setup ----------------------------------------------
    //define variables for QA test
    var case_ID = 2999;

//global env settings
var TestConfig  = require('../Config/TestConfig.js');
var TEST_HOST = TestConfig.options.server; //Ex: '10.3.41.59' change it if test server changed
var TEST_PORT = TestConfig.options.port; //ex: '8080', change it if test server changed

var err_msg = '';    //temp single error message
    var err_array = [];  //error message array
    var output_msg = '';  //temp single result return
    var output_string = '';
    var test_startTime;
    var test_endTime; //for time elapse calculation
    var test_elapse = 0;

    var test_location = 'c:\\LiveAssist_test\\test\\WEB_SIMU';          //test base folder
    var testlog_location = 'c:\\LiveAssist_test\\test\\WEB_SIMU\\Log';  //test log folder
    var logFile = testlog_location + '\\' + case_ID + '.log';     //test log file name
    var logger;

    //load modules for testing
    var async = require('async');
    var request = require('request');
    request = request.defaults({jar: true}); //note: this case need cookie for VXML grammar event testing!
    var winston = require('winston'); //console/file logging module for testing
    var os = require('os');
    var nock = require('nock');   //mock library, REST API: post/put/get/delete/...
    var nockOptions = {allowUnmocked: true};

    //---------------------------------------------
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
            request.post({
                    headers: {'content-type': 'application/x-www-form-urlencoded'},
                    uri: url,
                    body: bodyParam
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
        },
        delete: function(url, cb){
            request.del(url, function(err, res, body){
                if(err){
                    err_msg='\ntest client http get request found error: ' + err;
                    err_array.push(err_msg);
                    console.log(err_msg, err);
                    cb(err, res, body);
                }
                cb(null, res, body);
            });
        }
    };
//--------------------------------------------------------------------
//Simulator initialization
    //record test start time
    test_startTime = new Date();

    //setup QA logging
    require('fs').unlink(logFile, function(err){
        if(err){
            console.log('Remove file warning: can not open the file or no ' + logFile + ' exist at all\n');
        }
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

    });
    //
    //for App driver setup
    var BaseDebugURL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/rest/debug';
    var sessionID = 1; //set default 1

    //trace HTTP API call
    nock.recorder.rec();

    async.series([
        function(callback){
            //special timeout here to make sure /vxmlappexit disconnect NEO NMSP client
            setTimeout(function(){
                console.log('\nwait 1 second for server\n'); //debugging
                callback(null, 0);
            }, 1000);
        },
        function(callback){
            //Debug API - delete all sessions (status: 204)
            test_client.delete(BaseDebugURL + '/sessions', function(err, res, body){
                if(err){
                    err_msg='Error found from http delete request on /sessions' + err;
                    err_array.push(err_msg);
                    console.log(err_msg, err);
                    callback(err, 1);
                }
                output_string += '\n\nDebug: send delete session request done\n\n';//for debugging
                output_string += '\nResponse: ' + res.statusCode;//for debugging
                output_string += '\nBody: ' + body;//for debugging

                var result=[res, body];
                callback(null, result);
            });
        },
        function(callback){
            //Debug API - get sessions (200, body: [0])
            test_client.get(BaseDebugURL + '/sessions', function(err, res, body){
                if(err){
                    err_msg='Error found from http get request on /sessions' + err;
                    err_array.push(err_msg);
                    console.log(err_msg, err);
                    callback(err, 2);
                }
                output_string += '\n\nDebug: send get session request on /sessions done\n\n';//for debugging
                output_string += '\nResponse: ' + res.statusCode;//for debugging
                output_string += '\nBody: ' + body;//for debugging

                var result=[res, body];
                callback(null, result);
            });
        },
        function(callback){
            //
            setTimeout(function(){
                console.log('\nwait 1 second for server\n'); //debugging
                callback(null, 3);
            }, 1000);
        }
    ],
    function(err, result){
        if(err){
            console.log('\n\nERROR found during http request sending to the server, quit!\n' + err + '\n\n');
            expect(err).to.have.length(0);
        }

        //using try & catch block to customize the output message if the case failed

        try{
            var fail_error = '';
            var err_ret;

            //http response return assertion check
            if(result[1][0].statusCode != 204){
                fail_error = '\n' + case_ID + ' failed delete sessions! status code return wrong. \n';
                console.log('\n Check:' + result[1][0].statusCode);
                throw fail_error;
            }

            if(result[2][0].statusCode != 200){
                fail_error = '\n' + case_ID + ' failed to check sessions!\n';
                console.log('\n Check' + result[2][0].statusCode);
                throw fail_error;

            }

            if(result[2][1] != '[]'){
                fail_error = '\n' + case_ID + ' failed to delete sessions, result not 0!\n';
                console.log('\n Check' + result[2][1]);

                throw fail_error;

            }

             //log for post test check
            var pass_msg = '\nWeb simulator operation passed! ' + 'Output string:\n' + output_string + result[2][1] ;
            // pass_msg += '\n\nHttp server status code: ' + resReturn.statusCode + '\nHttp server body return: \n' + bodyReturn;
            logger.info(pass_msg);
            //
        }catch(e){
            //log for post test check
            var fail_msg = '\nWeb simulator failed! ' + 'Error:\n' + e;
            fail_msg += '\n\nOutput string\n' + output_string;
            logger.info(fail_msg);
            //
        }

        logger.remove(winston.transports.Console);
        logger.remove(winston.transports.File);

        //calculate test elapse
        test_endTime = new Date();
        test_elapse = test_endTime - test_startTime;
        console.log('Test elapsed=' + test_elapse);

    });
//


