/**
 TC1014: Verify that Live Assist application context configuration when applicationID not exist
 **/
//QA test case description, verification & assertion check
describe("TC1014: Verify that Live Assist application context configuration when applicationID not exist", function () {
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
    var case_ID = 1014;

    var err_msg;    //temp single error message
    var err_array;  //error message array
    var output_string=''; //result return array
    var output_msg='';  //temp single result return
    var test_startTime;
    var test_endTime; //for time elapse calculation
    var test_elapse = 0;

    //global env settings
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
                    headers: {'content-type': 'application/json'},
                    uri: url,
                    body: bodyParam,
                    json: true
                }
                ,function (err, res, body) {
                    if(err){
                        err_msg='\ntest client http get request found error: ' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        cb(err, res, body);
                    }else{
                        cb(null, res, body);
                    }
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

        done1();

    });

    after(function(done2){
        async.series({
            remove_logger: function(callback){
                logger.remove(winston.transports.Console);
                logger.remove(winston.transports.File);
                callback(null, 1);
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
                                callback(err, 3);
                            }else{
                                callback(null, 3);
                            }
                        }
                    );
                }, 2000);
            }

        },function(err,results){
            if(err){
                console.log('\nError happened from the case after block!\n');
            }
            //calculate test elapse
            test_endTime = new Date();
            test_elapse = test_endTime - test_startTime;
            console.log('Test elapsed=' + test_elapse);
            //
            done2();
        });
    });

    it("TC1014: Verify that Live Assist application context configuration when applicationID not exist", function (done) {
        //start async series task ~~~~~~~~~~~~~~~~
        var testBaseURL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/rest/mrcpapp';
        var testDebutURL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/rest/debug';

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
                test_client.delete(testDebutURL + '/sessions', function(err, res, body){
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
                //
                var testBodyParam = JSON.stringify({
                    organizationID: "Nuance",
                    applicationID: "Test1",             //'Test1' not exist or as a valid applicationID
                    ani: "sip:4627@QA_test_server",
                    dnis: "sip:8665551234@127.0.0.1:5066",
                    externalSessionID: "0a0325e7_000047e1_52e050ba_00b1_0001",
                    "audioServerAddress": "localhost:8081"
                });

                test_client.post(testBaseURL + '/startSession', testBodyParam, function(err, res, body){
                    if(err){
                        err_msg='Error found from http post request on /startSession' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        callback(err, 2);
                    }

                    //var body_ret = JSON.parse(body);
                    var body_ret = body;

                    output_string += '\n\nDebug: send post request \'\/startSession\' done\n\n';//for debugging
                    output_string += '\npost test body param: ' + testBodyParam; //for debugging
                    output_string += '\nResponse: ' + res;//for debugging
                    output_string += '\nBody: ' + body_ret;//for debugging

                    //get session ID from the response
                    //sessionID = body_ret.match(/sessionID:(.+)/)[1]; //pattern search found the real sessionID #
                    sessionID = body_ret.sessionID;

                    var msg = '\nSessionID from /startSession is: ' + sessionID + '\n';
                    console.log(msg);
                    output_string += msg;

                    var result=[res, body_ret];
                    callback(null, result);
                });
            },
            function(callback){
                //
                setTimeout(function(){
                    console.log('\nwait 1 second for server\n'); //debugging
                    callback(null, 3);
                }, 1000);
            },
            function(callback){
                //
                var testBodyParam = JSON.stringify({
                    "sessionID": sessionID,
                    "configurationName":"mainmenu",
                    "grammars":["http://mt-ray-vm06:8080/liveassist/data/vxmldemo/travel/mainmenu.grxml"]
                });

                test_client.post(testBaseURL + '/startRecognition ', testBodyParam, function(err, res, body){
                    if(err){
                        err_msg='Error found from http post request on /startRecognition' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        callback(err, 4);
                    }

                    //var body_ret = JSON.parse(body);
                    var body_ret = body;

                    output_string += '\n\nDebug: send post request \'\/startRecognition \' done\n\n';//for debugging
                    output_string += '\npost test body param: ' + testBodyParam; //for debugging
                    output_string += '\nResponse: ' + res;//for debugging
                    output_string += '\nBody: ' + body_ret;//for debugging

                    //get session ID from the response
                    //sessionID = body_ret.match(/sessionID:(.+)/)[1]; //pattern search found the real sessionID #
                    interactionID = body_ret.interactionID;
                    sendAudio = body_ret.sendAudio;

                    var msg = '\ninteractionID from /startRecognition  is: ' + interactionID + '\n';
                    var msg = msg + 'sendAudio from /startRecognition is: ' + sendAudio + '\n';
                    console.log(msg);
                    output_string += msg;

                    var result=[res, body_ret];
                    callback(null, result);
                });
            },
            function(callback){
                //
                setTimeout(function(){
                    console.log('\nwait 1 second for server\n'); //debugging
                    callback(null, 5);
                }, 1000);
            },
            function(callback){
                //Debug API - get session/{id}, return specific session info in an object
                test_client.get(testDebutURL + '/session/' + sessionID, function(err, res, body){
                    if(err){
                        err_msg='Error found from http get request on /session' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        callback(err, 6);
                    }
                    output_string += '\n\nDebug: send get session request on /session done\n\n';//for debugging
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
                    callback(null, 7);
                }, 1000);
            },
            function(callback){
                //
                var testBodyParam = JSON.stringify({
                    sessionID: sessionID
                });

                test_client.post(testBaseURL + '/endSession', testBodyParam, function(err, res, body){
                    if(err){
                        err_msg='Error found from http post request on /endSession' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        callback(err, 8);
                    }

                    //var body_ret = JSON.parse(body);
                    var body_ret = body;

                    output_string += '\n\nDebug: send post request \'\/endSession\' done\n\n';//for debugging
                    output_string += '\npost test body param: ' + testBodyParam; //for debugging
                    output_string += '\nResponse: ' + res;//for debugging
                    output_string += '\nBody: ' + body_ret;//for debugging

                    var msg = '\nSessionID from /endSession is: ' + sessionID + '\n';
                    console.log(msg);
                    output_string += msg;

                    var result=[res, body_ret];
                    callback(null, result);
                });
            },
            function(callback){
                //
                setTimeout(function(){
                    console.log('\nwait 1 second for server\n'); //debugging
                    callback(null, 9);
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
                    expect(result[2][0].statusCode).to.eql(200);
                    expect(result[2][1].sessionID).to.match(/session:/)
                        .and.to.match(/default:.+/);                    //########### need check ##############

                   expect(result[6][0].statusCode).to.eql(200);
                    expect(result[6][1]).to.match(/\"id\":/)
                        .and.to.have.string(sessionID)
                        .and.to.match(/\"varName\":\"default\"/)
                        .and.to.match(/\"varVersion\":\".+\"/)
                        .and.to.match(/\"ani\":\"4627\"/)
                        .and.to.match(/\"dnis\":\"8665551234\"/)
                        .and.to.match(/\"externalSessionID\":\"0a0325e7_000047e1_52e050ba_00b1_0001\"/)
                        .and.to.match(/\"applicationConfiguration\":\{/)
                        .and.to.match(/\"id\":\"0\"/)
                        .and.to.match(/\"name\":\"default\"/)
                        .and.to.match(/\"organizationIDApplicationIDList\":null/)
                        .and.to.match(/\"dnisList\":null/)
                        .and.to.match(/\"contextList\":null/);
//"id":"session:default:4d79c3a0-d2b1-43a6-b854-a1c90a2db508","varName":"default","varVersion":"1.0","ani":"4627","dnis":"8665551234","aai":null,
// "externalSessionID":"0a0325e7_000047e1_52e050ba_00b1_0001","audioRelayServerUrl":"http://10.3.41.73:8081","applicationConfiguration":{"id":"0","name":"default",
// "organizationIDApplicationIDList":null,"dnisList":null,"contextList":null},"recognitionContext":null,"canStreamAudio":true,"currentInteractionId":null,"interactions":[]
// ,"shouldEscalate":false,"escalated":false,"sessionStats":{"stepTimes":{"CREATE":{"date":1403292418208},"START_SESSION":{"date":1403292418208}}},"viewName":null,
// "variableNames":null,"outcome":null,"currentInteraction":null

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

