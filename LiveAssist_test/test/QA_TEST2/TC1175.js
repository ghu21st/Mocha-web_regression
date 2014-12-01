//TC1175: Verify that Live Assist escalation threshold and percentage context parameter changes in the database for dynamic escalation classifier
//-------------------------------------------------------
describe('TC1175: Verify that Live Assist escalation threshold and percentage context parameter changes in the database for dynamic escalation classifier', function() {

//QA test setup ----------------------------------------------
    var case_ID = 1175;

    var err_msg;    //temp single error message
    var err_array;  //error message array
    var output_string = ''; //result return array
    var output_msg = '';  //temp single result return
    var test_startTime;
    var test_endTime; //for time elapse calculation
    var test_elapse = 0;

//global env settings
    var TestConfig = require('../Config/TestConfig.js');
    var TEST_HOST = TestConfig.options.server;  //Ex: '10.3.41.59' change it if test server changed
    var TEST_PORT = TestConfig.options.port;    //ex: '8080', change it if test server changed
    var test_location = TestConfig.options.test_location;              //test base folder
    var test_url = TestConfig.options.test_Url;                      //agent GUI URL

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
        host: TEST_HOST,
        port: TestConfig.options.LA_mysql_port,
        user: TestConfig.options.LA_mysql_user,
        password: TestConfig.options.LA_mysql_password,
        database: TestConfig.options.LA_mysql_database

    });
    mysql_connection.connect(); //connect MySQL test driver

    //test case process/timeout
    process.setMaxListeners(0);//Define unlimited listeners
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //special for Error: DEPTH_ZERO_SELF_SIGNED_CERT on nodejs
    this.timeout(50000); //set timeout for test case

//-------------------------------------------------------
    beforeEach(function (done1) {
        //record test start time
        test_startTime = new Date();

        //initialize for testing
        err_msg = '';    //temp single error message
        err_array = [];  //error message array
        output_msg = '';  //temp single result return

        //setup QA logging
        require('fs').unlink(logFile, function (err) {
            if (err) {
                console.log('Remove file error or no ' + logFile + ' exist at all\n');
            }
        });
        logger = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)({level: 'info'}),
                new (winston.transports.File)({
                    filename: logFile,
                    level: 'info',
                    maxsize: 40960,
                    maxFiles: 200,
                    json: false,
                    timestamp: false
                })
            ]
        });
        logger.info('Test started and logging at: ' + logFile);
        //logger.extend(console); //log everything from console to logger(save to log file)

        done1();
    });

