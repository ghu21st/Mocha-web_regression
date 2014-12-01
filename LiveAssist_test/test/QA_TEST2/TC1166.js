//TC1166: Verify that Live Assist GUI popup alert with message and dismiss button on busy state when maximum time elapse from agent
//-------------------------------------------------------
describe('TC1166: Verify that Live Assist GUI popup alert with message and dismiss button on busy state when maximum time elapse from agent ', function() {
//QA test setup ----------------------------------------------
    var case_ID = 1166;

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
    var test_url= TestConfig.options.test_Url;

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

    process.setMaxListeners(0);  //Define unlimited listeners
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //special for Error: DEPTH_ZERO_SELF_SIGNED_CERT on nodejs

    this.timeout(120000); //set timeout for special test case

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

    //
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
                //setTimeout(function(){
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
    it('TC1166: Verify that Live Assist GUI popup alert with message and dismiss button on busy state when maximum time elapse from agent', function(done) {

        var testAPIURL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/rest/app';
        var testDebutURL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/rest/debug';

        var sessionID = 0; //set default 0
        var element1,element2, element3;
        var alertDialog;

        //trace HTTP call
        //nock.recorder.rec();

        async.series([
                //wait for 1 sec
                function(callback){
                    //special timeout here to make sure /vxmlappexit disconnect NEO NMSP client
                    setTimeout(function(){
                        output_msg = '\nwait 1 second for server\n';
                        output_string += output_msg;
                        console.log(output_msg);

                        callback(null, 0);
                    }, 3000);
                },
                function(callback){
                    //start web test driver based on app driver session
                    ptor.driver.get(test_url).then(function(){
                        //
                        //ptor.navigate('app/');
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
                /*        function(callback){
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
                 callback(null, 4);
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

                            callback(null, 3)
                        }
                    });
                },
                function(callback){
                    element1 = ptor.element(protractor.By.model('username'));
                    element1.sendKeys('TA0001').then(function(){
                        output_msg = '\nSet user login name variable';
                        output_string += output_msg;
                        console.log(output_msg);
                        //
                        callback(null, 4);
                    });
                },
                function(callback){
                    element1 = ptor.element(protractor.By.model('password'));
                    element1.sendKeys('TA0001').then(function(){
                        output_msg = '\nSet password variable';
                        output_string += output_msg;
                        console.log(output_msg);
                        //
                        callback(null, 5);
                    });
                },
                function(callback){
                    //test on ng-click and button #####################
                    element1 = ptor.element(protractor.By.id('agentSignInButton'));
                    element1.sendKeys(protractor.Key.ENTER).then(function(){
                        output_msg = '\nSign in by ENTER key on +Sign in as Live Agent+ button';
                        output_string += output_msg;
                        console.log(output_msg);
                        //
                        var result = [output_msg, 0];
                        callback(null, result);
                    });
                },
                //wait for 1 sec
                function(callback){
                    //wait for 1 sec
                    setTimeout(function(){
                        output_msg = '\nwait 1 second for server\n';
                        output_string += output_msg;
                        logger.info(output_msg);

                        callback(null, 7);
                    }, 1000);
                },
                //################# App test driver --- Simple app API to trigger agent escalation
                function(callback){
                    //
                    var testBodyParam = JSON.stringify({
                        "varName":"Nuance-WebApiCallSteering",
                        "externalSessionID":"0a0325e7_000011c2_5307b580_00d4_0001",
                        "configurationName":"mainmenu",
                        "completionCause":"no-match",
                        "userInputText":"I want to take a plane to go see my grandmother in New York on the 25th around 4"
                    });

                    test_client.post2(testAPIURL + '/inputInteractionStep', testBodyParam, function(err, res, body){
                        if(err){
                            err_msg='Error found from http post request on /inputInteractionStep' + err;
                            err_array.push(err_msg);
                            logger.info(err_msg, err);
                            callback(err, 8);
                        }

                        //var body_ret = JSON.parse(body);
                        var body_ret = body;

                        output_string += '\n\nDebug: send post request \'\/inputInteractionStep\' done\n\n';//for debugging
                        output_string += '\npost test body param: ' + testBodyParam; //for debugging
                        output_string += '\nResponse: ' + res;//for debugging
                        output_string += '\nBody: ' + body_ret;//for debugging

                        //get session ID from the response
                        //sessionID = body_ret.match(/sessionID:(.+)/)[1]; //pattern search found the real sessionID #
                        sessionID = body_ret.sessionID;

                        var msg = '\nSessionID from /inputInteractionStep is: ' + sessionID;
                        msg += '\nState: ' + body_ret.state;
                        msg += '\ncompletionCause: ' + body_ret.completionCause;
                        output_string += msg;
                        logger.info(msg);

                        var result=[res, body_ret];
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
                            logger.info(output_msg);
                            //
                            ptor.getLocationAbsUrl().then(function(url){
                                output_msg = '\nCurrent location url: ' + url;
                                output_string += output_msg;
                                logger.info(output_msg);
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
                            //keyboard
                            element1.sendKeys(protractor.Key.ENTER).then(function(){
                                output_msg = '\nsignOutButton button clicked';
                                output_string += output_msg;
                                console.log(output_msg);
                                //
                                callback(null, 9);
                            });
                        }
                    });
                },
                    //Test agent gui timeout alert --- Note: default set to wait for specific time over default 30 sec to trigger alert/dismiss button, if changed, need to update the timeout here!!!
                function(callback){
                    //
                    setTimeout(function(){
                        logger.info('\nwait 1 second for server\n'); //debugging
                        callback(null, 10);
                    }, 35000);
                },
                function(callback){
                    //test on alert  ##############
                    alertDialog = ptor.switchTo().alert();
                    alertDialog.getText().then(function(text){
                        output_msg = '\nAlert text: ' + text;
                        output_string += output_msg;
                        logger.info(output_msg);
                        //
                        var result = [output_msg, 0];
                        callback(null, result);

                   });
                },
                function(callback){
                    //
                    setTimeout(function(){
                        logger.info('\nwait 1 second for server\n'); //debugging
                        callback(null, 12);
                    }, 1000);
                },
                function(callback){
                    //test on alert  ##############
                    alertDialog.dismiss().then(function(){
                        output_msg = '\nAlert dismissed!';
                        output_string += output_msg;
                        logger.info(output_msg);
                        //
                        var result = [output_msg, 0];
                        callback(null, result);
                    });
                },
                //
                function(callback){
                    //wait for next page ############
                    ptor.driver.wait(function(){
                        return ptor.isElementPresent(protractor.By.id('signOutButton'));
                    }, 12000).then(function(b){
                        if(b){
                            output_msg = '\nFound the new agent web page with specific className';//for debugging
                            output_string += output_msg;
                            logger.info(output_msg);
                            //
                            ptor.getLocationAbsUrl().then(function(url){
                                output_msg = '\nCurrent location url: ' + url;
                                output_string += output_msg;
                                logger.info(output_msg);
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
                            //keyboard
                            element1.sendKeys(protractor.Key.ENTER).then(function(){
                                output_msg = '\nsignOutButton button clicked';
                                output_string += output_msg;
                                console.log(output_msg);
                                //
                                callback(null, 14);
                            });
                        }
                    });
                },
                function(callback){
                    //test sign out by CTRL + END
                    ptor.actions().sendKeys(protractor.Key.chord(protractor.Key.CONTROL, protractor.Key.END), protractor.Key.NULL).perform().then(function(){
                        output_msg = '\nSign out by CTRL + END';
                        output_string += output_msg;
                        console.log(output_msg);
                        //
                        var result = [output_msg, 0];
                        callback(null, result);
                    });
                },
                function(callback){
                    //
                    setTimeout(function(){
                        logger.info('\nwait 1 second for server\n'); //debugging
                        callback(null, 16);
                    }, 1000);
                },
                function(callback){
                    //
                    var testBodyParam = JSON.stringify({
                        "sessionID": sessionID
                    });

                    test_client.post2(testAPIURL + '/endSession', testBodyParam, function(err, res, body){
                        if(err){
                            err_msg='Error found from http post request on /endSession' + err;
                            err_array.push(err_msg);
                            logger.info(err_msg, err);
                            callback(err, 17);
                        }

                        //var body_ret = JSON.parse(body);
                        var body_ret = body;

                        output_string += '\n\nDebug: send post request \'\/endSession\' done\n\n';//for debugging
                        output_string += '\npost test body param: ' + testBodyParam; //for debugging
                        output_string += '\nResponse: ' + res;//for debugging
                        output_string += '\nBody: ' + body_ret;//for debugging

                        var msg = '\nSessionID from /endSession is: ' + sessionID + '\n';
                        logger.info(msg);
                        output_string += msg;

                        var result=[res, body_ret];
                        callback(null, result);
                    });
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
                    expect(result[2][0]).to.match(/Nuance Live Assist/);
                    //expect(result[3][0]).to.match(/What\'s next/);
                    expect(result[3][0]).to.match(/https:.+liveassist\/app/); //default sign in page (all point to /app)
                    expect(result[6][0]).to.match(/Sign in by ENTER key/); //login page (all point to /app)

                    expect(result[11][0]).to.match(/Alert text: You are only allowed 30 seconds to send your choices/); //login page (all point to /app)
                    expect(result[13][0]).to.match(/Alert dismissed/); //login page (all point to /app)

                    expect(result[15][0]).to.match(/Sign out by CTRL \+ END/); //login page (all point to /app)

                    //log for post test check
                    var pass_msg = '\nTest passed! ' + 'Output string:\n' + output_string;
                    // pass_msg += '\n\nHttp server status code: ' + resReturn.statusCode + '\nHttp server body return: \n' + bodyReturn;
                    logger.info(pass_msg);

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