/**
 * Created by henryleu on 9/10/15.
 */
var emitter = require('./emitter');
var bot = {
    createFastCarOrder: function(order){} //TODO

    , cancelFastCarOrder: function(orderId){} //TODO

    //...

    /**
     * Event definition:
     *
     *
     */
    , on: function(){
        emitter.on.apply(this, Array.prototype.slice.call(arguments, 0));
    }
};


module.exports = bot;