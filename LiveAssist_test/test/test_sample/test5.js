//TC5 async function
var chai = require('chai')
    ,expect = chai.expect
    ,assert = chai.assert;


describe('TC5 - verify async function', function(){
	var foo = false;
	beforeEach(function(done){
		setTimeout(function(){
            foo = true;

            //complete the async beforeEach
            done();
        }, 50);
	});

	it('should return true from async function and complete the test less than 300ms',function(done2){
		//assert.equal(false, foo);
        expect(foo).to.eql(true);
        setTimeout(done2, 300);
	});
});
 
