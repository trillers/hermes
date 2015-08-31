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
    var startTime = cmd.startTime;
    var fromAddress = cmd.from;
    var toAddress = cmd.to;
    var userBiz = cmd.user;
    var nightmare = this;
    fillStartTime(startTime, nightmare)
    .then(function(nightmare){
            console.log("ok1")
        return fillFromAddress(fromAddress, nightmare);
    })
    .then(function(nightmare){
            console.log('ok2')
        return fillToAddress(toAddress, nightmare);
    })
    .then(function(nightmare){
            console.log('ok3')
        return fillPhone(userBiz.phone, nightmare);
    })
    .then(function(nightmare){
        nightmare.click('#submitcall')
            .run(function(){
                console.log("placed");
                return callback(null, null)
            })
    })
    .catch(function(err){
        console.log("err occur------------------")
        console.log(err)
    })
}
function fillStartTime(daytime, worker){
    return new Promise(function(resolve, reject){
        if(daytime === '0'){
            return resolve()
        }else{
            var nightmare = worker.phantom;
            var dayTimeArr = daytime.split('-');
            var day = dayTimeArr[0];
            var hour = dayTimeArr[1];
            var min = dayTimeArr[2];
            nightmare.goto(sp.url + 'InsteadCar/fastCar')
            .wait('div#userdaytime')
            .click('div#userdaytime')
            .wait()
            .click('div.dayGroup>a:nth-child(' + (parseInt(day, 10)+1) + ')')
            .click('div.hourGroup>a[data="'+ hour +'"]')
            .click('div.minuteGroup>a[data="'+ min +'"]')
            .wait(200)
            resolve(nightmare);
        }
    })
}
function fillFromAddress(from, nightmare){
    return new Promise(function(resolve, reject){
        nightmare
            .type('input#start_address', from)
            .wait()
            .evaluate(function(){
                var list = document.querySelectorAll('div._suggestbox');
                var item = list[4];
                item.childNodes[0].childNodes[0].click()
                return
                //var e = document.createEvent('MouseEvents');
                //e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                //item.dispatchEvent(e);
            }, function(item){
                return;
            })
            .wait(200)
        resolve(nightmare);
    })
}
function fillToAddress(to, nightmare){
    return new Promise(function(resolve, reject) {
        nightmare
            .type('input#end_address', to)
            .wait()
            .evaluate(function () {
                var list = document.querySelectorAll('div._suggestbox');
                var item = list[5];
                item.childNodes[0].childNodes[0].click();
                return;
            }, function(){
                return;
            })
            .wait(200)
        resolve(nightmare);
    })
}
function fillPhone(phone, nightmare){
    return new Promise(function(resolve, reject){
        nightmare
            .click('input#phone')
            .type('input#phone', phone)
            .wait(200)
        resolve(nightmare);
    })
}
module.exports = function(app){
    return createWorker(app)
};