/*
 web_2201: Web GUI test simulator - agent response outcome result with - request-agent for verification that cancelInteraction and endSession usage from call steering demo app by end to end QA-user call -> agent web GUI -> Hangup -> check session log
 TC2201: Agent Web UI login
 **/
//QA test case description, verification & assertion check
//QA test setup ----------------------------------------------
//define variables for QA test
var case_ID = 2201;
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

//Selenium - WebdriverJs
driver = new webdriver.Builder().
    //usingServer(server.address()).
    withCapabilities(webdriver.Capabilities.firefox()).
    build();

//---------------------------------------------
//QA http test client setup ------------------------------------------
var test_client = {
    //Get method http client request
    get: function(url, cb){
        request(url, function(err, res, body){
            if(err){
                err_msg='\ntest client http get request found error: ' + err;
                err_array.push(err_msg);
                Logger.info(err_msg, err);
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
                    Logger.info(err_msg, err);
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
                Logger.info(err_msg, err);
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
        Logger.info('Remove file warning: can not open the file or no ' + logFile + ' exist at all\n');
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
    //wait for 1 sec
    function(callback){
        //special timeout here to make sure /vxmlappexit disconnect NEO NMSP client
        setTimeout(function(){
            Logger.info('\nwait 1 second for server\n'); //debugging
            callback(null, 0);
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
            Logger.info(output_msg);
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
                    Logger.info(output_msg);
                    //
                    callback(null, 2);
                })
            });
        }else{
            callback(null, 2);
        }

    },
    function(callback){
        //submit simulated 'Agent' login
        var element = driver.findElement(webdriver.By.id('loginForm'));
        element.submit().then(function(){
            output_msg = '\nSubmit simulated Agent outcome result selection';//for debugging
            output_string += output_msg;
            Logger.info(output_msg);

            callback(null, 3);
        });
    },
    function(callback){
        //
        setTimeout(function(){
            Logger.info('\nwait 1 second for server\n'); //debugging
            callback(null, 4);
        }, 2000);
    },
    function(callback){
        //Debug API - get sessions (200, body: [0])
        test_client.get(BaseDebugURL + '/sessions', function(err, res, body){
            if(err){
                err_msg='Error found from http get request on /sessions' + err;
                err_array.push(err_msg);
                console.log(err_msg, err);
                callback(err, 5);
            }
            output_string += '\n\nDebug: send get session request on /sessions done\n\n';//for debugging
            output_string += '\nResponse: ' + res.statusCode;//for debugging
            output_string += '\nBody: ' + body;//for debugging
            Logger.info (output_string);

            var result=[res, body];
            callback(null, result);
        });
    },
    function(callback){
        //
        setTimeout(function(){
            console.log('\nwait 1 second for server\n'); //debugging
            callback(null, 6);
        }, 1000);
    }
],
    function(err, result){
        if(err){
            Logger.info('\n\nERROR found during agent web UI login. Quit!\n' + err + '\n\n');
            expect(err).to.have.length(0);
            done(err);

        }

        driver.quit();
    });
//
