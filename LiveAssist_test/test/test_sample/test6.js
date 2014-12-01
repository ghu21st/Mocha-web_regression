//Test sinon.js for spy, stub, event listener
var chai = require('chai');
var sinonChai = require('sinon-chai');
var sinon = require('sinon');
var expect = sinonChai.expect;
var should = sinonChai.should;
var assert = sinon.assert;
chai.use(sinonChai);
//
var testCode = require('./func_for_test1.js');

//
function once(fn){
    var ret=false;
    var called=false;
    return function(){
        if(!called){
            called=true;
            ret=fn.apply(this,arguments);
        }
        return ret;
    };
}

describe("TC6: Smoke test chai-sinon", function () {
    describe("test spy 1", function () {
        it("calls the original function", function () {
            var callback = sinon.spy();
            var proxy = once(callback);
            proxy();
            //expect(callback).have.been.calledOnce;
            //callback.should.have.been.calledOnce;
            assert.called(callback);
        })
    })
 })