//-------------------------------------------------------
    afterEach(function (done2) {
        async.series({
            end_mysqldriver: function (callback) {
                //for MySQL test driver
                mysql_connection.destroy();
                callback(null, 0);
            },
            remove_logger: function (callback) {
                logger.remove(winston.transports.Console);
                logger.remove(winston.transports.File);
                callback(null, 0);
            },
            remove_modules: function (callback) {
                // setTimeout(function(){
                //calculate test elapse
                test_endTime = new Date();
                test_elapse = test_endTime - test_startTime;
                console.log('Test elapsed=' + test_elapse);

                //remove all loaded module before case exit
                var cnt = 0;
                console.log('\nmodule key #' + Object.keys(require.cache).length);

                async.whilst(
                    function () {
                        return cnt < Object.keys(require.cache).length;
                    },
                    function (cb) {
                        var key = Object.keys(require.cache).pop();
                        //                            console.log('\ndeleted module:' + key);
                        delete require.cache[key];
                        cnt++;
                        setTimeout(cb, 20);
                    },
                    function (err) {
                        if (err) { //the second #2 task/function found error
                            callback(err, 3);
                        } else {
                            callback(null, 3);
                        }
                    }
                );
                //}, 2000);
            }
        }, function (err, results) {
            if (err) {
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
    it('TC1175: Verify that Live Assist escalation threshold and percentage context parameter changes in the database for dynamic escalation classifier', function (done) {
        //variables for MySQL test driver
        var mysql_query = '';
        var mysql_item = '';
        var mysql_ret = '';
        var query_ret = '';

        var mysql_table1 = 'applicationContextParams'; // define tables for mysql test driver to update/change/display

		var default_settings_item1 = [
            {applicationContextId: 1, name: 'minimum_confidence_threshold', value: '0'},
            {applicationContextId: 1, name: 'maximum_confidence_threshold', value: '0.5'},
            {applicationContextId: 1, name: 'immediate_percentage', value: '0'},
            {applicationContextId: 1, name: 'no_input_percentage', value: '0'},
            {applicationContextId: 1, name: 'low_confidence_percentage', value: '0'},
            {applicationContextId: 1, name: 'middle_confidence_percentage', value: '100'},
            {applicationContextId: 1, name: 'high_confidence_percentage', value: '0'},
            {applicationContextId: 1, name: 'agent_pending_completion_cause', value: 'SUCCESS'},
            {applicationContextId: 1, name: 'agent_pending_recognition_result', value: 'AGENT_PENDING'}
        ]; //simulate default confidence based escalation classifier

		var default_settings_item2 = [
            {applicationContextId: 1, name: 'minimum_confidence_threshold', value: '0'},
            {applicationContextId: 1, name: 'maximum_confidence_threshold', value: '1.0'},
            {applicationContextId: 1, name: 'immediate_percentage', value: '100'},
            {applicationContextId: 1, name: 'no_input_percentage', value: '0'},
            {applicationContextId: 1, name: 'low_confidence_percentage', value: '0'},
            {applicationContextId: 1, name: 'middle_confidence_percentage', value: '100'},
            {applicationContextId: 1, name: 'high_confidence_percentage', value: '0'},
            {applicationContextId: 1, name: 'agent_pending_completion_cause', value: 'SUCCESS'},
            {applicationContextId: 1, name: 'agent_pending_recognition_result', value: 'AGENT_PENDING'}
        ]; //simulate default always escalation classifier

        //trace HTTP call
        //nock.recorder.rec();

        async.series([
                function (callback) {
                    //wait for 1 sec
                    setTimeout(function () {
                        output_msg = '\nwait 1 second for server\n';
                        logger.info(output_msg);
                        //
                        callback(null, 0);
                    }, 2000);
                },
                //################# MySQL test driver ------------- [support: DB connect, disconnect, query, update, insert and delete]
                //MySQL test driver query check
                function (callback) {
                    mysql_query = 'SELECT 1';
                    query_ret = mysql_connection.query(mysql_query, function (err, rows) {
                        if (err) {
                            logger.info('MySQL test driver error: ' + err.stack);
                            callback(err, 1);
                        }
                        mysql_ret = 'MySQL test driver check ok: ' + query_ret.sql + '\nReturn: \n' + JSON.stringify(rows) + '\n';
                        logger.info(mysql_ret);

                        var result = [0, mysql_ret];
                        callback(null, result);
                    });
                },
                //MySQL driver update and commit transaction
                function (callback) {
                    mysql_connection.beginTransaction(function(err) {
                        if (err) {
                            logger.info('MySQL test driver error: ' + err.stack);
                            callback(err, 2);
                        }
                        mysql_query = 'UPDATE ' + mysql_table1 + ' SET value=0.99 WHERE applicationContextId=1 AND name=\'minimum_confidence_threshold\'';
                        query_ret = mysql_connection.query(mysql_query, function (err, rows) {
                            if (err) {
                                logger.info('MySQL test driver error: ' + err.stack);
                                callback(err, 2);
                            }
                            //commit
                            mysql_connection.commit(function (err) {
                                if (err) {
                                    mysql_connection.rollback(function () {
                                        logger.info('MySQL test driver error: ' + err.stack);
                                        callback(err, 2);
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
                //MySQL driver select check
                function (callback) {
                    mysql_query = 'SELECT * FROM ' + mysql_table1;
                    query_ret = mysql_connection.query(mysql_query, function (err, rows) {
                        if (err) {
                                logger.info('MySQL test driver error: ' + err.stack);
                                callback(err, 3);
                        }
                        mysql_ret = 'MySQL test driver SELECT query ok: ' + query_ret.sql + '\nReturn: \n' + JSON.stringify(rows) + '\n';
                        logger.info(mysql_ret);

                        var result = [0, mysql_ret];
                        callback(null, result);

                    });
                },
                //MySQL driver update and commit transaction
                function (callback) {
                    mysql_connection.beginTransaction(function(err) {
                        if (err) {
                            logger.info('MySQL test driver error: ' + err.stack);
                            callback(err, 2);
                        }
                        //
                        mysql_query = 'UPDATE ' + mysql_table1 + ' SET value=0 WHERE applicationContextId=1 AND name=\'minimum_confidence_threshold\'';
                        query_ret = mysql_connection.query(mysql_query, function (err, rows) {
                            if (err) {
                                logger.info('MySQL test driver error: ' + err.stack);
                                callback(err, 4);
                            }
                            //commit
                            mysql_connection.commit(function (err) {
                                if (err) {
                                    mysql_connection.rollback(function () {
                                        logger.info('MySQL test driver error: ' + err.stack);
                                        callback(err, 4);
                                    });
                                }
                                mysql_ret = 'MySQL test driver UPDATE query ok: ' + query_ret.sql + '\n     Changed: ' + rows.changedRows + ' rows' + '\n';
                                logger.info(mysql_ret);

                                var result = [0, mysql_ret];
                                callback(null, result);
                            });
                        });
                    });
                },
                //MySQL driver select check
                function (callback) {
                    mysql_query = 'SELECT * FROM ' + mysql_table1;
                    query_ret = query_ret = mysql_connection.query(mysql_query, function (err, rows) {
                        if (err) {
                            logger.info('MySQL test driver error: ' + err.stack);
                            callback(err, 5);
                        }
                        mysql_ret = 'MySQL test driver SELECT query ok: ' + query_ret.sql + '\nReturn: \n' + JSON.stringify(rows) + '\n';
                        logger.info(mysql_ret);

                        var result = [0, mysql_ret];
                        callback(null, result);
                    });
                },
                //MySQL driver insert and commit transaction
                function (callback) {
                    mysql_connection.beginTransaction(function(err) {
                        if (err) {
                            logger.info('MySQL test driver error: ' + err.stack);
                            callback(err, 2);
                        }
                        //
                        mysql_query = 'INSERT INTO ' + mysql_table1 + ' SET ?';
                        mysql_item = {applicationContextId: 99, name: 'QA_TEST1', value: '99'};

                        query_ret = mysql_connection.query(mysql_query, mysql_item, function (err, rows) {
                            if (err) {
                                logger.info('\nMySQL test driver error and rollback: ' + err.stack);
                                callback(err, 6);
                            }
                            //commit
                            mysql_connection.commit(function (err) {
                                if (err) {
                                    mysql_connection.rollback(function () {
                                        logger.info('MySQL test driver error: ' + err.stack);
                                        callback(err, 4);
                                    });
                                }
                                mysql_ret = 'MySQL test driver INSERT query ok: ' + query_ret.sql + '\n     Changed: ' + rows.changedRows + ' rows' + '\n';
                                logger.info(mysql_ret);

                                var result = [0, mysql_ret];
                                callback(null, result);
                            });
                        });
                    });
                },
                //MySQL driver select check
                function (callback) {
                    mysql_query = 'SELECT * FROM ' + mysql_table1;

                    query_ret = mysql_connection.query(mysql_query, function (err, rows) {
                        if (err) {
                            logger.info('\nMySQL test driver error: ' + err.stack);
                            callback(err, 7);
                        }
                        mysql_ret = 'MySQL test driver SELECT query ok: ' + query_ret.sql + '\nReturn: \n' + JSON.stringify(rows) + '\n';
                        logger.info(mysql_ret);

                        var result = [0, mysql_ret];
                        callback(null, result);
                    });
                },
                //MySQL driver delete and commit transaction
                function (callback) {
                    mysql_connection.beginTransaction(function(err) {
                        if (err) {
                            logger.info('MySQL test driver error: ' + err.stack);
                            callback(err, 2);
                        }
                        //
                        mysql_query = 'DELETE FROM ' + mysql_table1 + ' WHERE applicationContextId=99';

                        query_ret = mysql_connection.query(mysql_query, function (err, rows) {
                            if (err) {
                                logger.info('\nMySQL test driver error and rollback: ' + err.stack);
                                callback(err, 8);
                            }
                            //commit
                            mysql_connection.commit(function (err) {
                                if (err) {
                                    mysql_connection.rollback(function () {
                                        logger.info('MySQL test driver error: ' + err.stack);
                                        callback(err, 4);
                                    });
                                }
                                mysql_ret = 'MySQL test driver DELETE query ok: ' + query_ret.sql + '\n' + ' Affected: ' + rows.affectedRows + ' rows\n';
                                logger.info(mysql_ret);

                                var result = [0, mysql_ret];
                                callback(null, result);
                            });
                        });
                    });
                },
                //MySQL driver check
                function (callback) {
                    mysql_query = 'SELECT * FROM ' + mysql_table1;
                    query_ret = mysql_connection.query(mysql_query, function (err, rows) {
                        if (err) {
                            logger.info('\nMySQL test driver error: ' + err.stack);
                            callback(err, 9);
                        }
                        mysql_ret = 'MySQL test driver SELECT query ok: ' + query_ret.sql + '\nReturn: \n' + JSON.stringify(rows) + '\n';
                        logger.info(mysql_ret);

                        var result = [0, mysql_ret];
                        callback(null, result);
                    });
                },
				//Restore to default
               //restore default dynamic escalation classifier settings 
					//MySQL driver multiple update and commit DB transaction 
                function (callback) {
					var test_item_table = default_settings_item2; //always escalate

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

                //wait for 1 sec
                function (callback) {
                    //wait for 1 sec
                    setTimeout(function () {
                        callback(null, 10);
                    }, 1000);
                }
            ],
            function (err, result) {
                if (err) {
                    console.log('\n\nERROR found during this case execution. Quit!\n' + err + '\n\n');
                    expect(err).to.have.length(0);
                    done(err);

                }
                //using try & catch block to customize the output message if the case failed
                try {
                    //
                    console.log('for testing\n');

                    expect(result[1][1]).to.match(/\"1\":1/);
                    expect(result[2][1]).to.match(/MySQL test driver UPDATE query ok/);
                    expect(result[3][1]).to.match(/\"applicationContextId\":1,\"name\":\"minimum_confidence_threshold\",\"value\":\"0.99\"/);
                    expect(result[4][1]).to.match(/MySQL test driver UPDATE query ok/);
                    expect(result[5][1]).to.match(/\"applicationContextId\":1,\"name\":\"minimum_confidence_threshold\",\"value\":\"0\"/);
                    expect(result[6][1]).to.match(/MySQL test driver INSERT query ok/);
                    expect(result[7][1]).to.match(/\"applicationContextId\":99,\"name\":\"QA_TEST1\",\"value\":\"99\"/);
                    expect(result[8][1]).to.match(/MySQL test driver DELETE query ok/);
                    expect(result[9][1]).to.not.match(/\"applicationContextId\":99,\"name\":\"QA_TEST1\",\"value\":\"99\"/);

                    //log for post test check
                    var pass_msg = '\nTest passed! ';
                    // pass_msg += '\n\nHttp server status code: ' + resReturn.statusCode + '\nHttp server body return: \n' + bodyReturn;
                    logger.info(pass_msg);

                    done();

                }catch (e) {
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
            }
        );
    });
});