//TC1190: Verify that Live Assist popup calendar when agent selecting date with basic keyboard control End - Page Up - Page Down
//US7411 As a Live Assist application developer I want to show a calendar popup to agents when selecting a date
// -------------------------------------------------------
describe('TC1190: Verify that Live Assist popup calendar when agent selecting date with basic keyboard control End - Page Up - Page Down', function() {

//QA test setup ----------------------------------------------
    var case_ID = 1190;

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
    var date = require('date-utils');

    var protractor = null;
    var ptor = null;

    process.setMaxListeners(0);  //Define unlimited listeners
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //special for Error: DEPTH_ZERO_SELF_SIGNED_CERT on nodejs

    this.timeout(50000); //set timeout for test case

    //for date handling
    Date.prototype.yyyymmdd = function() {
        var yyyy = this.getFullYear().toString();
        var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
        var dd  = this.getDate().toString();
        return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
    };

    Date.prototype.yyyymm = function() {
        var yyyy = this.getFullYear().toString();
        var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
        return yyyy + '-' + (mm[1]?mm:"0"+mm[0]); // padding
    };

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
    it('TC1190: Verify that Live Assist popup calendar when agent selecting date with basic keyboard control End - Page Up - Page Down', function(done) {
        var testAPIURL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/rest/app';
        var testDebutURL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/rest/debug';

        var sessionID = 0; //set default 0
        var element1,element2, element3;

        //trace HTTP call
        // nock.recorder.rec();

        async.series([
                //################# Web test driver --- sign in agent GUI
                //wait for 1 sec
                function(callback){
                    //wait for 1 sec
                    setTimeout(function(){
                        output_msg = '\nwait 1 second for server\n';
                        output_string += output_msg;
                        logger.info(output_msg);

                        callback(null, 0);
                    }, 3000);
                },
                function(callback){
                    //start web test driver based on app driver session
                    ptor.driver.get(test_url).then(function(){
                        //
                        ptor.getCurrentUrl().then(function(url){
                            output_msg = '\nCurrent URL: ' + test_url;
                            output_string += output_msg;
                            logger.info(output_msg);
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
                        logger.info(output_msg);
                        //
                        var result = [title, 0];
                        callback(null, result);
                    });
                },
                function(callback){
                    //wait for next page ############
                    ptor.driver.wait(function(){
                        return ptor.isElementPresent(protractor.By.model('password'));
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
                            output_msg = '\nCan not find new agent web page with specific className';//for debugging
                            output_string += output_msg;
                            logger.info(output_msg);

                            callback(null, 3);
                        }
                    });
                },
                function(callback){
                    //enter user name
                    element1 = ptor.element(protractor.By.model('username'));
                    element1.sendKeys('TA0001').then(function(){
                        output_msg = '\nSet user login name variable';
                        output_string += output_msg;
                        logger.info(output_msg);
                        //
                        callback(null, 4);
                    });
                },
                function(callback){
                    //enter password
                    element1 = ptor.element(protractor.By.model('password'));
                    element1.sendKeys('TA0001').then(function(){
                        output_msg = '\nSet password variable';
                        output_string += output_msg;
                        logger.info(output_msg);
                        //
                        callback(null, 5);
                    });
                },
                function(callback){
                    //test on ng-click and button #####################
                    element1 = ptor.element(protractor.By.id('agentSignInButton'));
                    element1.click().then(function(){
                        output_msg = '\nSign in button clicked';
                        output_string += output_msg;
                        logger.info(output_msg);
                        //
                        callback(null, 6);
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
                            output_msg = '\nCan not find new agent web page';//for debugging
                            output_string += output_msg;
                            logger.info(output_msg);

                            callback(null, 7);
                        }
                    });
                },
                //wait for 1 sec
                function(callback){
                    //wait for 1 sec
                    setTimeout(function(){
                        output_msg = '\nwait 1 second for server\n';
                        output_string += output_msg;
                        logger.info(output_msg);

                        callback(null, 8);
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
                            callback(err, 9);
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
                function(callback){
                    /*
                     //test intent by keyboard  ##############
                     ptor.actions().sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "1"), protractor.Key.NULL).perform().then(function(){
                     ptor.driver.sleep(500);
                     ptor.actions().sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "1"), protractor.Key.NULL).perform().then(function() {
                     ptor.driver.sleep(500);
                     ptor.actions().sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "1"), protractor.Key.NULL).perform().then(function () {
                     ptor.driver.sleep(500);
                     output_msg = '\nSelected intents by CTRL+num\n';
                     output_string += output_msg;
                     logger.info(output_msg);
                     //
                     var result = [output_msg, 0];
                     callback(null, result);

                     });
                     });
                     });
                     */
                    //test on intent by mouse using filter  ##############
                    var eText1 = 'Billing', eText2 = 'Late fee', eText3 = 'Waive fee'; //define expected intent name/text
                    ptor.element.all(protractor.By.repeater('intent in intents')).filter(function(elem1, index1) {
                        return elem1.evaluate('intent.name').then(function (text1) {
                            return text1 == eText1;
                        });
                    }).then(function(filteredElements){
                        filteredElements[0].click().then(function(){
                            ptor.element.all(protractor.By.repeater('intent in selectedIntents[0].members')).filter(function(elem2, index2){
                                return elem2.evaluate('intent.name').then(function(text2){
                                    return text2 == eText2;
                                });
                            }).then(function(filteredElements){
                                filteredElements[0].click().then(function(){
                                    ptor.element.all(protractor.By.repeater('intent in selectedIntents[1].members')).filter(function(elem3, index3){
                                        return elem3.evaluate('intent.name').then(function(text3){
                                            return text3 == eText3;
                                        });
                                    }).then(function(filteredElements){
                                        filteredElements[0].click().then(function(){
                                            output_msg = '\nCurrent intent selection: ' + eText3;
                                            output_string += output_msg;
                                            logger.info(output_msg);
                                            //
                                            var result = [eText3, 0];
                                            callback(null, result);
                                        });
                                    });
                                });
                            });
                        });
                    });
                },
                function(callback){
                    //give intent values
                    var var_id_res = [], var_name_res = [], var_value_res = [];
                    var element2, element3; var var_value;
                    ptor.element.all(protractor.By.repeater('variable in selectedIntents[selectedIntents.length - 1].variables')).then(function(arr){
                        //
                        arr[0].evaluate('variable.id').then(function(var_id) {
                            arr[0].evaluate('variable.name').then(function (var_name) {
                                var_id_res.push(var_id);
                                var_name_res.push(var_name);

                                //output selection to console
                                output_msg = '\nSelected variable id: ' + var_id;
                                output_msg += '\nSelected variable name: ' + var_name;
                                output_string += output_msg;
                                logger.info(output_msg);

                                var chk1 = var_id + 'ConfirmCheckBox';
                                element2 = ptor.element(protractor.By.id(chk1));
                                element2.click().then(function(){       //trigger the date
                                    var chk1 = var_id + 'Button';
                                    element3 = ptor.element(protractor.By.id(chk1));
                                    element3.click().then(function(){
                                        ptor.driver.getAllWindowHandles().then(function(handles) {
                                            logger.info(handles[0]);
                                            ptor.driver.switchTo().window(handles[0]).then(function(){
                                                //var datepickerToday = ptor.element(protractor.By.buttonText('Close'));
                                                //pop up calendar testing...
                                                ptor.driver.switchTo().activeElement().sendKeys(protractor.Key.END).then(function(){ //END key, first month of current year
                                                    ptor.driver.sleep(1000);
                                                    ptor.driver.switchTo().activeElement().sendKeys(protractor.Key.PAGE_UP).then(function() { //Right key date + 1 month
                                                        ptor.driver.sleep(1000);
                                                        ptor.driver.switchTo().activeElement().sendKeys(protractor.Key.PAGE_DOWN).then(function () { //Right key date + 1 month
                                                            ptor.driver.sleep(1000);
                                                            ptor.driver.switchTo().activeElement().sendKeys(protractor.Key.PAGE_DOWN).then(function () { //Left key date - 1 month
                                                                ptor.driver.sleep(1000);
                                                                ptor.driver.switchTo().activeElement().sendKeys(protractor.Key.ENTER).then(function () { //Enter key to confirm
                                                                    output_msg = '\nEnter key press\n';
                                                                    output_string += output_msg;
                                                                    logger.info(output_msg);
                                                                    //
                                                                    var result = [output_msg, 0];
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
                            });
                        });
                    });
                },
                function(callback){
                    //keyboard CTRL + ENTER
                    ptor.actions().sendKeys(protractor.Key.chord(protractor.Key.CONTROL, protractor.Key.ENTER), protractor.Key.NULL).perform().then(function(){
                        output_msg = '\nTested ctrl+enter pressed';
                        output_string += output_msg;
                        logger.info(output_msg);
                        //
                        callback(null, 13);
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
                            element1.click().then(function(){
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
                    //test on ng-click and button #####################
                    element1 = ptor.element(protractor.By.id('signOutButton'));
                    element1.click().then(function(){
                        output_msg = '\nTested button clicked';
                        output_string += output_msg;
                        logger.info(output_msg);
                        //
                        callback(null, 15);
                    });
                },

                function(callback){
                    //
                    setTimeout(function(){
                        logger.info('\nwait 1 second for server\n'); //debugging
                        callback(null, 16);
                    }, 100);
                },

                //################# App test driver --- Simple app API to check session return result
                function(callback){
                    //
                    var testBodyParam = JSON.stringify({
                        sessionID: sessionID
                    });
                    test_client.post2(testAPIURL + '/inputInteractionStep', testBodyParam, function(err, res, body){
                        if(err){
                            err_msg='Error found from http post request on /inputInteractionStep' + err;
                            err_array.push(err_msg);
                            logger.info(err_msg, err);
                            callback(err, 17);
                        }

                        //var body_ret = JSON.parse(body);
                        var body_ret = JSON.stringify(body);

                        output_string += '\n\nDebug: send post request \'\/inputInteractionStep\' done\n\n';//for debugging
                        output_string += '\npost test body param: ' + testBodyParam; //for debugging
                        output_string += '\nResponse: ' + res;//for debugging
                        output_string += '\nBody: ' + body_ret;//for debugging

                        var result=[res, body_ret];
                        callback(null, result);

                    });
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
                            callback(err, 18);
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
                },
                function(callback){
                    //
                    setTimeout(function(){
                        logger.info('\nwait 1 second for server\n'); //debugging
                        callback(null, 19);
                    }, 4000);
                }

            ],
            function(err, result){
                if(err){
                    logger.info('\n\nERROR found during agent web UI login. Quit!\n' + err + '\n\n');
                    expect(err).to.have.length(0);
                    done(err);

                }
                //using try & catch block to customize the output message if the case failed
                try{
                    //
                    logger.info('for testing\n');
                    expect(result[2][0]).to.match(/Nuance Live Assist/);
                    //expect(result[3][0]).to.match(/What\'s next/);
                    // expect(result[6][0]).to.match(/http:.+liveassist\/app/); //default sign in page (all point to /app)

                    expect(result[9][0].statusCode).to.eql(200);
                    expect(result[9][1].state).to.match(/agentPending/);

                    // expect(result[13][0]).to.match(/http:.+liveassist\/app/); //login page (all point to /app)

                    //get expected year for this case testing
                    Date.prototype.yyyy_next = function() {
                        var yyyyNext = this.getFullYear() + 1;   //plus 1 for this case
                        return  yyyyNext.toString(); // padding
                    };
                    d = new Date();
                    var nextYear = d.yyyy_next();

                    logger.info('\ncurrent date year plus 1 for this case testing: ' + nextYear);
                    //
                    expect(result[17][1]).to.match(/\"completionCause\":\"success\"/)
                        .and.to.match(/\"outcome\":/)
                        .and.to.match(/\"intent\":/)
                        .and.to.match(/\"id\":\"INTENT\"/)
                        .and.to.match(/\"value\":\"WAIVE_FEE_REQUEST\"/)
                        .and.to.match(/\"variables\":/)
                        .and.to.match(/\"id\":\"BILLING_MONTH\"/)
                        .and.to.match(/\"value\":\"2015-12\"/)
                        .and.to.match(/\"state\":\"useLiveAssistResult\"/);

                    expect(result[17][1]).to.have.string(nextYear);  //verify if contain the basic keyboard control selected year-month

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