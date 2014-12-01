//TC3 func_for_test1.js
var chai = require('chai')
    ,expect = chai.expect
    ,assert = chai.assert;

var testCode = require('./func_for_test1.js');

describe('TC3: verify testFunc2 (a + b)', function(){
	describe('testFunc2', function(){
		it('should return result a + b', function(){
			//assert.equal(15, testCode.testFunc2(10, 6));
            expect(testCode.testFunc2(10,6)).to.eql(15);
		})
	})
})

