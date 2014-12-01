//TC4 func_for_test1.js
var chai = require('chai')
    ,expect = chai.expect
    ,assert = chai.assert;

var testCode = require('./func_for_test1.js')

describe('TC4: verify testFunc3(a/b)', function(){
	describe('testFunc3', function(){
		it('should return result = a / b', function(){
			//assert.equal(7, testCode.testFunc3(21, 3));
            expect(testCode.testFunc3(21,3)).to.eql(7);

        })
	})


})

