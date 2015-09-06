var createDispatcher = require('../framework/MyDispatcher');
var createQueue = require('../framework/MyQueue');
var sp = require('hermes-settings').serviceItem.car;
var Nightmare = require('nightmare');
var thunkify = require('thunkify');
var carService = require('./CarService');
var co = require('co');
var cookieLocator = '../../../tmp/nightmare_cookie'
module.exports = function createService(app, handle, initFn, postFn){
    var service = {};
    service.dispatcher = createDispatcher();
    //for(var i=0; i<3; i++){
    service.dispatcher.registry(createQueue(1));
    //}
    service.handle = composeHandler(service, handle);
    if(postFn){
        service.postFn = postFn.bind(app);
    }
    startUp(service, app, initFn);
    return service;
}
function startUp(service, application, initFn){
    if(initFn){
        return initFn.call(service, application, function(err, data){
            _init();
        })
    }
    _init();

    function _init(){
        service.phantom = new Nightmare({cookiesFile: cookieLocator});
        co(function* (){
            yield carService.signIn(service.phantom);
            process.nextTick(function(){
                application.emit('startup')
            })
        })
    }
}
function composeHandler(service, handle){
    return function(cmd){
        var me = service;
        var thunkHandler = thunkify(handle.bind(me));
        me.dispatcher.dispatch(thunkHandler(cmd), function(){})
    }
}