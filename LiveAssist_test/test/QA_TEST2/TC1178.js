//TC1178: Verify that Live Assist dynamic escalation classifier customized as Never escalation engine via IVR api call with agent outcome response
//US6815 dynamic escalation classifer
//-------------------------------------------------------
describe('TC1178: Verify that Live Assist dynamic escalation classifier customized as Never escalation engine via IVR api call with agent outcome response', function() {

//QA test setup ----------------------------------------------
    var case_ID = 1178;

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

    //for mysql test driver
    var mysql = require('mysql');
    var mysql_connection = mysql.createConnection({
        host    : TEST_HOST,
        port    : TestConfig.options.LA_mysql_port,
        user    : TestConfig.options.LA_mysql_user,
        password: TestConfig.options.LA_mysql_password,
        database: TestConfig.options.LA_mysql_database
    });
//    mysql_connection.connect(); //connect MySQL test driver

    //for web test driver
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
                        logger.info(err_msg, err);
                        //callback(err, 0);
                    }
                    //else {
                    console.log('\nMake sure agent logout before exit!\n' + logoutURL + '\n' + body + '\n');
                    callback(null, 0);
                    //}
                });
            },
            end_mysqldriver: function(callback){
                //for MySQL test driver
                mysql_connection.destroy();
                callback(null, 0);
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
                logger.info('Test elapsed=' + test_elapse);

                //remove all loaded module before case exit
                var cnt=0;
                console.log('\nmodule key #' + Object.keys(require.cache).length);

                async.whilst(
                    function(){ return cnt < Object.keys(require.cache).length; },
                    function(cb){
                        var key = Object.keys(require.cache).pop();
                        //                            logger.info('\ndeleted module:' + key);
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
    it('TC1178: Verify that Live Assist dynamic escalation classifier customized as Never escalation engine via IVR api call with agent outcome response', function(done) {
        var testAPIURL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/rest/app';
        var testDebutURL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/liveassist/rest/debug';

        var sessionID = 0; //set default 0
        var element1,element2, element3;

        //variables for MySQL test driver
        var mysql_query = '';
        var mysql_item = '';
        var mysql_ret = '';
        var query_ret = '';

        var mysql_table1 = 'applicationContextParams'; // define tables for mysql test driver to update/change/display
        var mysql_table2 = 'applicationContext'; // define tables for mysql test driver to update/change/display

        var bool_Insert1 = 0; //check if need to be insert items to table or not

        //QA MySQL test driver customized DB parameter values object array for this case
        //setup escalation classifier
        var test_item1 = [
            {applicationContextId: 3, name: 'minimum_confidence_threshold', value: '0'},
            {applicationContextId: 3, name: 'maximum_confidence_threshold', value: '0'},
            {applicationContextId: 3, name: 'immediate_percentage', value: '0'},
            {applicationContextId: 3, name: 'no_input_percentage', value: '0'},
            {applicationContextId: 3, name: 'low_confidence_percentage', value: '0'},
            {applicationContextId: 3, name: 'middle_confidence_percentage', value: '0'},
            {applicationContextId: 3, name: 'high_confidence_percentage', value: '0'},
            {applicationContextId: 3, name: 'agent_pending_completion_cause', value: 'SUCCESS'},
            {applicationContextId: 3, name: 'agent_pending_recognition_result', value: 'AGENT_PENDING'}
        ];
		var default_settings_item1 = [
            {applicationContextId: 3, name: 'minimum_confidence_threshold', value: '0'},
            {applicationContextId: 3, name: 'maximum_confidence_threshold', value: '0.5'},
            {applicationContextId: 3, name: 'immediate_percentage', value: '0'},
            {applicationContextId: 3, name: 'no_input_percentage', value: '0'},
            {applicationContextId: 3, name: 'low_confidence_percentage', value: '0'},
            {applicationContextId: 3, name: 'middle_confidence_percentage', value: '100'},
            {applicationContextId: 3, name: 'high_confidence_percentage', value: '0'},
            {applicationContextId: 3, name: 'agent_pending_completion_cause', value: 'SUCCESS'},
            {applicationContextId: 3, name: 'agent_pending_recognition_result', value: 'AGENT_PENDING'}
        ]; //simulate default confidence based escalation classifier

		var default_settings_item2 = [
            {applicationContextId: 3, name: 'minimum_confidence_threshold', value: '0'},
            {applicationContextId: 3, name: 'maximum_confidence_threshold', value: '1.0'},
            {applicationContextId: 3, name: 'immediate_percentage', value: '100'},
            {applicationContextId: 3, name: 'no_input_percentage', value: '0'},
            {applicationContextId: 3, name: 'low_confidence_percentage', value: '0'},
            {applicationContextId: 3, name: 'middle_confidence_percentage', value: '100'},
            {applicationContextId: 3, name: 'high_confidence_percentage', value: '0'},
            {applicationContextId: 3, name: 'agent_pending_completion_cause', value: 'SUCCESS'},
            {applicationContextId: 3, name: 'agent_pending_recognition_result', value: 'AGENT_PENDING'}
        ]; //simulate default always escalation classifier

        //trace HTTP call
        //nock.recorder.rec();

        async.series([
/*                function(callback){
                    //wait for 1 sec
                    setTimeout(function(){
                        output_msg = '\nwait 1 second for server\n';
                        logger.info(output_msg);
                        //
                        callback(null, 0);
                    }, 2000);
                },
*/
           //################# MySQL test driver ------------- [To customize test parameter in DB, support: DB connect, disconnect, query, update, insert and delete]
				//connect MySQL test driver
				function(callback){
					mysql_connection.connect(function(err){
						if(err){
							logger.info('\nFound error while create mysql DB connection!' + err.stack);
							callback(err, 0);
						}
						//
						mysql_ret = '\nMySQL test driver connection with DB done. \n';
						logger.info(mysql_ret);

						var result = [0, mysql_ret];
						callback(null, result);
						
					}); 
				}, 
                //MySQL test driver query check
                function(callback){
                    mysql_query = 'SELECT 1';
                    query_ret = mysql_connection.query(mysql_query, function(err, rows){
                        if(err){
                            logger.info('MySQL test driver error: ' + err.stack);
                            callback(err, 1);
                        }
                        mysql_ret = 'MySQL test driver query check ok: ' + query_ret.sql + '\nReturn: \n' + JSON.stringify(rows) + '\n';
                        logger.info(mysql_ret);

                        var result=[0, mysql_ret];
                        callback(null, result);
                    });
                },
                //MySQL driver select check
                function (callback) {
                    mysql_query = 'SELECT * FROM ' + mysql_table1;
                    query_ret = mysql_connection.query(mysql_query, function (err, rows) {
                        if (err) {
                            logger.info('MySQL test driver error: ' + err.stack);
                            callback(err, 2);
                        }
                        mysql_ret = 'MySQL test driver SELECT query ok: ' + query_ret.sql + '\nReturn: \n' + JSON.stringify(rows) + '\n';
                        logger.info(mysql_ret);

                        //check and set if need insert or update DB applicationContextParams table
                        bool_Insert1 = mysql_ret.search('\"applicationContextId\":3'); //return -1 if no match
                        logger.info('The bool_Insert1 return value: ' + bool_Insert1); //for debug info
                        //
                        var result = [0, mysql_ret];
                        callback(null, result);

                    });
                },
                //MySQL driver multiple insert and commit transaction
                function(callback) {
                    //check if applicationContextID = 3 exist, if not, insert; if yes, update
                    if(bool_Insert1 != -1){
                        //no need insert transaction to table, skip this step
                        mysql_ret = '\nNo MySQL test driver INSERT transaction needed at this step\n';
                        logger.info(mysql_ret);
                        var result = [0, mysql_ret];
                        callback(null, result);

                    }else {
                        //run the insert transaction
                        mysql_connection.beginTransaction(function (err) {
                            if (err) {
                                logger.info('\nMySQL test driver begin Transaction error: ' + err.stack);
                                callback(err, 3);
                            }
                            //
                            var cnt = 0;
                            async.whilst(
                                function(){
                                    return cnt < test_item1.length;
                                },
                                function(cb){
                                    mysql_query = 'INSERT INTO ' + mysql_table1 + ' SET ?';
                                    query_ret = mysql_connection.query(mysql_query, test_item1[cnt], function (err, rows) {
                                        if (err) {
                                            logger.info('\nMySQL test driver INSERT error: ' + err.stack);
                                            cb(err, 3);
                                        }
                                        mysql_ret = 'MySQL test driver INSERT query ok: ' + query_ret.sql;
                                        logger.info(mysql_ret);
                                        //
                                        cnt++;
                                        setTimeout(cb, 200);
                                    });
                                },
                                function(err){
                                    if(err){
                                        logger.info('MySQL test driver INSERT error: ' + err.stack);
                                        callback(err, 3);
                                    }else {
                                        mysql_connection.commit(function (err) {
                                            if (err) {
                                                mysql_connection.rollback(function () {
                                                    logger.info('MySQL test driver INSERT error and rollback: ' + err.stack);
                                                    callback(err, 3);
                                                });
                                            }
                                            mysql_ret = 'MySQL test driver INSERT commit ok \n';
                                            logger.info(mysql_ret);

                                            var result = [0, mysql_ret];
                                            callback(null, result);
                                        });
                                    }
                                }
                            );
                        });
                    }
                },
                //MySQL driver multiple update and commit DB transaction
                function (callback) {
					//execute update DB table transaction
					mysql_connection.beginTransaction(function (err) {
						if (err) {
							logger.info('MySQL test driver error: ' + err.stack);
							callback(err, 4);
						}
						var cnt = 0;
						async.whilst(
							function () {
								return cnt < test_item1.length;
							},
							function (cb) {
								mysql_connection.beginTransaction(function (err) {
									if (err) {
										logger.info('MySQL test driver error: ' + err.stack);
										cb(err);
									}
									mysql_query = 'UPDATE ' + mysql_table1 + ' SET value=? WHERE applicationContextId=? AND name=?';
									logger.info('\nFor debug: ' + mysql_query + '; ' + test_item1[cnt].value + '; ' + test_item1[cnt].applicationContextId + '; ' + test_item1[cnt].name + '\n');

									var query_ret = mysql_connection.query(mysql_query, [test_item1[cnt].value, test_item1[cnt].applicationContextId, test_item1[cnt].name], function (err, rows) {
										if (err) {
											logger.info('MySQL test driver error: ' + err.stack);
											cb(err);
										}
										mysql_ret = 'MySQL test driver UPDATE query ok: ' + query_ret.sql + '\n     Changed: ' + rows.changedRows + ' rows' + '\n';
										logger.info(mysql_ret);
										//
										++cnt;
										setTimeout(cb, 200);
									});
								});
							},
							function (err) {
								if (err) { //
									logger.info('MySQL test driver UPDATE error: ' + err.stack);
									callback(err, 4);
								} else {
									//DB transaction commit
									mysql_connection.commit(function (err) {
										if (err) {
											mysql_connection.rollback(function () {
												logger.info('MySQL test driver error: ' + err.stack);
												cb(err);
											});
										}
										mysql_ret = 'MySQL test driver UPDATE commit ok. \n';
										logger.info(mysql_ret);
										//
										var result = [0, mysql_ret];
										callback(null, result);
									});
								}
							}
						);
					});
                },
                //MySQL driver update and commit transaction
                function (callback) {
                    mysql_connection.beginTransaction(function(err) {
                        if (err) {
                            logger.info('MySQL test driver error: ' + err.stack);
                            callback(err, 5);
                        }
                        mysql_query = 'UPDATE ' + mysql_table2 + ' SET escalationClassifierId=\'DynamicEscalationClassifier\' WHERE applicationConfigurationId=4 AND name=\'mainmenu\'';
                        query_ret = mysql_connection.query(mysql_query, function (err, rows) {
                            if (err) {
                                logger.info('MySQL test driver error: ' + err.stack);
                                callback(err, 5);
                            }
                            //commit
                            mysql_connection.commit(function (err) {
                                if (err) {
                                    mysql_connection.rollback(function () {
                                        logger.info('MySQL test driver error: ' + err.stack);
                                        callback(err, 5);
                                    });
                                }
                                mysql_ret = 'MySQL test driver UPDATE query ok: ' + query_ret.sql + '\n     Changed: ' + rows.changedRows + ' rows' + '\n';
                                logger.info(mysql_ret);

                                var result = [0, mysql_ret];
                                callback(null, result);
                            })
                        });
                    });
                },
                //MySQL driver select check test table1 after multiple DB transactions
                function(callback){
                    mysql_query = 'SELECT * FROM ' + mysql_table1;

                    var query = mysql_connection.query(mysql_query, function(err, rows){
                        if(err){
                            logger.info('\nMySQL test driver error: ' + err.stack);
                            callback(err, 6);
                        }
                        mysql_ret = 'MySQL test driver SELECT query ok: ' + query.sql + '\nReturn: \n' + JSON.stringify(rows) + '\n';
                        logger.info(mysql_ret);

                        var result=[0, mysql_ret];
                        callback(null, result);
                    });
                },
                //MySQL driver select check test table2 after multiple DB transactions
                function(callback){
                    mysql_query = 'SELECT * FROM ' + mysql_table2;

                    var query = mysql_connection.query(mysql_query, function(err, rows){
                        if(err){
                            logger.info('\nMySQL test driver error: ' + err.stack);
                            callback(err, 7);
                        }
                        mysql_ret = 'MySQL test driver SELECT query ok: ' + query.sql + '\nReturn: \n' + JSON.stringify(rows) + '\n';
                        logger.info(mysql_ret);

                        var result=[0, mysql_ret];
                        callback(null, result);
                    });
                },
/*				//MySQL test driver end connection
				function(callback){
					mysql_connection.end(function(err){
						if(err){
							logger.info('\nFound error while end mysql DB connection!' + err.stack);
							callback(err, 8);
						}
						//
						mysql_ret = '\nEnd MySQL test driver. \n';
						logger.info(mysql_ret);

						var result = [0, mysql_ret];
						callback(null, result);
					});
				},
*/
				//################# Web test driver --- sign in agent GUI
                //wait for 1 sec
                function(callback){
                    //wait for 1 sec
                    setTimeout(function(){
                        output_msg = '\nwait 1 second for server\n';
                        output_string += output_msg;
                        logger.info(output_msg);

                        callback(null, 9);
                    }, 5000);
                },
                function(callback){
                    //Debug API - delete all sessions (status: 204)
                    test_client.delete(testDebutURL + '/sessions', function(err, res, body){
                        if(err){
                            err_msg='Error found from http delete request on /sessions' + err;
                            err_array.push(err_msg);
                            logger.info(err_msg, err);
                            callback(err, 10);
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

                            callback(null, 13)
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
                        callback(null, 14);
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
                        callback(null, 15);
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
                        callback(null, 16);
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
                            logger.info(output_msg);

                            callback(null, 17);
                        }
                    });
                },
				function(callback){
                    //wait for 1 sec
                    setTimeout(function(){
                        output_msg = '\nwait 1 second for server\n';
                        logger.info(output_msg);
                        //
                        callback(null, 18);
                    }, 3000);
                },
                //################# App test driver --- Simple app API to trigger call
                function(callback){
                    //ivr call steering app: dnis=4627, app context = 'mainmenu', confidence value = 1
                    //get the external session ID for each call
                    call_externalSessionID = '0a0325e7_00004175_528d983c_' + case_ID + '_'+ '0001';

                    //no-match, low conf =0.4
                    var testBodyParam =  "ani=sip%3A5145551234%4010.3.53.192%3A5064&dnis=sip%3A4627%40mtl-da53&externalSessionID=" + call_externalSessionID + "&sessionID=&configurationName=mainmenu&completionCause=success&recognitionResult=%3C%3Fxml+version%3D%271.0%27%3F%3E%3Cemma%3Aemma+version%3D%221.0%22+xmlns%3Aemma%3D%22http%3A%2F%2Fwww.w3.org%2FTR%2F2007%2FCR-emma-20071211%22+xmlns%3Anuance%3D%22http%3A%2F%2Fnr10.nuance.com%2Femma%22%3E%3Cemma%3Agrammar+id%3D%22grammar_1%22+ref%3D%22session%3Ahttp%3A%2F%2Fmt-jdebroin%3A8080%2Fliveassist%2Fdata%2Fvxmldemo%2Fivrapi%2Fcallsteering%2Fmainmenu.grxml+-1+-1+10000%22%2F%3E%3Cemma%3Ainterpretation+id%3D%22interp_1%22+emma%3Auninterpreted%3D%22true%22+emma%3Aconfidence%3D%220.4%22+emma%3Agrammar-ref%3D%22grammar_1%22+emma%3Atokens%3D%22operator%22+emma%3Aduration%3D%227100%22+nuance%3Aeos-silence%3D%221140%22%2F%3E%3C%2Femma%3Aemma%3E&utterance=http%3A%2F%2Fmtl-da53%3A90%2FNuance%2FcallLogs%2FTest1%2F2014%2F02February%2F21%2F15%2FNUAN-22-24-mtl-da53-0a0325e7_000011c2_5307b580_00d4_0001-utt001-SAVEWAVEFORM.wav";
                    //var testBodyParam = "ani=sip:5145551234@10.3.53.192:5064&dnis=sip:4627@mtl-da53&externalSessionID=0a0325e7_000011c2_5307b580_00d4_0001&sessionID=&configurationName=mainmenu&completionCause=success&recognitionResult=%3C%3Fxml%20version%3D%271.0%27%3F%3E%3Cemma%3Aemma%20version%3D%271.0%27%20xmlns%3Aemma%3D%27http%3A%2F%2Fwww.w3.org%2FTR%2F2007%2FCR-emma-20071211%27%20xmlns%3Anuance%3D%27http%3A%2F%2Fnr10.nuance.com%2Femma%27%3E%3Cemma%3Agrammar%20id%3D%27grammar_1%27%20ref%3D%27session%3Ahttp%3A%2F%2Fmt-ray-vm03%3A8080%2Fliveassist%2Fdata%2Fvxmldemo%2Fivrapi%2Fcallsteering%2Fmainmenu.grxml%20-1%20-1%2010000%27%2F%3E%3Cemma%3Ainterpretation%20id%3D%27interp_1%27%20emma%3Auninterpreted%3D%27true%27%20emma%3Aconfidence%3D%270.3%27%20emma%3Agrammar-ref%3D%27grammar_1%27%20emma%3Atokens%3D%27operator%27%20emma%3Aduration%3D%277100%27%20nuance%3Aeos-silence%3D%271178%27%2F%3E%3C%2Femma%3Aemma%3E&utterance=http://mtl-da53:90/Nuance/callLogs/Test1/2014/02February/21/15/NUAN-22-24-mtl-da53-0a0325e7_000011c2_5307b580_00d4_0001-utt001-SAVEWAVEFORM.wav";

                    test_client.post(testAPIURL + '/inputInteractionStep', testBodyParam, function(err, res, body){
                        if(err){
                            err_msg='Error found from http post request on /inputInteractionStep' + err;
                            err_array.push(err_msg);
                            logger.info(err_msg, err);
                            callback(err, 19);
                        }

                        //var body_ret = JSON.parse(body);
                        var body_ret = body;

                        var msg = '\n\nDebug: send post request \'\/inputInteractionStep\' done\n\n';//for debugging
                        msg += '\npost test body param: ' + testBodyParam; //for debugging
                        msg += '\nResponse: ' + res;//for debugging
                        msg += '\nBody: ' + body_ret;//for debugging

                        //get session ID from the response
                        //Body: {"state":"agentPending","outcome":null,"sessionID":"session:Nuance-IvrApiCallSteering:4707f66b-4443-44dc-8408-291c9ec1690c","completionCause":null}
                        //var obj = JSON.parse(body_ret);
                        //sessionID = obj.sessionID;
                        sessionID = body.match(/sessionID>(.+)<\/sessionID/)[1]; //pattern search found the real sessionID #

                        msg += '\nSessionID from /inputInteractionStep is: ' + sessionID;
                        output_string += msg;
                        logger.info(msg);

                        var result=[res, body];
                        callback(null, result);
                    });
                },

				function(callback){
                    //wait for 1 sec
                    setTimeout(function(){
                        output_msg = '\nwait 1 second for server\n';
                        logger.info(output_msg);
                        //
                        callback(null, 20);
                    }, 3000);
                },
				//Back to WEB GUI test driver #####################
                function(callback){
                    //test on ng-click and button #####################
                    element1 = ptor.element(protractor.By.id('signOutButton'));
                    element1.click().then(function(){
                        output_msg = '\nTested button clicked';
                        output_string += output_msg;
                        logger.info(output_msg);
                        //
                        callback(null, 21);
                    });
                },
                function(callback){
                    //
                    setTimeout(function(){
                        logger.info('\nwait 1 second for server\n'); //debugging
                        callback(null, 22);
                    }, 1000);
                },
                //################# App test driver --- Simple app API to check session return result
               function(callback){
                    //
                    var testBodyParam = 'sessionID=' + sessionID;

                    test_client.post(testAPIURL + '/inputInteractionStep', testBodyParam, function(err, res, body){
                        if(err){
                            err_msg='Error found from http post request on /inputInteractionStep' + err;
                            err_array.push(err_msg);
                            logger.info(err_msg, err);
                            callback(err, 23);
                        }

                        //var body_ret = JSON.parse(body);
                        //var body_ret = JSON.stringify(body);
                        body_ret = body;

                        output_string += '\n\nDebug: send post request \'\/inputInteractionStep\' done\n\n';//for debugging
                        output_string += '\npost test body param: ' + testBodyParam; //for debugging
                        output_string += '\nResponse: ' + res;//for debugging
                        output_string += '\nBody: ' + body_ret;//for debugging

                        var msg = '\ncheck Session return from /inputInteracationStep is:\n' + body_ret + '\n';
                        logger.info(msg);

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
                            logger.info(err_msg, err);
                            callback(err, 24);
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
                        callback(null, 25);
                    }, 2000);
                },

		//############## MySQL test driver ######################
			   //restore default dynamic escalation classifier settings 
					//MySQL driver multiple update and commit DB transaction 
                function (callback) {
					var test_item_table = default_settings_item2;

					//execute update DB table transaction
					mysql_connection.beginTransaction(function (err) {
						if (err) {
							logger.info('MySQL test driver error: ' + err.stack);
							callback(err, 4);
						}
						var cnt = 0;
						async.whilst(
							function () {
								return cnt < test_item_table.length;
							},
							function (cb) {
								mysql_connection.beginTransaction(function (err) {
									if (err) {
										logger.info('MySQL test driver error: ' + err.stack);
										cb(err);
									}
									mysql_query = 'UPDATE ' + mysql_table1 + ' SET value=? WHERE applicationContextId=? AND name=?';
									logger.info('\nFor debug: ' + mysql_query + '; ' + test_item_table[cnt].value + '; ' + test_item_table[cnt].applicationContextId + '; ' + test_item_table[cnt].name + '\n');

									var query_ret = mysql_connection.query(mysql_query, [test_item_table[cnt].value, test_item_table[cnt].applicationContextId, test_item_table[cnt].name], function (err, rows) {
										if (err) {
											logger.info('MySQL test driver error: ' + err.stack);
											cb(err);
										}
										mysql_ret = 'MySQL test driver UPDATE query ok: ' + query_ret.sql + '\n     Changed: ' + rows.changedRows + ' rows' + '\n';
										logger.info(mysql_ret);
										//
										++cnt;
										setTimeout(cb, 200);
									});
								});
							},
							function (err) {
								if (err) { //
									logger.info('MySQL test driver UPDATE error: ' + err.stack);
									callback(err, 4);
								} else {
									//DB transaction commit
									mysql_connection.commit(function (err) {
										if (err) {
											mysql_connection.rollback(function () {
												logger.info('MySQL test driver error: ' + err.stack);
												cb(err);
											});
										}
										mysql_ret = 'MySQL test driver UPDATE commit ok. \n';
										logger.info(mysql_ret);
										//
										var result = [0, mysql_ret];
										callback(null, result);
									});
								}
							}
						);
					});
				 }, 
				//MySQL test driver end connection
				function(callback){
					mysql_connection.end(function(err){
						if(err){
							logger.info('\nFound error while end mysql DB connection!' + err.stack);
							callback(err, 8);
						}
						//
						mysql_ret = '\nEnd MySQL test driver. \n';
						logger.info(mysql_ret);

						var result = [0, mysql_ret];
						callback(null, result);
					});
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
                    expect(result[1][1]).to.match(/\"1\":1/);
                    expect(result[3][1]).to.match(/MySQL test driver INSERT/);
                    expect(result[4][1]).to.match(/MySQL test driver UPDATE/);
                    expect(result[6][1]).to.match(/\"applicationContextId\":3,\"name\":\"minimum_confidence_threshold\",\"value\":\"0\"/)
                        .and.to.match(/\"applicationContextId\":3,\"name\":\"maximum_confidence_threshold\",\"value\":\"0\"/)
                        .and.to.match(/\"applicationContextId\":3,\"name\":\"immediate_percentage\",\"value\":\"0\"/);
                    expect(result[7][1]).to.match(/\"id\":3,\"applicationConfigurationId\":4,\"name\":\"mainmenu\"/)
                        .and.to.match(/\"escalationClassifierId\":\"DynamicEscalationClassifier\"/);

/*                    expect(result[11][0]).to.match(/Nuance Live Assist/);
                    expect(result[12][0]).to.match(/https:.+liveassist\/app/); //default sign in page (all point to /app)

                    expect(result[18][0].statusCode).to.eql(200);
                    expect(result[18][1]).to.match(/<state>useASRResult<\/state>/);

                    expect(result[19][1]).to.match(/<inputInteractionStepResult>/)
                        .and.to.match(/<state>useASRResult<\/state>/)
                        .and.to.match(/<\/inputInteractionStepResult>/);
*/
                    expect(result[11][0]).to.match(/Nuance Live Assist/);
                    expect(result[12][0]).to.match(/https:.+liveassist\/app/); //default sign in page (all point to /app)

                    expect(result[18][0].statusCode).to.eql(200);
                    expect(result[18][1]).to.match(/<state>useASRResult<\/state>/);

                    expect(result[22][1]).to.match(/<inputInteractionStepResult>/)
                        .and.to.match(/<state>useASRResult<\/state>/)
                        .and.to.match(/<\/inputInteractionStepResult>/);

                    //log for post test check
                    var pass_msg = '\nTest passed! ';// + 'Output string:\n' + output_string;
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