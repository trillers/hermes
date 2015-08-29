var redis = require('redis');
var createDispatcher = require('./framework');
var workerCount = 0;
var startedCount = 0;
var carService = require('./services/CarService');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var co = require('co')
var BizProcess ={
    'callFastCar': 'callFastCar'
}
function CarApplication(){
    this.pubClient ={};
    this.subClient ={};
}
util.inherits(CarApplication, EventEmitter);
function init(app, callback){
    app.on('startup', workStartUpHandler(callback));
    co(function* (){
        yield carService.signIn();
        startupWorker(app)
    })
}
function startupWorker(app){
    for(var prop in BizProcess){
        BizProcess[prop] = require('./biz/' + prop)(app);
    }
    workerCount = Object.keys(BizProcess).length;
}
function workStartUpHandler(callback){
    return function(){
        startedCount++;
        if(startedCount === workerCount){
            console.log('all startup')
            callback(null, null)
        }
    }
}
CarApplication.prototype.handle = function(cmd){
    BizProcess[cmd.name].handle(cmd);
}
var app = new CarApplication()
init(app, function(){
    process.nextTick(function(){
        app.handle({name: "callFastCar"})
    })
});

