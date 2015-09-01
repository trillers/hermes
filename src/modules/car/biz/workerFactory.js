var createDispatcher = require('../framework/MyDispatcher');
var createQueue = require('../framework/MyQueue');
var sp = require('hermes-settings').serviceItem.car;
var Nightmare = require('nightmare');
var thunkify = require('thunkify');
var carService = require('../services/CarService');
var co = require('co');
module.exports = function createWorker(app, handle, initFn){
    var worker = {};
    worker.dispatcher = createDispatcher();
    for(var i=0; i<3; i++){
        worker.dispatcher.registry(createQueue(1));
    }
    worker.handle = composeHandler(worker, handle);
    startUp(worker, app, initFn);
    return worker;
}
function startUp(worker, application, initFn){
    if(initFn){
        return initFn.call(null, app, function(err, data){
            _init();
        })
    }
    _init();
    function _init(){
        worker.phantom = new Nightmare({cookiesFile: __dirname + 'nightmarecookie'});
        co(function* (){
            yield carService.signIn(worker.phantom);
            process.nextTick(function(){
                application.emit('startup')
            })
        })
    }
}
function composeHandler(worker, handle){
    return function(cmd){
        var me = worker;
        var thunkHandler = thunkify(handle.bind(me));
        me.dispatcher.dispatch(thunkHandler(cmd), function(){})
    }
}