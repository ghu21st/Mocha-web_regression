//Test AngularJS QA QA sample app
//TC903: Test send input model order change  with Protractor on AngularJS QA sample app
//QA test setup ----------------------------------------------
var case_ID = 903;

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
var expect = chai.expect;
//var chaiAsPromised = require('chai-as-promised');
//chai.use(chaiAsPromised);

var async = require('async');
var winston = require('winston'); //console/file logging module for testing
var os = require('os');
var nock = require('nock');   //mock library, REST API: post/put/get/delete/...
var nockOptions = {allowUnmocked: true};

var protractor = require('protractor');
//var webdriver = require('selenium-webdriver');
var ptor, driver;
/*
var selectOption = function(selector, item){
    var selectList, desiredOption;

    selectList = this.findElement(selector);
    selectList.click();

    selectList.findElements(protractor.By.tagName('option'))
        .then(function findMatchingOption(options){
            options.some(function(option){
                option.getText().then(function(text){
                    if (item === text){
                        desiredOption = option;
                        return true;
                    }
                });
            });
        })
        .then(function clickOption(){
            if (desiredOption){
                desiredOption.click();
            }
        });
};
*/
//-------------------------------------------------------
describe('TC903: Test send input model order change  with Protractor on AngularJS QA sample app', function() {

    before(function(done1){
        //record test start time
        test_startTime = new Date();

        //initialize for testing
        err_msg='';    //temp single error message
        err_array=[];  //error message array
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

        //Protractor with wrapped Selenium WebdriverJS (internal)
        driver = new protractor.Builder().          //define driver instance for Selenium server used/wrapped with protractor
            usingServer(selenium_server).
            withCapabilities(
                protractor.Capabilities.firefox()
            ).
            build();
        driver.manage().timeouts().setScriptTimeout(120000);
        //ptor = protractor.wrapDriver(driver, '', 'div#phonecatApp' );
        ptor = protractor.wrapDriver(driver);
        //ptor.sleep(200);

        done1();
    });

//-------------------------------------------------------
    after(function(done2){
        async.series({
            end_webdriver: function(callback){
                //client.end(callback(null, 0));
                driver.quit().then(function(){
                    callback(null, 0);
                });
            },
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
    it('TC903: Test send input model order change  with Protractor on AngularJS QA sample app', function(done) {
        //trace HTTP call
        nock.recorder.rec();

        //test_url = 'http://www.angularjs.org';      // if default test target url from config file need to be changed by case, change here
        var element1,element2, element3;

        async.series([
            //wait for 1 sec
            function(callback){
                setTimeout(function(){
                    output_msg = '\nwait 1 second for server\n';
                    output_string += output_msg;
                    console.log(output_msg);
                    //
                    callback(null, 0);
                }, 1000);
            },
            function(callback){
                //start web test driver based on app driver session
                ptor.driver.get(test_url).then(function(){
                    output_msg = '\nTest URL: ' + test_url;
                    output_string += output_msg;
                    console.log(output_msg);
                    //
                    var result = [test_url, 1];
                    callback(null, result);
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
            //wait for 1 sec
            function(callback){
                setTimeout(function(){
                    output_msg = '\nwait 1 second for server\n';
                    output_string += output_msg;
                    console.log(output_msg);

                    callback(null, 3);
                }, 1000);
            },
            function(callback){
               element1 = ptor.findElement(protractor.By.select('orderProp'));
                element1.click().then(function(){
                    element2 = ptor.findElement(protractor.By.css('option[value="-age"]'));
                    //element2.sendKeys('Newest').then(function(){
                    //element2.sendKeys('age').then(function(){
                    element2.click().then(function(){
                        element3 = ptor.element(protractor.By.selectedOption('orderProp'));
                        element3.getText().then(function(txt){
                            output_msg = '\nGet binding order return text:' + txt;
                            output_string += output_msg;
                            console.log(output_msg);
                            //
                            var result = [txt, 0];
                            callback(null, result);

                        });
                    });
                });
            },
            //wait for 1 sec
            function(callback){
                setTimeout(function(){
                    output_msg = '\nwait 1 second for server\n';
                    output_string += output_msg;
                    console.log(output_msg);

                    callback(null, 5);
                }, 2000);
            },
            function(callback){
                //element1 = ptor.findElement(protractor.By.model('orderProp'));
                element1 = ptor.element(protractor.By.select('orderProp')).click();
                element2 = ptor.findElement(protractor.By.css('option[value="name"]')).click();
                    //element2.sendKeys('Alphabetical').then(function(){
                    //element2.sendKeys('name').then(function(){
//                    element2.click().then(function(){
                element3 = ptor.element(protractor.By.selectedOption('orderProp'));
                element3.getText().then(function(txt){
                    output_msg = '\nGet binding order return text:' + txt;
                    output_string += output_msg;
                    console.log(output_msg);
                    //
                    var result = [txt, 0];
                    callback(null, result);
                });
            },
            //wait for 1 sec
            function(callback){
                setTimeout(function(){
                    output_msg = '\nwait 1 second for server\n';
                    output_string += output_msg;
                    console.log(output_msg);

                    callback(null, 7);
                }, 2000);
            },
            function(callback){
                //var element = ptor.element(protractor.By.model('orderProp'));
                element1 = ptor.element(protractor.By.select('orderProp')).click();
                element2 = ptor.findElement(protractor.By.css('option[value="age"]')).click();
                    //element2.sendKeys('Oldest').then(function(){
                    //element2.sendKeys('-age').then(function(){
                element3 = ptor.element(protractor.By.selectedOption('orderProp'));
                element3.getText().then(function(txt){
                    output_msg = '\nGet binding order return text:' + txt;
                    output_string += output_msg;
                    console.log(output_msg);
                    //
                    var result = [txt, 0];
                    callback(null, result);
                });
            },
            function(callback){
                setTimeout(function(){
                    output_msg = '\nwait 1 second for server\n';
                    output_string += output_msg;
                    console.log(output_msg);
                    //
                    callback(null, 9);
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
                    console.log('for testing\n');
                    expect(result[2][0]).to.match(/Google Phone Gallery:/);
                    expect(result[4][0]).to.match(/Oldest/);
                    expect(result[6][0]).to.match(/Alphabetic/);
                    expect(result[8][0]).to.match(/Newest/);

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

/*
var browser = protractor.getInstance();
browser.selectOption = selectOption.bind(browser);
browser.selectOption(protractor.By.select('orderProp'), '-age').then(function(){
    element3 = ptor.element(protractor.By.selectedOption('orderProp'));
    element3.getText().then(function(txt){
        output_msg = '\nGet binding order return text:' + txt;
        output_string += output_msg;
        console.log(output_msg);
        //
        var result = [txt, 0];
        callback(null, result);
    });
});
*/