//Test AngularJS
//QA test setup ----------------------------------------------
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var expect = chai.expect;

var async = require('async');

//test case ID

//-------------------------------------------------------
describe("AngularJS test sample 1", function () {
        it('should still do normal tests', function() {
            expect(true).to.equal(true);
        });
 });

 describe('protractor library', function() {

        it('should expose the correct global variables', function() {
            expect(protractor).to.exist;
            expect(browser).to.exist;
            expect(by).to.exist;
            expect(element).to.exist;
            expect($).to.exist;
        });

        it('should wrap webdriver', function() {
            browser.get('http://localhost:8000/app/index.html');
            expect(browser.getTitle()).to.eventually.equal('Google Phone Gallery:');
        });
 });