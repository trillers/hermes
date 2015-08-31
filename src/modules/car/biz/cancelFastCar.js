var createDispatcher = require('../framework/MyDispatcher');
var createQueue = require('../framework/MyQueue');
var sp = require('hermes-settings').serviceItem.car;
var Nightmare = require('nightmare');
var thunkify = require('thunkify');
var carService = require('../services/CarService');
var co = require('co');

function createWorker(app){
    var worker = {};
    worker.dispatcher = createDispatcher();
    for(var i=0; i<3; i++){
        worker.dispatcher.registry(createQueue(1));
    }
    worker.handle = composeHandler(worker);
    startUp(worker, app);
    return worker;
}
function startUp(worker, application){
    worker.phantom = new Nightmare({cookiesFile: __dirname + 'nightmarecookie'});
    co(function* (){
        yield carService.signIn(worker.phantom);
        process.nextTick(function(){
            application.emit('startup')
        })
    })
}
function composeHandler(worker){
    return function(cmd){
        var me = worker;
        var thunkHandler = thunkify(handle.bind(me));
        me.dispatcher.dispatch(thunkHandler(cmd), function(){})
    }
}
function handle(cmd, callback){
    var nightmare = this.phantom;
    nightmare
        .goto(sp.url + 'InsteadCar/order')
        .evaluate(function() {
            var list = document.querySelectorAll('div.orderState');
            list.forEach(function(item){
                //item
                //div.sub a.del
            })
        }, function(){
            return;
        })
        .run(function(err, nightmare){
            if(!err){
                return callback(null, null)
            }
        })
}
module.exports = function(app){
    return createWorker(app)
};