//TC1130: Verify that Live Assist agent GUI welcome page with basic url - title - message check

//-------------------------------------------------------
describe('TC1130: Verify that Live Assist agent GUI welcome page with basic url - title - message check', function() {
//QA test setup ----------------------------------------------
    var case_ID = 1130;

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

	var async = require('async');
    var winston = require('winston'); //console/file logging module for testing
    var os = require('os');
    var nock = require('nock');   //mock library, REST API: post/put/get/delete/...
    var nockOptions = {allowUnmocked: true};

//    var protractor = null;
//    var ptor;
    var protractor = null;
    var ptor = null;

    process.setMaxListeners(0);  //Define unlimited listeners
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //special for Error: DEPTH_ZERO_SELF_SIGNED_CERT on nodejs

    this.timeout(30000); //set timeout for test case

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
/*              //Old without QA browser driver wrapper
                //check which browser driver protractor need to use
                if(TestConfig.options.browser_driver == "firefox"){
                    driver = new protractor.Builder().          //define driver instance for Selenium server used/wrapped with protractor
                            usingServer(selenium_server).
                            withCapabilities(
                                protractor.Capabilities.firefox()  //Firefox test
                            ).build();
                }else if(TestConfig.options.browser_driver == "chrome"){
                        //Added for Chrome test
                        var chromeOptions = protractor.Capabilities.chrome();
                        chromeOptions['caps_'].chromeOptions = {
                            args:['--disable-web-security']
                        };
                        driver = new protractor.Builder().          //define driver instance for Selenium server used/wrapped with protractor
                                usingServer(selenium_server).
                                withCapabilities(
                                    chromeOptions               //Chrome test
                                ).build();
                }else{
                    var err_msg = "wrong browser driver name!";
                    logger.info(err_msg);
                    callback(err_msg, 2);
                }
                ptor = protractor.wrapDriver(driver);
*/
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
				logger.info('\nError happened from the case beforeEach block!\n' + err + '\n');
                done1(err);
			}
			//
			done1();
		});
    });

//-------------------------------------------------------
    afterEach(function(done2){
        async.series({
            end_webdriver: function(callback){
                ptor.quit().then(function(){
                    ptor = null;
                    delete ptor;
                    callback(null, 0);
                });
            },
            remove_logger: function(callback){
                logger.remove(winston.transports.Console);
                logger.remove(winston.transports.File);
                callback(null, 1);
            },
            remove_modules: function(callback){
              //  setTimeout(function(){
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
    it('TC1130: Verify that Live Assist agent GUI welcome page with basic url - title - message check', function(done) {
        //trace HTTP call
       // nock.recorder.rec();

        var element1,element2, element3;

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
                    ptor.navigate('app/');
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
      /*      function(callback){
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
      */
            function(callback){
                setTimeout(function(){
                    output_msg = '\nwait 1 second for server\n';
                    output_string += output_msg;
                    console.log(output_msg);
                    //
                    callback(null, 3);
                }, 2000);
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
                    console.log('Assertion check:\n');
                    expect(result[1][0]).to.match(/liveassist\/app/);
                    expect(result[2][0]).to.match(/Nuance Live Assist/);
                    //expect(result[3][0]).to.match(/What\'s next/);

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