var redis = require('redis');
var http = require('http')
var createDispatcher = require('./framework');
var serviceCount = 0;
var startedCount = 0;
var carService = require('./services/CarService');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var co = require('co');
var redis = require('redis');
var orderFSM = require('./framework/FSM').orderWorkflow;
var BizProcess ={
    'callFastCar': 'callFastCar',
    'cancelFastCar': 'cancelFastCar',
    'orderMonitor': 'orderMonitor'
};
function CarApplication(){
    this.pubClient = redis.createClient();
    this.subClient = redis.createClient();
    this.server = http.createServer(testServer);
}
util.inherits(CarApplication, EventEmitter);
CarApplication.prototype.handle = function(cmd, cb){
    var app = this;
    BizProcess[cmd.name].handle(cmd, app, cb);
};
function testServer(req, res){
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<html><body>');
    res.write('<h1>Hermes:</h1>');
    res.write('<h2>I ... am ... wake up</h2>');
    res.write('<h2>welcome...</h2>');
    res.end('</body></html>');
}
function init(app, callback){
    app.on('startup', startupHandler(app, callback));
    app.on('error', defaultHandler(app));
    Object.keys(orderFSM.actionsMap).forEach(function(key){
        app.on(key, defaultHandler(app));
    });
    startupService(app);
}
function startupService(app){
    for(var prop in BizProcess){
        BizProcess[prop] = require('./biz/' + prop)(app);
    }
    serviceCount = Object.keys(BizProcess).length;
}
function startupHandler(app, callback){
    return function(){
        startedCount++;
        if(startedCount === serviceCount){
            console.log('all startup');
            app.subClient.subscribe('call taxi');
            startPostProcessHandler(app, callback)
        }
    }
}
function startPostProcessHandler(app, callback){
    var postFnCount = 0,
        doneCount = 0;
    for(var serviceName in BizProcess){
        if(typeof BizProcess[serviceName].postFn === 'function'){
            postFnCount++;
            BizProcess[serviceName].postFn.call(null, function(){
                doneCount++;
                if(doneCount === postFnCount){
                    callback(null, null);
                }
            });
        }
    }
}
function defaultHandler(app){
    return function(cmd){
        app.pubClient.publish(cmd.name, cmd);
    }
}
var app = new CarApplication();
init(app, function(){
    console.log("ok");
    app.server.listen(3000, null, function(){
        console.info('Hermes has started and listening on port in 3000');
    });
    app.subClient.on('message', function(channel, message){
        console.log('receive message==============');
        console.log(message);
        if(channel === 'call taxi'){
            process.nextTick(function(){
                app.handle({
                    name: "callFastCar",
                    from: message.from,
                    to: message.to,
                    startTime: message.startTime,
                    user: message.user
                })
            })
        }
    })
});

