/*
 web_2008: Web GUI test simulator - agent response outcome result with - operator
 */
//QA test case description, verification & assertion check
//QA test setup ----------------------------------------------
//define variables for QA test
var case_ID = 2008;

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

var webdriver = require('selenium-webdriver');
var driver; //case web test driver global variable

/*  //start selenium server by case
 var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;
 var server = new SeleniumServer(test_location+'/QA_TEST/' + 'selenium-server-standalone-2.35.0.jar', {
 port: 4444
 });
 server.start();
 */
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

//Selenium - WebdriverJs
driver = new webdriver.Builder().
    //usingServer(server.address()).
    withCapabilities(webdriver.Capabilities.firefox()).
    build();


//--------------------------------------------------
// Simulator started here... (QA App test driver & QA Web test driver)
//for App driver setup
var BaseAppAPIURL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/rest/vxmlapp';
var BaseDebugURL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/rest/debug';
var sessionID = 1; //set default 1

//trace HTTP API call
nock.recorder.rec();

async.series([
    //wait for 1 sec
    function(callback){
        //special timeout here to make sure /vxmlappexit disconnect NEO NMSP client
        setTimeout(function(){
            console.log('\nwait 1 second for server\n'); //debugging
            callback(null, 1000);
        }, 1000);
    },

    // 0. QA web test driver - agent login --------- (added after PSI3 iteration3.5)
    function(callback){
        //start web test driver based on app driver session
        //set base agent web page URL
        var BaseAgentURL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/agent/welcome';

        driver.get(BaseAgentURL);
        driver.getTitle().then(function(title){
            output_msg = '\nweb page title: ' + title;
            output_string += output_msg;
            console.log(output_msg);
            callback(null, title);
        })

    },
    function(callback){
        // input agent user login
        var element1 = driver.findElement(webdriver.By.xpath("//input[@id='username']"));
        if(element1.isDisplayed()){
            element1.clear().then(function(){
                element1.sendKeys('Gang').then(function(){
                    output_msg = '\nAgent login with user name: Gang';//for debugging
                    output_string += output_msg;
                    console.log(output_msg);
                    //
                    callback(null, 103);
                })
            });
        }else{
            callback(null, 103);
        }

    },
    function(callback){
        //submit simulated 'Agent' login
        var element = driver.findElement(webdriver.By.id('loginForm'));
        element.submit().then(function(){
            output_msg = '\nSubmit simulated Agent outcome result selection';//for debugging
            output_string += output_msg;
            console.log(output_msg);

            callback(null, 104);
        });
    },
    function(callback){
        //
        setTimeout(function(){
            console.log('\nwait 1 second for server\n'); //debugging
            callback(null, 104);
        }, 1500);
    }
],
    function(err, result){
        if(err){
            console.log('\n\nERROR found during agent web UI login. Quit!\n' + err + '\n\n');
            expect(err).to.have.length(0);
            done(err);

        }
    });
//

