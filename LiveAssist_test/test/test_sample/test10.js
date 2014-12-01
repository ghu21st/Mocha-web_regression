//Test event case
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
//
var events = require('events');
var eventsEmitter = new events.EventEmitter();

var doorOpenFunc;  //global func
var doorCloseFunc; //global func
var output_Log = ''; //global variable

//
describe('TC10: basic event emitter usage', function(){
    beforeEach(function (done) {
        doorOpenFunc = function () {
            output_Log = output_Log + 'Event: door_open triggered';
//            console.log(output_Log);
        };

        doorCloseFunc = function () {
            output_Log = output_Log + 'Event: door_close triggered';
 //           console.log(output_Log);
        };

        //listener
        eventsEmitter.on('door_open', doorOpenFunc);
        eventsEmitter.on('door_close', doorCloseFunc);
        //
        done();

    });

    afterEach(function (done) {
        output_Log = ''; //reset output log for each sub-case here, IMPORTANT for this case
        //
        done();
    });


    it('check output log, event door_open should be triggered', function(done){
        eventsEmitter.emit('door_open'); //only one event

        expect(output_Log).to.match(/.door_open trigger./)
            .and.not.match(/.door_close trigger./);
        //
        done();
    });

    it('check output log, event door_close should be triggered', function(done){
        eventsEmitter.emit('door_close'); //only one event

        expect(output_Log).to.match(/.door_close trigger./)
            .and.not.match(/.door_open trigger./);
        //
        done();
    });

    it('check output log, event door_open and door_close both should be triggered', function(done){
        eventsEmitter.emit('door_open');
        eventsEmitter.emit('door_close');

        expect(output_Log).to.match(/.door_open trigger./)
            .and.match(/.door_close trigger./);
        //
        done();
    });

})