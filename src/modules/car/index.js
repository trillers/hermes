var redis = require('redis');
var createDispatcher = require('./framework');
var workerCount = 0;
var startedCount = 0;
var carService = require('./services/CarService');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var BizProcess ={
    'callFastCar': 'callFastCar'
}
function CarApplication(){
    this.pubClient ={};
    this.subClient ={};
    init(this);
}
function init(app){
    util.inherits(CarApplication, EventEmitter);
    app.on('startup', workStartUpHandler);
    co(function(){
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
function workStartUpHandler(){
    startedCount++;
    if(startedCount === workerCount){
        console.log('all startup')
    }
}
CarApplication.prototype.handle = function(cmd){
    this.BizProcess[cmd.name].handle(cmd);
}