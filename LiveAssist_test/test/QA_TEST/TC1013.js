/**
 TC1013: Verify that Live Assist MRCP driven API method /sendRecognitionResult
 **/
//QA test case description, verification & assertion check
describe("TC1013: Verify that Live Assist MRCP driven API method /sendRecognitionResult", function () {
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
    var case_ID = 1013;

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

    it("TC1013: Verify that Live Assist MRCP driven API method /sendRecognitionResult", function (done) {
        //start async series task ~~~~~~~~~~~~~~~~
        var testBaseURL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/rest/mrcpapp';
        var sessionID = 0; //set default 0
        var interactionID = 0;
        var sendAudio = false;
        var completionCause = '';
        var state = '';
        var recognitionResult = '';

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
                //
                var testBodyParam = JSON.stringify({
                    organizationID: "Nuance",
                    applicationID: "Test2",
                    ani: "sip:4641@QA_test_server",
                    dnis: "sip:8665551234@127.0.0.1:5066",
                    externalSessionID: "0a0325e7_000047e1_52e050ba_00b1_0001",
                    audioServerAddress: TEST_HOST + ':8081'

                });

                test_client.post(testBaseURL + '/startSession', testBodyParam, function(err, res, body){
                    if(err){
                        err_msg='Error found from http post request on /startSession' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        callback(err, 1);
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
                    callback(null, 2);
                }, 500);
            },
            function(callback){
                // for grammar parameter on startRecognition method
				var testBaseGrammarURI = ['http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/data/vxmldemo/mrcpapi/callsteering/mainmenu.grxml']; //ex.:http://10.3.41.56:8080/liveassist/data/vxmldemo/mrcpapi/callsteering/mainmenu.grxml
				//var testGrammarIds = ['session:' + 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/data/vxmldemo/mrcpapi/callsteering/mainmenu.grxml' + ' -1 -1 10000'];
				var testGrammarIds = ['session:0x00000001']; //alternative one
				//
                var testBodyParam = JSON.stringify({
                    "sessionID": sessionID,
                    "configurationName":"mainmenu",
                         "grammars":testBaseGrammarURI,
						 "grammarIds":testGrammarIds
                });

                test_client.post(testBaseURL + '/startRecognition ', testBodyParam, function(err, res, body){
                    if(err){
                        err_msg='Error found from http post request on /startRecognition' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        callback(err, 3);
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
                    callback(null, 4);
                }, 500);
            },
            function(callback){
                //sample JSON input from DEV doc https://nuance.jiveon.com/docs/DOC-46485/diff
                var testBodyParam = JSON.stringify({
                    sessionID: sessionID,
                    completionCause:"success",
                    utterance:"http://mtl-da53:90/Nuance/callLogs/Test2/2013/11November/21/00/NUAN-21-01-mtl-da53-0a0325e7_00004175_528d983c_0055_0001-SAVEWAVEFORM.wav",
                    //recognitionResult:"PD94bWwgdmVyc2lvbj0nMS4wJz8+PGVtbWE6ZW1tYSB2ZXJzaW9uPSIxLjAiIHhtbG5zOmVtbWE9Imh0dHA6Ly93d3cudzMub3JnL1RSLzIwMDcvQ1ItZW1tYS0yMDA3MTIxMSIgeG1sbnM6bnVhbmNlPSJodHRwOi8vbnIxMC5udWFuY2UuY29tL2VtbWEiPjxlbW1hOmdyYW1tYXIgaWQ9ImdyYW1tYXJfMSIgcmVmPSJzZXNzaW9uOmh0dHA6Ly8xMC4zLjkuODI6ODA4MC9saXZlYXNzaXN0L3doYXRkb3lvdXdhbnQuZ3J4bWwgLTEgLTEgMTAwMDAiLz48ZW1tYTppbnRlcnByZXRhdGlvbiBpZD0iaW50ZXJwXzEiIGVtbWE6dW5pbnRlcnByZXRlZD0idHJ1ZSIgZW1tYTpjb25maWRlbmNlPSIwLjMxIiBlbW1hOmdyYW1tYXItcmVmPSJncmFtbWFyXzEiIGVtbWE6dG9rZW5zPSJvcGVyYXRvciIgZW1tYTpkdXJhdGlvbj0iMTIyMCIgbnVhbmNlOmVvcy1zaWxlbmNlPSIxMjQwIi8+PC9lbW1hOmVtbWE+Cg=="
                    recognitionResult:"PD94bWwgdmVyc2lvbj0nMS4wJz8+IDxlbW1hOmVtbWEgdmVyc2lvbj0iMS4wIiB4bWxuczplbW1hPSJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDA3L0NSLWVtbWEtMjAwNzEyMTEiIHhtbG5zOm51YW5jZT0iaHR0cDovL25yMTAubnVhbmNlLmNvbS9lbW1hIj4gPGVtbWE6Z3JhbW1hciBpZD0iZ3JhbW1hcl8xIiByZWY9InNlc3Npb246aHR0cDovL210bC1kYTU1LXZtNjo4MDgwL2xpdmVhc3Npc3QvZGF0YS92eG1sZGVtby90cmF2ZWwvbWFpbm1lbnUuZ3J4bWwgLTEgLTEgMTAwMDAiLz4gPGVtbWE6aW50ZXJwcmV0YXRpb24gaWQ9ImludGVycF8xIiBlbW1hOmNvbmZpZGVuY2U9IjAuNzgiIGVtbWE6Z3JhbW1hci1yZWY9ImdyYW1tYXJfMSIgZW1tYTp0b2tlbnM9Imkgd291bGQgbGlrZSB0byBib29rIGEgZmxpZ2h0IiBlbW1hOmR1cmF0aW9uPSIzMjQwIiBlbW1hOm1vZGU9InZvaWNlIiBudWFuY2U6ZW9zLXNpbGVuY2U9Ijg1MCI+IDxpbnRlbnQgY29uZj0iMC43OCI+Ym9vay1mbGlnaHQ8L2ludGVudD4gPFNXSV9saXRlcmFsPmkgd291bGQgbGlrZSB0byBib29rIGEgZmxpZ2h0PC9TV0lfbGl0ZXJhbD4gPFNXSV9tZWFuaW5nPntpbnRlbnQ6Ym9vay1mbGlnaHR9PC9TV0lfbWVhbmluZz4gPC9lbW1hOmludGVycHJldGF0aW9uPiA8L2VtbWE6ZW1tYT4="
                });

                test_client.post(testBaseURL + '/sendRecognitionResult  ', testBodyParam, function(err, res, body){
                    if(err){
                        err_msg='Error found from http post request on /sendRecognitionResult' + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        callback(err, 5);
                    }

                    //var body_ret = JSON.parse(body);
                    var body_ret = body;

                    output_string += '\n\nDebug: send post request \'\/sendRecognitionResult  \' done\n\n';//for debugging
                    output_string += '\npost test body param: ' + testBodyParam; //for debugging
                    output_string += '\nResponse: ' + res;//for debugging
                    output_string += '\nBody: ' + body_ret;//for debugging

                    //get session ID from the response
                    state = body_ret.state;
                    completionCause = body_ret.completionCause;
                    recognitionResult = body_ret.recognitionResult;

                    var msg = '\nstate return from /sendRecognitionResult  is: ' + state + '\n';
                    msg = msg + '\ncompletionCause return from /sendRecognitionResult   is: ' + completionCause + '\n';
                    msg = msg + 'recognitionResult return from /sendRecognitionResult  is: ' + recognitionResult + '\n';

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
                    callback(null, 6);
                }, 500);
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
                        callback(err, 7);
                    }

                    //var body_ret = JSON.parse(body);
                    var body_ret = body;

                    output_string += '\n\nDebug: send post request \'\/endSession\' done\n\n';//for debugging
                    output_string += '\npost test body param: ' + testBodyParam; //for debugging
                    output_string += '\nResponse status: ' + res.statusCode;//for debugging
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
                    callback(null, 8);
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
                    expect(result[1][0].statusCode).to.eql(200);
                    expect(result[1][1].sessionID).to.match(/session:/)
                        .and.to.match(/Nuance-Test2:.+/);

                    expect(result[3][0].statusCode).to.eql(200);
                    expect(result[3][1].interactionID).to.match(/session:/)
                        .and.to.match(/Nuance-Test2:.+-0/);
                    expect(result[3][1].sendAudio).to.match(/true/);

                    expect(result[5][0].statusCode).to.eql(200);
                    expect(result[5][1].completionCause).to.match(/success/);
                    expect(result[5][1].state).to.match(/useLiveAssistResult/);

                    expect(result[7][0].statusCode).to.eql(200);  //note: /endSession API call return '200' but no return value

                    //logged message check
                    //expect(output_string).to.match(/endSession/);

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

