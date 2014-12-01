/**
US3269: Implement confidence based routing
 TC1523: Verify updating configuration of managed instances of ConfidenceBasedEscalationClassifier then return to default\

 **/
//QA test case description, verification & assertion check
describe("TC1523: Verify updating configuration of managed instances of ConfidenceBasedEscalationClassifier then return to default\n", function () {
    //QA test setup ----------------------------------------------
    //load modules for testing
    var chai = require('chai');
    var sinon = require('sinon');
    var expect = chai.expect;
    var async = require('async');
    var request = require('request');
    request = request.defaults({jar: true}); //note: this case need cookie for VXML grammar event testing!
    var winston = require('winston'); //console/file logging module for testing
    var os = require('os');

    var nock = require('nock');   //mock library, REST API: post/put/get/delete/...
    var nockOptions = {allowUnmocked: true};

    //define variables for QA test
    var case_ID = 1523;
    // var TEST_HOST = '10.3.41.61'; //change it if machine changed
    // var TEST_PORT = 8080;

    var err_msg;    //temp single error message
    var err_array;  //error message array
    var output_string=''; //result return array
    var output_msg='';  //temp single result return
    var test_startTime;
    var test_endTime; //for time elapse calculation
    var test_elapse = 0;

    // var test_location = 'c:\\LiveAssist_test\\test';                        //test base folder
    // var testlog_location = 'c:\\LiveAssist_test\\test\\test_outputs';        //test log folder
    // var logFile = testlog_location + '\\' + case_ID + '.log';    //test log file name
    // var logger;
	var TestConfig  = require('../Config/TestConfig.js');
    var TEST_HOST = TestConfig.options.server; //Ex: '10.3.41.59' change it if test server changed
    var TEST_PORT = TestConfig.options.port; //ex: '8080', change it if test server changed
    var test_location = TestConfig.options.test_location;              //test base folder
    var testlog_location = test_location + "\\test_outputs";        //test log folder
    var logFile = testlog_location + '\\' + case_ID + '.log';    //test log file name
	var logger;


    //---------------------------------------------
    //QA http test client setup ------------------------------------------
    var test_client = {
        //Get method http client request
        get: function(url, cb){
            request.get({
                    headers: {'content-type': 'application/json'},
                    uri: url
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
        //post method http client request
        post: function(url, bodyParam, cb){
            request.post({
                    headers: {'content-type': 'application/json'},
                    uri: url,
                    body: bodyParam
                }
                ,function (err, res, body) {
                    if(err){
                        err_msg='\ntest client http post request found error: ' + err;
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

    //-------------------------------------------------------

    before(function(done1){
        //record test start time
        test_startTime = new Date();

        //initialize for testing
        err_msg='';    //temp single error message
        err_array=[];  //error message array
        //      output_string=''; //result return array
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
        //
        done1();
    });

    after(function(done2){
        async.series({
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


    it("TC1523: Verify updating configuration of managed instances of ConfidenceBasedEscalationClassifier for example confidenceThreshold to equal 0.7 then return to default\\n", function (done) {
        //start async series task ~~~~~~~~~~~~~~~~
        var testBaseURL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/rest/escalationClassifiers';
        var sessionID = ''; //set default 1

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
                var testBodyParam = "";
                test_client.post(testBaseURL + '/ConfidenceBasedEscalationClassifier/setProperty/confidenceThreshold/0.7' , testBodyParam, function(err, res, body){
                    if(err){
                        err_msg='Error found from http delete request on /sessions' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        callback(err, 1);
                    }
                    output_string += '\n\nDebug: send delete session request done\n\n';//for debugging
                    output_string += '\nResponse: ' + res;//for debugging
                    output_string += '\nBody: ' + body;//for debugging

                    var result=[res, body];
                    callback(null, result);
                });
            },
			function(callback){
                //Debug API - delete all sessions (status: 204)
                var testBodyParam = "";
                test_client.post(testBaseURL + '/ConfidenceBasedEscalationClassifier/setProperty/confidenceThreshold/0.5' , testBodyParam, function(err, res, body){
                    if(err){
                        err_msg='Error found from http delete request on /sessions' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        callback(err, 2);
                    }
                    output_string += '\n\nDebug: send delete session request done\n\n';//for debugging
                    output_string += '\nResponse: ' + res;//for debugging
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
                //
                nock.restore();
                //
                if(err){
                    console.log('\n\nERROR found during http request sending to the server, quit!\n' + err + '\n\n');
                    expect(err).to.have.length(0);
                    done();
                }

                //using try & catch block to customize the output message if the case failed
                try{
                    //http response return assertion check
                    expect(result[1][0].statusCode).to.eql(200);
             		expect(result[1][1]).to.match(/\"name":"ConfidenceBasedEscalationClassifier\"/);
					expect(result[1][1]).to.match(/\"implementationClassName\":\"com.nuance.liveassist.server.escalation.ConfidenceBasedEscalationClassifier\"/);
					expect(result[1][1]).to.match(/\"source\":\"PrePackaged\"/);
					expect(result[1][1]).to.match(/\"properties\":{\"confidenceThreshold\":\"0.7\"}/);
					
					
					 expect(result[2][0].statusCode).to.eql(200);
             		expect(result[2][1]).to.match(/\"name":"ConfidenceBasedEscalationClassifier\"/);
					expect(result[2][1]).to.match(/\"implementationClassName\":\"com.nuance.liveassist.server.escalation.ConfidenceBasedEscalationClassifier\"/);
					expect(result[2][1]).to.match(/\"source\":\"PrePackaged\"/);
					expect(result[2][1]).to.match(/\"properties\":{\"confidenceThreshold\":\"0.5\"}/);
					

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
                    fail_msg += '\n\nOutput string:\n' + output_string;
                    logger.info(fail_msg);
                    //
                    var fail_error = 'Test case ' + case_ID + ' failed! Please check case log for details';
                    var err_ret = new ReferenceError(fail_error);
                    done(err_ret);
                }
            });
    });

});

