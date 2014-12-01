//Test classes inherit from eventEmitter
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
//
var util = require('util');
var events = require('events');

//global setup
var output_Log = '';
var Door;
var frontDoor;

//Test start
describe('TC11: verify event emitter user custom new class', function(){
    beforeEach(function(done){
        // create class
        Door = function (color) {
            this.color = color;
            events.EventEmitter.call(this);

            this.open = function(){
                this.emit('open');
            }

            this.close = function(){
                this.emit('close');
            }
        };
        //Door.prototype._proto_ = events.EventEmitter.prototype; //copy all the events.EventEmitter properties to Door object
        util.inherits(Door, events.EventEmitter);

//create object & app
        frontDoor = new Door('white');

        var openFunc = function () {
            output_Log = output_Log + frontDoor.color + ' door_open triggered';
            console.log(output_Log);

        };

        var closeFunc = function () {
            output_Log = output_Log + frontDoor.color + ' door_close triggered';
            console.log(output_Log);
        };

        frontDoor.on('open', openFunc);
        frontDoor.on('close', closeFunc);

        //
        done();
    });

    afterEach(function(done){
        output_Log = '';
        //
        done();
    });

    it('expect open event triggered', function(done){
        frontDoor.open();
        expect(output_Log).to.match(/.door_open triggered/)
            .and.not.match(/.door_close triggered./);
        //
        done();
    });

    it('expect close event triggered', function(done){
        frontDoor.close();
        expect(output_Log).to.match(/.door_close triggered/)
            .and.not.match(/.door_open triggered./);
        //
        done();
    });

    it('expect both open and close event triggered', function(done){
        frontDoor.open();
        frontDoor.close();
        expect(output_Log).to.match(/.door_open triggered/)
            .and.match(/.door_close triggered/);
        //
        done();
    });
})

