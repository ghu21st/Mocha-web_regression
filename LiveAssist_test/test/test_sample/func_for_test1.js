function testFunc1(){
	return 1;
}

function testFunc2(a, b){
	return a+b;
}

function testFunc3(a, b){
	return a/b;
}

if(typeof exports === 'undefined'){
    var exports = {};
}
exports.testFunc1 = testFunc1;
exports.testFunc2 = testFunc2;
exports.testFunc3 = testFunc3;

