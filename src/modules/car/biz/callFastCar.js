var createDispatcher = require('../framework/MyDispatcher');
var createQueue = require('../framework/MyQueue');
var sp = require('hermes-settings').serviceItem.car
var Nightmare = require('nightmare')
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
    worker.phantom = new Nightmare();
    worker.phantom
        .goto(sp.url)
        .click();
    worker.phantom.run(function(){
        application.emit('startup')
    });

}
function composeHandler(worker){
    return function(cmd){
        var me = worker;
        me.dispatch(handle, function(){

        })
    }

}
function handle(){
    //place order
}
module.exports = function(app){
    return createWorker(app)
}