async.series([
    //wait for 1 sec
    function(callback){
        //special timeout here to make sure /vxmlappexit disconnect NEO NMSP client
        setTimeout(function(){
            console.log('\nwait 1 second for server\n'); //debugging
            callback(null, 0);
        }, 1000);
    },
    //
    // 1. QA App Test Driver ------------------------------------------
    function(callback){
        //Debug API - get session ids, return sessions in an array
        test_client.get(BaseDebugURL + '/sessions/ids', function(err, res, body){
            if(err){
                err_msg='Error found from http get request on /sessions/ids' + err;
                err_array.push(err_msg);
                console.log(err_msg, err);
                callback(err, 1);
            }
            //
            output_string += '\n\nDebug: send get session request on /sessions/ids done\n\n';//for debugging
            output_string += '\nResponse: ' + res.statusCode;//for debugging
            output_string += '\nBody: ' + body;//for debugging

            sessionID = body.match(/\[\"(.+)\"\]/)[1]; //got the first session after calling delete/cleanup sessions first by the parent test case
            output_string += '\nsessionID: ' + sessionID;//for debugging

            var result=[res, body];
            callback(null, result);
        });
    },

    function(callback){
        //
        setTimeout(function(){
            console.log('\nwait 2 second for server\n'); //debugging
            callback(null, 2);
        }, 1000);
    },

    //2. Agent Web Test Driver --------------------------------------------------
    function(callback){
        //start web test driver based on app driver session
        //set base agent web page URL
        var BaseAgentURL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/agent/sessionScreen?sessionId=' + sessionID;

        driver.get(BaseAgentURL).then(function(){
            output_msg = '\nQA Web test Driver ---- \nDebug: Test base URL ' + BaseAgentURL;//for debugging
            output_string += output_msg;
            console.log(output_msg);
            callback(null, 100);
        });

    },
    function(callback){
        // Wait for expected outcome selection agent page shown
        console.log('\nwait for server\n'); //debugging

        driver.wait(function() {
            return driver.isElementPresent(webdriver.By.id('outcome'));
        }, 20000).then(function(b){
                if(b){
                    output_msg = '\nFound the outcome selection agent web page with specific session id';//for debugging
                    output_string += output_msg;
                    console.log(output_msg);

                }else{
                    output_msg = '\nCan not find the outcome selection agent web page with specific session id';//for debugging
                    output_string += output_msg;
                    console.log(output_msg);
                }
                callback(null, 101);
            });

    },
    function(callback){
        // Customize (case by case) click/select one of agent outcome selections
        var element1 = driver.findElement(webdriver.By.xpath("//input[@id='pickListSelection4']"));
        if(element1.isDisplayed()){
            element1.click().then(function(){
                output_msg = '\nCustomize (case by case) click/select one of agent outcome selections';//for debugging
                output_string += output_msg;
                console.log(output_msg);

                callback(null, 102);
            });
        }else{
            callback(null, 102);
        }

    },
    function(callback){
        // Check which selection clicked
        var element1 = driver.findElement(webdriver.By.xpath("//input[@id='pickListSelection4']"));
        var element2 = driver.findElement(webdriver.By.xpath("//input[@id='pickListSelection5']"));
        element2.isSelected().then(function(b){
            if(b){
                output_msg = '\n WARNING - found the wrong agent web page selection element';//for debugging
                output_string += output_msg;
                console.log(output_msg);

                callback(null, 103);

            }else{
                element1.isSelected().then(function(b2){
                    if(b2){
                        output_msg = '\nFound the correct agent web page selection element';//for debugging
                        output_string += output_msg;
                        console.log(output_msg);

                        callback(null, 103);
                    }else{
                        console.log('\n ERROR! - Can not find the correct agent web page selection element');
                        output_string += output_msg;
                        console.log(output_msg);

                        callback(null, 103);
                    }
                })
            }
        });
    },
    function(callback){
        //submit simulated 'Agent' outcome result selection
        var element = driver.findElement(webdriver.By.id('outcome'));
        element.submit().then(function(){
            output_msg = '\nSubmit simulated Agent outcome result selection';//for debugging
            output_string += output_msg;
            console.log(output_msg);

            callback(null, 104);
        });
    },
    function(callback){
        //
        setTimeout(function(){
            console.log('\nwait 1 second for server\n'); //debugging
            callback(null, 104);
        }, 1500);
    },

    //3. Back to QA App Test Driver to check result ---------------------------------------------
    //Using session debug API
    function(callback){
        //Debug API - get session/{id}, return specific session info in an object
        test_client.get(BaseDebugURL + '/session/' + sessionID, function(err, res, body){
            if(err){
                err_msg='Error found from http get request on /session' + err;
                err_array.push(err_msg);
                console.log(err_msg, err);
                callback(err, 10);
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
            callback(null, 11);
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
            if(result[1][0].statusCode != 200){
                fail_error = '\n' + case_ID + ' failed get sessions! status code return wrong. \n';
                console.log('\n Check:' + result[1][0].statusCode);
                throw fail_error;
            }

            if(result[10][0].statusCode != 200){
                fail_error = '\n' + case_ID + ' failed to check sessions!\n';
                console.log('\n Check' + result[2][0].statusCode);
                throw fail_error;

            }

            if(result[10][1].search(sessionID) == -1){
                fail_error = '\n' + case_ID + ' failed to check sessions, result not 0!\n';
                console.log('\n Check' + result[2][1]);

                throw fail_error;

            }

            //log for post test check
            var pass_msg = '\nWeb simulator operation passed! ' + 'Output string:\n' + output_string;
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

        driver.quit();

        //calculate test elapse
        test_endTime = new Date();
        test_elapse = test_endTime - test_startTime;
        console.log('Test elapsed=' + test_elapse);

    });
//


