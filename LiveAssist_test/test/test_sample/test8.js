//Test sinon.js for spy call
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

describe("TC8: Smoke test sinon, spy call", function () {

    describe("test spy 2", function () {

        beforeEach(function(done){
            //setup spy on object.method
            spy_testFunc2 = sinon.spy(testCode, "testFunc2");
            spy_testFunc3 = sinon.spy(testCode, "testFunc3");
            done();
        })

        afterEach(function(done){
            //restore object.method, no more spy
            testCode.testFunc2.restore();
            testCode.testFunc3.restore();
            done();
         })

        it("calls the exist function", function (done) {

            //run the object.method normally first time
            testCode.testFunc2(10,6);
            testCode.testFunc3(21,3);

            //run the object.method normally second time
            testCode.testFunc2(11,7);
            testCode.testFunc3(24,4);

            //spy nth func call
            spyCall_testFunc2 = testCode.testFunc2.getCall(0);
            spyCall_testFunc3 = testCode.testFunc3.getCall(1);

            //assert arg from spyCall
            expect(spyCall_testFunc2.calledWith(10,6)).to.eql(true);
            expect(spyCall_testFunc3.calledWith(24,4)).to.eql(true);

            //assert return from spyCall
            expect(spyCall_testFunc2.returnValue).to.eql(16);
            expect(spyCall_testFunc3.returnValue).to.eql(6);

            done();
        })

    })

})


