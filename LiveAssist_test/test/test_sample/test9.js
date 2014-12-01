//Test sinon.js for stub
var chai = require('chai');
var sinonChai = require('sinon-chai');
var sinon = require('sinon');
var expect = chai.expect;
//var should = sinonChai.should;
var assert = sinon.assert;
chai.use(sinonChai);

//require the functions/objects for testing
var testCode = require('./func_for_test1.js');

//stub functions
function stubFunc1(arg1, arg2){
    return -1;
}
function stubFunc2(arg1, arg2){
    return -2;
}

//
var stub_testFunc2;
var stub_testFunc3;

describe("TC9: Smoke test sinon, stub", function () {

    describe("test stub 1", function () {
        beforeEach(function(done){
            //setup stub on object.method
            stub_testFunc2 = sinon.stub(testCode, "testFunc2", stubFunc1);
            stub_testFunc3 = sinon.stub(testCode, "testFunc3", stubFunc2);

            //var stub_testFunc1 = sinon.stub(testCode, "testFunc1");
            //stub_testFunc1.throws("TypeError");
            done();
        })

        afterEach(function(done){
            //restore stub
            stub_testFunc2.restore();
            stub_testFunc3.restore();
            done();
        })

        it("calls the exist function", function (done) {

            //assert stub
            expect(testCode.testFunc2(10,6)).to.eql(-1);
            expect(testCode.testFunc3(21,3)).to.eql(-2);

            expect(stub_testFunc2(11,7)).to.eql(-1);
            expect(stub_testFunc3(24,4)).to.eql(-2);
            //expect(testCode.testFunc1()).to.throwError();

            done();
        })

    })

})


