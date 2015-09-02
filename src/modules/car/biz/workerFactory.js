var createDispatcher = require('../framework/MyDispatcher');
var createQueue = require('../framework/MyQueue');
var sp = require('hermes-settings').serviceItem.car;
var Nightmare = require('nightmare');
var thunkify = require('thunkify');
var carService = require('../services/CarService');
var co = require('co');
var cookieLocator = '../../../tmp/nightmare_cookie'
module.exports = function createWorker(app, handle, initFn, postFn){
    var worker = {};
    worker.dispatcher = createDispatcher();
    for(var i=0; i<3; i++){
        worker.dispatcher.registry(createQueue(1));
    }
    worker.handle = composeHandler(worker, handle);
    if(postFn){
        worker.postFn = postFn.bind(app);
    }
    startUp(worker, app, initFn);
    return worker;
}
function startUp(worker, application, initFn){
    if(initFn){
        return initFn.call(worker, application, function(err, data){
            _init();
        })
    }
    _init();

    function _init(){
        worker.phantom = new Nightmare({cookiesFile: cookieLocator});
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