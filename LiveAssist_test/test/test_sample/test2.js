//TC2 func_for_test1.js
var chai = require('chai')
    ,expect = chai.expect
    ,assert = chai.assert;

var testCode = require('./func_for_test1.js');

describe('TC2: verify testFunc1 return', function(){
	describe('testFunc1', function(){
		it('should return 1', function(){
			//assert.equal(1, testCode.testFunc1());
			//assert.equal(0, testCode.testFunc1());
            expect(testCode.testFunc1()).to.eql(1);
		})
	})
})
 
