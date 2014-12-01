//QA sample Mocha test
var chai = require('chai')
    ,expect = chai.expect
    ,assert = chai.assert;

var tcn = 0;
beforeEach(function(){
        tcn ++;
        console.log('Running QA Mocha sample test:' + tcn, '\n');
});

 //
assert = require ('assert');

describe('TC0 - Array ', function(){
    describe.skip('#indexOf()', function(){
    //describe('#indexOf()', function(){
        var s1 = 'a';
        var s2 = 'b';
        var v1 = 0, v2 = 0;

        it('should return -1 when the value is not present', function(){
            //assert.equal(-1, [1,2,3].indexOf(5));
            assert.equal(-1, [1,2,3].indexOf(1));
        })
    });
});


describe('TC1 - expect.js check', function(){
    describe('regular expression match', function(){
        it('should return regexp found from a string', function(){
            //assert.match('blabal...hhahhh...fo...test', /foo/, 'regexp match test');
            expect('blaba...hhhah...for...test').to.match(/foo/);

        })
    });

    describe('contain - asserts indexOf for an array', function(){
        it('should return -1 when the value is not present', function(){
            expect([1,2,3]).to.contain(2);
        })
    });

})
