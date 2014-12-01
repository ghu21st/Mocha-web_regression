//Test sinon.js for spy
var chai = require('chai');
var sinonChai = require('sinon-chai');
var sinon = require('sinon');
var expect = chai.expect;
//var should = sinonChai.should;
var assert = sinon.assert;
chai.use(sinonChai);

//require the functions/objects for testing
var testCode = require('./func_for_test1.js');

//
var spy_testFunc2;
var spy_testFunc3;

describe("TC7: Smoke test sinon, spy", function () {

    describe("test spy 2", function () {

        beforeEach(function(done){
            //setup spy on object.method
            spy_testFunc2 = sinon.spy(testCode, "testFunc2");
            spy_testFunc3 = sinon.spy(testCode, "testFunc3");
            done();
        });

        afterEach(function(done){
            //restore object.method, no more spy
            testCode.testFunc2.restore();
            testCode.testFunc3.restore();
            done();
        });

        it("calls the exist function", function (done) {
            //run the object.method normally first time
            testCode.testFunc2(10,6);
            testCode.testFunc3(21,3);

            //assert return
            assert.called(spy_testFunc2);
            assert.callOrder(spy_testFunc2, spy_testFunc3);
            //assert.callOrder(spy_testFunc3, spy_testFunc2);
            assert.calledWith(spy_testFunc2, 10, 6);
            assert.calledWithExactly(spy_testFunc3, 21, 3);
            done();
        });

    })

 });


