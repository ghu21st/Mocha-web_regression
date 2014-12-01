/**
 US3289: Interaction and Outcome log: write to a file
 TC1543: Verify call log when invoking a complete MRCP sip 
 **/
//QA test case description, verification & assertion check
describe("TC1543: Verify call log when invoking a complete MRCP API with new call log hirachy", function () {
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
	var fs = require('fs');

    //define variables for QA test
    var case_ID = 1543;

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


	//callLog
		var fs = require('fs');
		var dir = require('node-dir');
		
		
	//callLog
		var fileContent = "";
		var callLogFileName = "";
		var currentCallLogSubPath = "";
		var currentRemote_calllog_path ="";
	    var randomNB = Math.floor(Math.random()*9000) + 1000;
		var randomExternalSessionID = "0a0325e7_000011c2_5307b580_"+ case_ID + "_" + randomNB;				
		var date = new Date();
		var current_year = date.getFullYear();		
		var current_day = date.getDate();
		var current_hour = date.getHours();	
		var current_minute = date.getMinutes();
		var current_second = date.getSeconds();		
		var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
	    var current_month_index = date.getMonth();
	    var current_month_number = ("0" + (current_month_index + 1)).slice(-2);//1 + date.getMonth();
		var current_month_name = monthNames[current_month_index];		
		current_minute = date.getMinutes();
		current_second = date.getSeconds();		
		var currentRemote_calllog_path_NoFileName3  ='\\\\' +  TEST_HOST + '\\liveassistcalllog\\'+  "MrcpApiCallSteering\\"+ current_year +"\\"+ current_month_number + current_month_name +"\\"+current_day+"\\"+current_hour;



		

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

    it("TC1543: Verify call log when invoking a complete MRCP sip ", function (done) {
        //start async series task ~~~~~~~~~~~~~~~~
        var testBaseURL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/rest/mrcpapp';
        var testDebugURL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/rest/debug';

        var sessionID = 0; //set default 0
        var interactionID = 0;
        var sendAudio = false;
        var completionCause = '';
        var state = '';
		
		/*
		var randomNB = Math.floor(Math.random()*9000) + 1000;
		var randomExternalSessionID = "0a0325e7_000011c2_5307b580_"+ case_ID + "_" + randomNB;		
		var callLogFileName = "NUAN-"+ randomExternalSessionID +"-LIVEASSIST.xml"; //example: NUAN-0a0325e7_00004175_528d983c_0055_1823-LIVEASSIST.xml
		var fileContent = "";
        var remote_calllog_path ='//' +  "10.3.41.61" + '//liveassistcalllog//'+ callLogFileName;
		*/

        //trace HTTP API call
        nock.recorder.rec();

        async.series([
            function(callback){
                //Debug API - delete all sessions (status: 204)
                test_client.delete(testDebugURL + '/sessions', function(err, res, body){
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
                    applicationID: "MrcpApiCallSteering",
                    ani: "sip:4627@QA_test_server",
                    dnis: "sip:4627@127.0.0.1:5066",
                    // externalSessionID: "0a0325e7_000047e1_52e050ba_00b1_0001", //TODO to update to the randomExternalSessionID 
					 externalSessionID: randomExternalSessionID, //TODO to update to the randomExternalSessionID 
                    "audioServerAddress": "localhost:8081"
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
				var testGrammarIds = ['session:' + 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/data/vxmldemo/mrcpapi/callsteering/mainmenu.grxml' + ' -1 -1 10000'];
				//var testGrammarIds = ['session:0x00000001']; //alternative good one
				
                var testBodyParam = JSON.stringify({
                    "sessionID": sessionID,
                    "configurationName":"mainmenu",
                    //"grammars":["mainmenu.grxml"]
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

                    var msg = 'interactionID from /startRecognition  is: ' + interactionID + '\n';
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
                    // utterance:"http://mtl-da53:90/Nuance/callLogs/Test2/2013/11November/21/00/NUAN-21-01-mtl-da53-0a0325e7_00004175_528d983c_0055_0001-SAVEWAVEFORM.wav",
					utterance:"http://mtl-da53/vxml/NUAN-22-24-mtl-da53-0a0325e7_000011c2_5307b580_00d4_0001-utt001-SAVEWAVEFORM.wav",
                    //recognitionResult:"PD94bWwgdmVyc2lvbj0nMS4wJz8+PGVtbWE6ZW1tYSB2ZXJzaW9uPSIxLjAiIHhtbG5zOmVtbWE9Imh0dHA6Ly93d3cudzMub3JnL1RSLzIwMDcvQ1ItZW1tYS0yMDA3MTIxMSIgeG1sbnM6bnVhbmNlPSJodHRwOi8vbnIxMC5udWFuY2UuY29tL2VtbWEiPjxlbW1hOmdyYW1tYXIgaWQ9ImdyYW1tYXJfMSIgcmVmPSJzZXNzaW9uOmh0dHA6Ly8xMC4zLjkuODI6ODA4MC9saXZlYXNzaXN0L3doYXRkb3lvdXdhbnQuZ3J4bWwgLTEgLTEgMTAwMDAiLz48ZW1tYTppbnRlcnByZXRhdGlvbiBpZD0iaW50ZXJwXzEiIGVtbWE6dW5pbnRlcnByZXRlZD0idHJ1ZSIgZW1tYTpjb25maWRlbmNlPSIwLjMxIiBlbW1hOmdyYW1tYXItcmVmPSJncmFtbWFyXzEiIGVtbWE6dG9rZW5zPSJvcGVyYXRvciIgZW1tYTpkdXJhdGlvbj0iMTIyMCIgbnVhbmNlOmVvcy1zaWxlbmNlPSIxMjQwIi8+PC9lbW1hOmVtbWE+Cg=="
                    recognitionResult:"PD94bWwgdmVyc2lvbj0nMS4wJz8+IDxlbW1hOmVtbWEgdmVyc2lvbj0iMS4wIiB4bWxuczplbW1hPSJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDA3L0NSLWVtbWEtMjAwNzEyMTEiIHhtbG5zOm51YW5jZT0iaHR0cDovL25yMTAubnVhbmNlLmNvbS9lbW1hIj4gPGVtbWE6Z3JhbW1hciBpZD0iZ3JhbW1hcl8xIiByZWY9InNlc3Npb246aHR0cDovL210bC1kYTU1LXZtNjo4MDgwL2xpdmVhc3Npc3QvZGF0YS92eG1sZGVtby90cmF2ZWwvbWFpbm1lbnUuZ3J4bWwgLTEgLTEgMTAwMDAiLz4gPGVtbWE6aW50ZXJwcmV0YXRpb24gaWQ9ImludGVycF8xIiBlbW1hOmNvbmZpZGVuY2U9IjAuNzgiIGVtbWE6Z3JhbW1hci1yZWY9ImdyYW1tYXJfMSIgZW1tYTp0b2tlbnM9Imkgd291bGQgbGlrZSB0byBib29rIGEgZmxpZ2h0IiBlbW1hOmR1cmF0aW9uPSIzMjQwIiBlbW1hOm1vZGU9InZvaWNlIiBudWFuY2U6ZW9zLXNpbGVuY2U9Ijg1MCI+IDxpbnRlbnQgY29uZj0iMC43OCI+Ym9vay1mbGlnaHQ8L2ludGVudD4gPFNXSV9saXRlcmFsPmkgd291bGQgbGlrZSB0byBib29rIGEgZmxpZ2h0PC9TV0lfbGl0ZXJhbD4gPFNXSV9tZWFuaW5nPntpbnRlbnQ6Ym9vay1mbGlnaHR9PC9TV0lfbWVhbmluZz4gPC9lbW1hOmludGVycHJldGF0aW9uPiA8L2VtbWE6ZW1tYT4="
                });

                test_client.post(testBaseURL + '/sendRecognitionResult  ', testBodyParam, function(err, res, body){
                    if(err){
                        err_msg='Error found from http post request on /startRecognition' + err;
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
                    completionCause = body_ret.completionCause;
                    state = body_ret.state;

                    var msg = '\ncompletionCause return from /sendRecognitionResult   is: ' + completionCause + '\n';
                    msg = msg + 'state return from /sendRecognitionResult  is: ' + state + '\n';

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
                    output_string += '\nResponse: ' + res;//for debugging
                    output_string += '\nBody: ' + body_ret;//for debugging

                    var msg = '\nSessionID from /endSession is: ' + sessionID + '\n';
                    console.log(msg);
                    output_string += msg;

                    var result=[res, body_ret];
                    callback(null, result);
                });
            },
			/*function(callback){
			fs.readFile(remote_calllog_path, 'utf8', function (err,data) {//local_calllog_path
				  if (err) {
					err_msg='Error found when readying the call log' + err;
                    err_array.push(err_msg);
                    console.log(err_msg, err);
					callback(err, 13);
					throw err;
				//	console.log(err);
				  }
				  console.log('OK: '+ remote_calllog_path);//local_calllog_path
                  fileContent = data.toString();
				  console.log("fileContent 1 "+ fileContent);
                  console.log(fileContent);
				  output_string += '\npost test  fileContent: ' + fileContent; //for debugging
               	  var result=[data, data];
                  callback(null, result);

				});


			},*/
			function(callback){
				    var targetPath = currentRemote_calllog_path_NoFileName3;
					logger.info('targetPath '+targetPath+' \n');
					
					fs.exists(targetPath, function (exists) {
							//util.debug(exists ? "it's there" : "no passwd!");
							if(!exists) logger.info('calllog is NOT there  '+exists+' \n');
							else {
								logger.info('calllog directory is geneated in the right place  '+exists+' \n');
							}
							 callback(null, 9);
					});
				},
				function(callback){
				
					if (current_hour < 10)  
						current_hour ="0" + current_hour.toString();
						
					if (current_day < 10)  
						current_day ="0" + current_day.toString();
		
					currentRemote_calllog_path_NoFileName3  ='\\\\' +  TEST_HOST + '\\liveassistcalllog\\'+  "MrcpApiCallSteering\\"+ current_year +"\\"+ current_month_number + current_month_name +"\\"+current_day+"\\"+current_hour;

		
				    targetPath = currentRemote_calllog_path_NoFileName3;
					logger.info('targetPath '+targetPath+' \n');
					
					var matchStr = randomExternalSessionID + "-LIVEASSIST.xml";
					
					dir.readFiles(targetPath, {
						match: /.xml$/,
						//match:/randomExternalSessionID/,//randomExternalSessionID.-LIVEASSIST.xml$/,randomExternalSessionID +"-LIVEASSIST.xml";
					}, function(err, content, next) {
						if (err) throw err;
						fileContent = content.toString();	
						logger.info('\n');
						next();
					},
					function(err, files){
						if (err) throw err;
						logger.info('\n finished reading files:', files);
						logger.info('\n');
						if (fileContent.indexOf(randomExternalSessionID) >= 0) {
							logger.info('OK: call log found:');							
						}
						callback(null, 10);
					});
				},
            function(callback){
                //
                setTimeout(function(){
                    console.log('\nwait 1 second for server\n'); //debugging
                    callback(null, 11);
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
                 
                  
					//check the call log file content containt the event names and the event data
                    
					expect(fileContent).to.match(/<\?xml.+\?>/);
                    expect(fileContent).to.have.string("LIVEASSIST");
					
                    expect(fileContent).to.have.string("START_SESSION");                   
					
				   
                    expect(fileContent).to.have.string("INTERACTION");
					
					
					 expect(fileContent).to.have.string("SEND_INPUT");
                    
                    expect(fileContent).to.have.string("GET_RESULT");

              
                   expect(fileContent).to.have.string("CANCEL");
                   
				   expect(fileContent).to.have.string("\/INTERACTION");
                    expect(fileContent).to.have.string("END_SESSION");
					 expect(fileContent).to.have.string("\/LIVEASSIST");




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

