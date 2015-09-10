/**
 * Created by henryleu on 9/10/15.
 */
var emitter = require('./emitter');
var callFastCarBot = require('./callFastCar');
var cancelFastCarBot = require('./cancelFastCar');
var orderMonitorBot = require('./orderMonitor');
var bot = {
    createFastCarOrder: function* (order){
        yield callFastCarBot.handle(order);
        return;
    } //TODO

    , cancelFastCarOrder: function* (order){
        yield cancelFastCarBot.handle(order);
        return;
    } //TODO

    //...

    /**
     * Event definition:
     *
     *
     */
    , on: function(type, callback){
        emitter.on(type, callback);
    }
};
orderMonitorBot.handle();

module.exports = bot;