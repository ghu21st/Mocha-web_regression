//TC1171: Verify that Live Assist with default settings show session details on agent screen via IVR api call escalated
//-------------------------------------------------------
describe('TC1171: Verify that Live Assist with default settings show session details on agent screen via IVR api call escalated', function() {

//QA test setup ----------------------------------------------
    var case_ID = 1171;

    var err_msg;    //temp single error message
    var err_array;  //error message array
    var output_string=''; //result return array
    var output_msg='';  //temp single result return
    var test_startTime;
    var test_endTime; //for time elapse calculation
    var test_elapse = 0;

//global env settings
    var TestConfig  = require('../Config/TestConfig.js');
    var TEST_HOST = TestConfig.options.server;  //Ex: '10.3.41.59' change it if test server changed
    var TEST_PORT = TestConfig.options.port;    //ex: '8080', change it if test server changed
    var test_location = TestConfig.options.test_location;              //test base folder
    var selenium_server = TestConfig.options.selenium_server;
    var test_url= TestConfig.options.test_Url;                      //agent GUI URL

    var testlog_location = test_location + "\\test_outputs";        //test log folder
    var logFile = testlog_location + '\\' + case_ID + '.log';    //test log file name
    var logger;

    var chai = require('chai');
    var chaiAsPromised = require('chai-as-promised');
    chai.use(chaiAsPromised);
	var expect = chai.expect;

    var request = require('request');
    request = request.defaults({jar: true}); //note: this case need cookie for VXML grammar event testing!
    var async = require('async');
    var winston = require('winston'); //console/file logging module for testing
    var os = require('os');
    var nock = require('nock');   //mock library, REST API: post/put/get/delete/...
    var nockOptions = {allowUnmocked: true};

    var protractor = null;
    var ptor = null;

    process.setMaxListeners(0);//Define unlimited listeners
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //special for Error: DEPTH_ZERO_SELF_SIGNED_CERT on nodejs

    this.timeout(50000); //set timeout for test case

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
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                        'Accept': 'text/xml, application/xml, */*;q=0.2'
                    },
                    uri: url,
                    body: bodyParam,
                    json: false
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
        //post method http client request
        post2: function(url, bodyParam, cb){
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

    beforeEach(function(done1){
		//initialize for testing
        err_msg='';    //temp single error message
        err_array=[];  //error message array
        output_msg='';  //temp single result return

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
		//
		async.series({
			for_logging: function(callback){
				//setup QA logging
				require('fs').unlink(logFile, function(err){
					if(err){
						console.log('Remove file error or no ' + logFile + ' exist at all\n');
					}
					callback(null, 0);
				});
			},
			test_start: function(callback){
					//record test start time
				test_startTime = new Date();
				logger.info('Test started and logging at '+ logFile);
				//logger.extend(console); //log everything from console to logger(save to log file)
				callback(null,1);
			},
			for_protractor: function(callback){
                //using QA browser driver wrapper to get protractor driver
                var ptorDriver  = require('../Config/BrowserTestDriver.js');
                var ret = ptorDriver.createPtorDriver(selenium_server,TestConfig.options.browser_driver);
                ptor = ret[0]; protractor = ret[1];
                //
				ptor.driver.manage().timeouts().setScriptTimeout(50000);
				ptor.driver.manage().timeouts().implicitlyWait(600); //to make web gui regression test more robust
				ptor.driver.manage().window().maximize();
				callback(null, 2);

/*				var FirefoxProfile = require('firefox-profile'); //for firefox profile
					//Protractor with wrapped Selenium WebdriverJS (internal) and specific firefox profile
				FirefoxProfile.copyFromUserProfile({name: 'TA0001'}, function(err, profile){
					if(err){
						logger.info('\nError found on setup profile for firefox driver!\n');
						callback(err, 2);
					}
					var capabilities = protractor.Capabilities.firefox();
					profile.encoded(function(prof){
						capabilities.set('firefox_profile', prof);
						driver = new protractor.Builder().          //define driver instance for Selenium server used/wrapped with protractor
							usingServer(selenium_server).
							withCapabilities(
								capabilities
							).build();
						ptor = protractor.wrapDriver(driver);
						ptor.driver.manage().timeouts().setScriptTimeout(50000);
						ptor.driver.manage().timeouts().implicitlyWait(600); //to make web gui regression test more robust
						ptor.driver.manage().window().maximize();
						//
						callback(null, 2);
					});
				});
*/
			}
		},function(err,results){
			if(err){
				console.log('\nError happened from the case beforeEach block!\n');
			}
			//
			done1();
		});
	
    });

//-------------------------------------------------------
    afterEach(function(done2){
        async.series({
            logout_agent: function(callback){
                //var adminGUIAPI = 'https://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/rest/admin/agents';
                //var agent_id = 'TA0001';
                //var logoutURL = adminGUIAPI + '/' + agent_id + '/logout';
                logoutURL = 'https://' + TEST_HOST + ':8446' + '/liveassist/app/logout'; //special https request to logout agent
                test_client.get(logoutURL, function(err, res, body) {
                    if (err) {
                        err_msg = 'Error found from http get request on: ' + logoutURL + err;
                        err_array.push(err_msg);
                        console.log(err_msg, err);
                        //callback(err, 0);
                    }
                    //else {
                    console.log('\nMake sure agent logout before exit!\n' + logoutURL + '\n' + body + '\n');
                    callback(null, 0);
                    //}
                });
            },
            end_webdriver: function(callback){
                //client.end(callback(null, 0));
                ptor.driver.quit().then(function(){
                    callback(null, 0);
                });
            },
            remove_logger: function(callback){
                logger.remove(winston.transports.Console);
                logger.remove(winston.transports.File);
                callback(null, 1);
            },
            remove_modules: function(callback){
                // setTimeout(function(){
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
                //}, 2000);
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
//-------------------------------------------------------
    it('TC1171: Verify that Live Assist with default settings show session details on agent screen via IVR api call escalated', function(done) {
        var testAPIURL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/rest/app';
        var testDebutURL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/rest/debug';

        var sessionID = 0; //set default 0
        var element1,element2, element3;

        //trace HTTP call
        //nock.recorder.rec();

        async.series([
                //################# Web test driver --- sign in agent GUI
                //wait for 1 sec
                function(callback){
                    //wait for 1 sec
                    setTimeout(function(){
                        output_msg = '\nwait 1 second for server\n';
                        output_string += output_msg;
                        console.log(output_msg);

                        callback(null, 0);
                    }, 3000);
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
                    //start web test driver based on app driver session
                    ptor.driver.get(test_url).then(function(){
                        //
                        ptor.getCurrentUrl().then(function(url){
                            output_msg = '\nCurrent URL: ' + test_url;
                            output_string += output_msg;
                            console.log(output_msg);
                            //
                            var result = [url, 0];
                            callback(null, result);
                        });
                        //
                    });

                },
                function(callback){
                    ptor.getTitle().then(function(title){
                        output_msg = '\nTest web page title: ' + title;
                        output_string += output_msg;
                        console.log(output_msg);
                        //
                        var result = [title, 0];
                        callback(null, result);
                    });
                },
                /*          function(callback){
                 ptor.element(protractor.By.binding('messageOfTheDayHtml'))
                 .getText().then(function(txt){
                 output_msg = '\nGet welcome page message of the day: ' + txt;
                 output_string += output_msg;
                 console.log(output_msg);
                 //
                 var result = [txt, 0];
                 callback(null, result);
                 });
                 },
                 function(callback){
                 //test on ng-click and button #####################
                 element1 = ptor.element(protractor.By.id('closeButton'));
                 element1.click().then(function(){
                 output_msg = '\nTested button clicked';
                 output_string += output_msg;
                 console.log(output_msg);
                 //
                 callback(null, 5);
                 });
                 },
                 */
                function(callback){
                    //wait for next page ############
                    ptor.driver.wait(function(){
                        return ptor.isElementPresent(protractor.By.model('password'));
                    }, 12000).then(function(b){
                        if(b){
                            output_msg = '\nFound the new agent web page with specific className';//for debugging
                            output_string += output_msg;
                            console.log(output_msg);
                            //
                            ptor.getLocationAbsUrl().then(function(url){
                                output_msg = '\nCurrent location url: ' + url;
                                output_string += output_msg;
                                console.log(output_msg);
                                //
                                var result = [url, 0];
                                callback(null, result);
                            });

                        }else{
                            output_msg = '\nCan not find new agent web page with specific className';//for debugging
                            output_string += output_msg;
                            console.log(output_msg);

                            callback(null, 4)
                        }
                    });
                },
                function(callback){
                    //enter user name
                    element1 = ptor.element(protractor.By.model('username'));
                    element1.sendKeys('TA0001').then(function(){
                        output_msg = '\nSet user login name variable';
                        output_string += output_msg;
                        console.log(output_msg);
                        //
                        callback(null, 5);
                    });
                },
                function(callback){
                    //enter password
                    element1 = ptor.element(protractor.By.model('password'));
                    element1.sendKeys('TA0001').then(function(){
                        output_msg = '\nSet password variable';
                        output_string += output_msg;
                        console.log(output_msg);
                        //
                        callback(null, 6);
                    });
                },
                function(callback){
                    //test on ng-click and button #####################
                    element1 = ptor.element(protractor.By.id('agentSignInButton'));
                    element1.click().then(function(){
                        output_msg = '\nSign in button clicked';
                        output_string += output_msg;
                        console.log(output_msg);
                        //
                        callback(null, 7);
                    });
                },
                function(callback){
                    //wait for next page ############
                    ptor.driver.wait(function(){
                        return ptor.isElementPresent(protractor.By.id('signOutButton'));
                    }, 12000).then(function(b){
                        if(b){
                            output_msg = '\nFound the new agent web page with specific className';//for debugging
                            output_string += output_msg;
                            console.log(output_msg);
                            //
                            ptor.getLocationAbsUrl().then(function(url){
                                output_msg = '\nCurrent location url: ' + url;
                                output_string += output_msg;
                                console.log(output_msg);
                                //
                                var result = [url, 0];
                                callback(null, result);
                            });

                        }else{
                            output_msg = '\nCan not find specific agent web page!!!';//for debugging
                            output_string += output_msg;
                            console.log(output_msg);

                            callback(null, 8);
                        }
                    });
                },
                //################# App test driver --- Simple app API to trigger agent escalation
                function(callback){
            //get the external session ID for each call
                call_externalSessionID = '0a0325e7_00004175_528d983c_' + case_ID + '_'+ '0001';

                //ivr call steering app: dnis=4627, app context = 'othermenu', confidence value = 0.3 (<0.5 default to make sure escalation)
                    //var testBodyParam = "ani=sip%3A5145551234%4010.3.53.192%3A5064&dnis=sip%3A4627%40mtl-da53&externalSessionID=0a0325e7_000011c2_5307b580_00d4_0001&sessionID=&configurationName=mainmenu&completionCause=no-match&recognitionResult=%3C%3Fxml+version%3D%271.0%27%3F%3E%3Cemma%3Aemma+version%3D%221.0%22+xmlns%3Aemma%3D%22http%3A%2F%2Fwww.w3.org%2FTR%2F2007%2FCR-emma-20071211%22+xmlns%3Anuance%3D%22http%3A%2F%2Fnr10.nuance.com%2Femma%22%3E%3Cemma%3Agrammar+id%3D%22grammar_1%22+ref%3D%22session%3Ahttp%3A%2F%2Fmt-jdebroin%3A8080%2Fliveassist%2Fdata%2Fvxmldemo%2Fivrapi%2Fcallsteering%2Fmainmenu.grxml+-1+-1+10000%22%2F%3E%3Cemma%3Ainterpretation+id%3D%22interp_1%22+emma%3Auninterpreted%3D%22true%22+emma%3Aconfidence%3D%220.3%22+emma%3Agrammar-ref%3D%22grammar_1%22+emma%3Atokens%3D%22technical+support%22+emma%3Aduration%3D%227100%22+nuance%3Aeos-silence%3D%221140%22%2F%3E%3C%2Femma%3Aemma%3E&utterance=http%3A%2F%2Fmtl-da53%3A90%2FNuance%2FcallLogs%2FTest1%2F2014%2F02February%2F21%2F15%2FNUAN-22-24-mtl-da53-0a0325e7_000011c2_5307b580_00d4_0001-utt001-SAVEWAVEFORM.wav";
                var testBodyParam = "ani=sip%3A5145551234%4010.3.53.192%3A5064&dnis=sip%3A4627%40mtl-da53&externalSessionID=" + call_externalSessionID + "&sessionID=&configurationName=othermenu&completionCause=success&recognitionResult=%3C%3Fxml%20version%3D%271.0%27%3F%3E%3Cemma%3Aemma%20version%3D%221.0%22%20xmlns%3Aemma%3D%22http%3A%2F%2Fwww.w3.org%2FTR%2F2007%2FCR-emma-20071211%22%20xmlns%3Anuance%3D%22http%3A%2F%2Fnr10.nuance.com%2Femma%22%3E%3Cemma%3Agrammar%20id%3D%22grammar_1%22%20ref%3D%22session%3Ahttp%3A%2F%2F10.3.41.59%3A8080%2Fliveassist%2Fdata%2Fvxmldemo%2Fivrapi%2Fcallsteering%2Fmainmenu.grxml%20-1%20-1%2010000%22%2F%3E%3Cemma%3Ainterpretation%20id%3D%22interp_1%22%20emma%3Aconfidence%3D%220.3%22%20emma%3Agrammar-ref%3D%22grammar_1%22%20emma%3Atokens%3D%22OPERATOR%22%20emma%3Aduration%3D%221220%22%20emma%3Amode%3D%22voice%22%20nuance%3Aeos-silence%3D%221340%22%3E%3CINTENT%20%0Aconf%3D%220.3%22%3EOPERATOR%3C%2FINTENT%3E%3CSWI_literal%3EOPERATOR%3C%2FSWI_literal%3E%3CSWI_meaning%3E%7BINTENT%3AOPERATOR%7D%3C%2FSWI_meaning%3E%3C%2Femma%3Ainterpretation%3E%3C%2Femma%3Aemma%3E&utterance=http%3A%2F%2Fmtl-bl1-12-vm02%3A90%2FNuance%2FcallLogs%2FIvrApiCallSteering%2F2014%2F06June%2F18%2F15%2FNUAN-09-13-mtl-bl1-12-vm02-0a032969_00002680_53a1e3d9_0007_0001-utt001-SAVEWAVEFORM.wav";

                    test_client.post(testAPIURL + '/inputInteractionStep', testBodyParam, function(err, res, body){
                        if(err){
                            err_msg='Error found from http post request on /inputInteractionStep' + err;
                            err_array.push(err_msg);
                            console.log(err_msg, err);
                            callback(err, 9);
                        }

                        //var body_ret = JSON.parse(body);
                        var body_ret = body;

                        output_string += '\n\nDebug: send post request \'\/inputInteractionStep\' done\n\n';//for debugging
                        output_string += '\npost test body param: ' + testBodyParam; //for debugging
                        output_string += '\nResponse: ' + res;//for debugging
                        output_string += '\nBody: ' + body_ret;//for debugging

                        //get session ID from the response
                        //Body: {"state":"agentPending","outcome":null,"sessionID":"session:Nuance-IvrApiCallSteering:4707f66b-4443-44dc-8408-291c9ec1690c","completionCause":null}
                        //var obj = JSON.parse(body_ret);
                        //sessionID = obj.sessionID;
                        sessionID = body.match(/sessionID>(.+)<\/sessionID/)[1]; //pattern search found the real sessionID #

                        var msg = '\nSessionID from /inputInteractionStep is: ' + sessionID;
                        output_string += msg;
                        console.log(msg);

                        var result=[res, body];
                        callback(null, result);
                    });
                },

                //################ Web test driver --- AngularJS Agent GUI to trigger agent selection and outcome
                function(callback){
                    //wait for next page ############
                    ptor.driver.wait(function(){
                        return ptor.isElementPresent(protractor.By.id('doneButton'));
                    }, 12000).then(function(b){
                        if(b){
                            output_msg = '\nFound the new agent web page with specific className';//for debugging
                            output_string += output_msg;
                            console.log(output_msg);
                            //
                            ptor.getLocationAbsUrl().then(function(url){
                                output_msg = '\nCurrent location url: ' + url;
                                output_string += output_msg;
                                console.log(output_msg);
                                //
                                var result = [url, 0];
                                callback(null, result);
                            });

                        }else{
                            output_msg = '\nCan not find specific agent web page!!!';//for debugging
                            output_string += output_msg;
                            console.log(output_msg);

                            //click sign out button - robust
                            element1 = ptor.element(protractor.By.id('signOutButton'));
                            element1.click().then(function(){
                                output_msg = '\nsignOutButton button clicked';
                                output_string += output_msg;
                                console.log(output_msg);
                                //
                                callback(null, 10);
                            });

                        }
                    });
                },
                //check session shown on agent gui.....
                function(callback){
                    //
                    ptor.element(protractor.By.binding('interaction.from')).getText().then(function(text1){
                        ptor.element(protractor.By.binding('interaction.to')).getText().then(function(text2){
                            ptor.element(protractor.By.binding('interaction.applicationName')).getText().then(function(text3) {
                                ptor.element(protractor.By.binding('interaction.applicationContextName')).getText().then(function (text4) {
                                    //
                                    output_msg = '\nFound binding interaction.text:\n' + text1 +'\n' + text2 + '\n' + text3 + '\n' + text4 + '\n';
                                    output_string += output_msg;
                                    console.log(output_msg);
                                    //
                                    var result = [output_msg, 0];
                                    callback(null, result);
                                });
                            });
                        });
                    });
                },
                function(callback){
                    //test on ng-repeat  ##############
                    element1 = ptor.element.all(protractor.By.repeater('intent in intents')).then(function(arr){
                        arr[0].evaluate('intent.name').then(function(intent_name){
                            element2 = ptor.element(protractor.By.partialLinkText(intent_name));
                            element2.click().then(function(){
                                ptor.element.all(protractor.By.repeater('intent in selectedIntents[0].members')).then(function(arr){
                                    arr[0].evaluate('intent.name').then(function(intent_name){
                                        ptor.element(protractor.By.partialLinkText(intent_name)).click().then(function(){
                                            ptor.element.all(protractor.By.repeater('intent in selectedIntents[1].members')).then(function(arr){
                                                arr[0].evaluate('intent.name').then(function(intent_name){
                                                    ptor.element(protractor.By.partialLinkText(intent_name)).click().then(function(){
                                                        output_msg = '\nCurrent intent selection: ' + intent_name;
                                                        output_string += output_msg;
                                                        console.log(output_msg);
                                                        //
                                                        var result = [intent_name, 0];
                                                        callback(null, result);
                                                    });
                                                });
                                            });

                                        });
                                    });
                                });
                            });
                        });
                    });
                },
                function(callback){
                    //test on ng-click and button #####################
                    element1 = ptor.element(protractor.By.id('doneButton'));
                    element1.click().then(function(){
                        output_msg = '\nTested button clicked';
                        output_string += output_msg;
                        console.log(output_msg);
                        //
                        callback(null, 12);
                    });
                },
                function(callback){
                    //wait for next page ############
                    ptor.driver.wait(function(){
                        return ptor.isElementPresent(protractor.By.id('signOutButton'));
                    }, 12000).then(function(b){
                        if(b){
                            output_msg = '\nFound the new agent web page with specific className';//for debugging
                            output_string += output_msg;
                            console.log(output_msg);
                            //
                            ptor.getLocationAbsUrl().then(function(url){
                                output_msg = '\nCurrent location url: ' + url;
                                output_string += output_msg;
                                console.log(output_msg);
                                //
                                var result = [url, 0];
                                callback(null, result);
                            });

                        }else{
                            output_msg = '\nCan not find specific agent web page!!!';//for debugging
                            output_string += output_msg;
                            console.log(output_msg);

                            //click sign out button - robust
                            element1 = ptor.element(protractor.By.id('signOutButton'));
                            element1.click().then(function(){
                                output_msg = '\nsignOutButton button clicked';
                                output_string += output_msg;
                                console.log(output_msg);
                                //
                                callback(null, 13);
                            });
                        }
                    });
                },
                function(callback){
                    //test on ng-click and button #####################
                    element1 = ptor.element(protractor.By.id('signOutButton'));
                    element1.click().then(function(){
                        output_msg = '\nTested button clicked';
                        output_string += output_msg;
                        console.log(output_msg);
                        //
                        callback(null, 14);
                    });
                },
                function(callback){
                    //
                    setTimeout(function(){
                        console.log('\nwait 1 second for server\n'); //debugging
                        callback(null, 15);
                    }, 100);
                },

                //################# App test driver --- Simple app API to check session return result
                function(callback){
                    //
                    var testBodyParam = 'sessionID=' + sessionID;

                    test_client.post(testAPIURL + '/inputInteractionStep', testBodyParam, function(err, res, body){
                        if(err){
                            err_msg='Error found from http post request on /inputInteractionStep' + err;
                            err_array.push(err_msg);
                            console.log(err_msg, err);
                            callback(err, 18);
                        }

                        //var body_ret = JSON.parse(body);
                        //var body_ret = JSON.stringify(body);
                        body_ret = body;

                        output_string += '\n\nDebug: send post request \'\/inputInteractionStep\' done\n\n';//for debugging
                        output_string += '\npost test body param: ' + testBodyParam; //for debugging
                        output_string += '\nResponse: ' + res;//for debugging
                        output_string += '\nBody: ' + body_ret;//for debugging

                        var msg = '\ncheck Session return from /inputInteracationStep is:\n' + body_ret + '\n';
                        console.log(msg);

                        var result=[res, body_ret];
                        callback(null, result);

                    });
                },
                function(callback){
                    //
                    var testBodyParam = 'sessionID=' + sessionID;

                    test_client.post(testAPIURL + '/endSession', testBodyParam, function(err, res, body){
                        if(err){
                            err_msg='Error found from http post request on /endSession' + err;
                            err_array.push(err_msg);
                            console.log(err_msg, err);
                            callback(err, 17);
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
                        callback(null, 18);
                    }, 4000);
                }

            ],
            function(err, result){
                if(err){
                    console.log('\n\nERROR found during agent web UI login. Quit!\n' + err + '\n\n');
                    expect(err).to.have.length(0);
                    done(err);

                }
                //using try & catch block to customize the output message if the case failed
                try{
                    //
                    console.log('for testing\n');
                    expect(result[3][0]).to.match(/Nuance Live Assist/);
                    // expect(result[4][0]).to.match(/What\'s next/);
                    expect(result[4][0]).to.match(/https:.+liveassist\/app/); //default sign in page (all point to /app)

                    expect(result[9][0].statusCode).to.eql(200);
                    expect(result[9][1]).to.match(/<state>agentPending<\/state>/);
                    /*Body: <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                     <inputInteractionStepResult>
                     <sessionID>session:Nuance-IvrApiCallSteering:29575277-9bdc-4b83-9f59-038fd4ad6d36</sessionID>
                     <state>agentPending</state>
                     </inputInteractionStepResult>*/

                    expect(result[11][0]).to.match(/from: 5145551234/)
                        .and.to.match(/to: 4627/)
                        .and.to.match(/Nuance-IvrApiCallSteering/)
                        .and.to.match(/othermenu/);

                    expect(result[17][1]).to.match(/<inputInteractionStepResult>/)
                        .and.to.match(/<completionCause>success<\/completionCause>/)
                        .and.to.match(/<outcome>/)
                        .and.to.match(/<intent>/)
                        .and.to.match(/<id>INTENT<\/id>/)
                        .and.to.match(/<value>WAIVE_FEE_REQUEST<\/value>/)
                        .and.to.match(/<\/intent>/)
                        //Note: Just 'WAVI_FEE_REQUEST intent click, no variables, so no valid following variables check anymore
                        //.and.to.match(/<variables>/)
                        //.and.to.match(/<id>BILLING_MONTH<\/id>/)
                        //.and.to.match(/<value>2014-01<\/value>/)
                        //.and.to.match(/<\/variables>/)
                        //                      .and.to.match(/<variables>/)
                        //                      .and.to.match(/<id>LATE_PAYMENT_REASON<\/id>/)
                        //                      .and.to.match(/<\/variables>/)
                        .and.to.match(/<\/outcome>/)
                        .and.to.match(/<state>useLiveAssistResult<\/state>/)
                        .and.to.match(/<\/inputInteractionStepResult>/);

                    /*
                     Body: <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                     <inputInteractionStepResult>
                     <completionCause>success</completionCause>
                     <outcome>
                     <intent><id>INTENT</id><value>WAIVE_FEE_REQUEST</value></intent>
                     <variables><id>BILLING_MONTH</id><value>2014-01</value></variables>
                     </outcome>
                     <sessionID>session:Nuance-IvrApiCallSteering:22671990-ac74-4a11-84fe-1afaf4a9c810</sessionID>
                     <state>useLiveAssistResult</state>
                     </inputInteractionStepResult>


                     */
                    //log for post test check
                    var pass_msg = '\nTest passed! ' + 'Output string:\n' + output_string;
                    // pass_msg += '\n\nHttp server status code: ' + resReturn.statusCode + '\nHttp server body return: \n' + bodyReturn;
                    logger.info(pass_msg);

                    done();

                }catch(e){
                    //log for post test check
                    var fail_msg = '\nTest failed! ';
                    fail_msg += 'Error:\n' + JSON.stringify(e);
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