var redis = require('redis');
var createDispatcher = require('./framework');
var workerCount = 0;
var startedCount = 0;
var carService = require('./services/CarService');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var co = require('co');
var redis = require('redis');
var orderFSM = require('./framework/FSM').orderWorkflow;
var BizProcess ={
    'callFastCar': 'callFastCar'
}
function CarApplication(){
    this.pubClient = redis.createClient();
    this.subClient = redis.createClient();
}
util.inherits(CarApplication, EventEmitter);
function init(app, callback){
    app.on('startup', startupHandler(app, callback));
    Object.keys(orderFSM.actionsMap).forEach(function(key){
        app.on(key, defaultHandler(app, callback));
    });
    startupWorker(app);
}
function startupWorker(app){
    for(var prop in BizProcess){
        BizProcess[prop] = require('./biz/' + prop)(app);
    }
    workerCount = Object.keys(BizProcess).length;
}
function startupHandler(app){
    return function(){
        startedCount++;
        if(startedCount === workerCount){
            console.log('all startup');
            app.subClient.subscribe('call taxi');
        }
    }
}
function defaultHandler(app){
    return function(cmd){
        app.pubClient.publish(cmd.name, cmd);
    }
}
CarApplication.prototype.handle = function(cmd){
    BizProcess[cmd.name].handle(cmd);
}
var app = new CarApplication()
init(app, function(){
    app.subClient.on('message', function(channel, message){
        console.log('receive message==============');
        console.log(message);
        if(channel === 'call taxi'){
            process.nextTick(function(){
                app.handle({name: "callFastCar", from: message.from, to: message.to, startTime: message.startTime, user: message.user})
            })
        }
    })
});

