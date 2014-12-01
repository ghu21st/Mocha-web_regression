//Test AngularJS
//QA test setup ----------------------------------------------
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var async = require('async');

var webdriver = require('selenium-webdriver');
var driver; //case web test driver global variable
var protractor = require('protractor');
var ptorInstance;

//test case ID

//-------------------------------------------------------

 describe('TC999: protractor library', function() {
     before(function(done1) {
         driver = new webdriver.Builder().
             usingServer('http://localhost:4444/wd/hub').
             withCapabilities(webdriver.Capabilities.firefox()).build();
         driver.manage().timeouts().setScriptTimeout(120000);
         ptorInstance = protractor.wrapDriver(driver);

         done1();
     });

      it('TC999: should wrap webdriver', function(done) {
          ptorInstance.get('http://localhost:8000/app/index.html');
          expect(ptorInstance.getTitle()).to.eventually.equal('My AngularJS App');

          done();
      });
 });