//Test sinon.js for sandbox, spy and stub
var chai = require('chai');
var sinonChai = require('sinon-chai');
var sinon = require('sinon');
var expect = chai.expect;
//var should = sinonChai.should;
var assert = sinon.assert;
chai.use(sinonChai);
var async = require('async');

//require the functions/objects for testing
//var testCode = require('./func_for_test1.js');

//sandbox setup
var sandbox_config ={
    injectInto: null,
    properties: ["spy","stub","mock","server","requests"],
    useFakeTimers: false,
    useFakeServer: false
};
var sandbox = sinon.sandbox.create();
var spy_testFunc2;
var spy_testFunc3;

var testFunc1;
var testFunc2;
var testFunc3;

var testCode={
    testFunc1: function (){
        return 1;
    },

    testFunc2: function(a, b){
        return a+b;
    },

    testFunc3: function(a, b){
        return a/b;
    }
/*    if(typeof exports !== 'undefined'){
        exports.testFunc1 = testFunc1;
        exports.testFunc2 = testFunc2;
        exports.testFunc3 = testFunc3;
    }
*/
};

//-------------------------------------------------------
describe("TC12: Smoke test sinon, spy, sandbox and assertion", function () {
    describe("test spy 2", function () {
        beforeEach(function(done){
            //setup spy on object.method
            spy_testFunc2 = sandbox.spy(testCode,"testFunc2");
            spy_testFunc3 = sandbox.spy(testCode,"testFunc3");

            done();
        });

        afterEach(function(done){
            async.series({
                sandbox_restore: function(callback){
                    //restore object.method, no more spy
                    sandbox.restore();
                    callback(null, 1);
                },

                remove_modules: function(callback){

/*                  //for version
                    for (var key in Object.keys(require.cache)){
                        console.log('\ndeleted module:' + key);
                        delete require.cache[key];
                        ++cnt;
                        if(cnt === array_keys.length){
                            callback(null, 2);
                        }
                    }
  */
/*                    //forEach version
                    var array_keys = Object.keys(require.cache);
                    var cnt=0;
                    console.log('\nmodule key #' + array_keys.length);

                    Object.keys(require.cache).forEach(function(key){
                         console.log('\ndeleted module:' + key);
                         delete require.cache[key];
                         ++cnt;
                         if(cnt===array_keys.length){
                            callback(null, 2);
                         }
                     });
  */
                     //async.js Whilst version
                    var cnt=0;
                    console.log('\nmodule key #' + Object.keys(require.cache).length);

                    async.whilst(
                      function(){ return cnt < Object.keys(require.cache).length; },
                      function(cb){
                          var key = Object.keys(require.cache).pop();
                          console.log('\ndeleted module:' + key);
                          delete require.cache[key];
                          cnt++;
                          setTimeout(cb, 10);
                      },
                      function(err){
                          if(err){ //the second #2 task/function found error
                              callback(err, 2);
                          }else{
                              callback(null, 2);
                          }
                      }
                    );
                }
            },function(err,results){
                if(err){
                    console.log('\nError happened from the case afterEach block!\n');
                }
                //
                done()
            });
        });

        it("calls the exist function", function (done) {

            //run the object.method normally first time
            testCode.testFunc2(10,6);
            testCode.testFunc3(21,3);

            testCode.testFunc2(11,7);
            testCode.testFunc3(24,4);

            //spy called
            spycall_testFunc2 = spy_testFunc2.getCall(1);
            spycall_testFunc3 = spy_testFunc3.getCall(1);

            //assertion
            assert.called(spy_testFunc2);
            assert.callOrder(spy_testFunc2, spy_testFunc3);
            //assert.callOrder(spy_testFunc3, spy_testFunc2);
            assert.calledWith(spy_testFunc2, 10, 6);
            assert.calledWithExactly(spy_testFunc3, 21, 3);

            //expect assertion for return value
            expect(spy_testFunc2.returnValues[0]).to.eql(16);
            expect(spy_testFunc3.returnValues[0]).to.eql(7);

            expect(spycall_testFunc2.returnValue).to.eql(18);
            expect(spycall_testFunc3.returnValue).to.eql(6);
            //
            done();
        });

    })

});


