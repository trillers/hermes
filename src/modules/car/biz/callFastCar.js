var createDispatcher = require('../framework/MyDispatcher');
var createQueue = require('../framework/MyQueue');
var sp = require('hermes-settings').serviceItem.car;
var Nightmare = require('nightmare');
var thunkify = require('thunkify');
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
        .click("ul#headnav>li:nth-child(2)")
        .wait();
    worker.phantom.run(function(err, nightmare){
        worker.phantom = nightmare;
        process.nextTick(function(){
            application.emit('startup')
        })
    });
}
function composeHandler(worker){
    return function(cmd){
        var me = worker;
        var thunkHandler = thunkify(handle.bind(worker));
        me.dispatcher.dispatch(thunkHandler(cmd), function(){})
    }
}
function handle(cmd, callback){
    var startTime = cmd.startTime;
    var fromAddress = cmd.from;
    var toAddress = cmd.to;
    var userBiz = cmd.user;
    fillStartTime(startTime, this)
    .then(function(){
            console.log("ok")
        //return fillFromAddress(fromAddress, this);
    })
    //.then(function(){
    //    return fillToAddress(toAddress, this);
    //})
    //.then(function(){
    //    return fillPhone(userBiz.phone, this);
    //})
    //.then(function(nightmare){
    //    nightmare.click('#submitcall')
    //        .run(function(){
    //            console.log("placed");
    //            callback(null, null)
    //        })
    //})
    //.catch(function(err){
    //    console.log("err occur------------------")
    //    console.log(err)
    //})
}
function fillStartTime(daytime, worker){
    var nightmare = worker.phantom;
    return new Promise(function(resolve, reject){
        if(daytime === '0'){
            return resolve()
        }else{
            var dayTimeArr = daytime.split('-');
            var day = dayTimeArr[0];
            var hour = dayTimeArr[1];
            var min = dayTimeArr[2];
            console.log("day------" + day)
            console.log("hour------" + hour)
            console.log("min------" + min)
            console.log("nightmare-------")
            console.log(nightmare)
            nightmare
            .click('div#userdaytime')
            .wait('div.dayGroup')
            .click('div.dayGroup>a:nth-child(' + (day+1) + ')')
            .click('div.hourGroup>a[data="'+ hour +'"]')
            .click('div.minuteGroup>a[data="'+ min +'"]')
            .wait(200)
            nightmare.run(function(err, nightmare){
                if(err){
                    return reject(err);
                }else{
                    return resolve();
                }
            })

        }
    })
}
function fillFromAddress(from, worker){
    var nightmare = worker.phantom;
    return new Promise(function(resolve, reject){
        nightmare
            .click('input#start_address')
            .type('input#start_address', from)
            .wait('div._suggestbox:eq(4)>ul>li:nth-child(1)')
            .click('div._suggestbox:eq(4)>ul>li:nth-child(1)')
            .wait(200)
        nightmare.run(function(err, nightmare){
            if(err){
                return reject(err);
            }else{
                return resolve();
            }
        })
    })
}
function fillToAddress(to, worker){
    var nightmare = worker.phantom;
    return new Promise(function(resolve, reject){
        nightmare
            .click('input#end_address')
            .type('input#end_address', to)
            .wait('div._suggestbox:eq(5)>ul>li:nth-child(1)')
            .click('div._suggestbox:eq(5)>ul>li:nth-child(1)')
            .wait(200)
        nightmare.run(function(err, nightmare){
            if(err){
                return reject(err);
            }else{
                return resolve();
            }
        })
    })
}
function fillPhone(phone, worker){
    var nightmare = worker.phantom;
    return new Promise(function(resolve, reject){
        nightmare
            .click('input#phone')
            .type('input#phone', phone)
            .wait(200)
        nightmare.run(function(err, nightmare){
            if(err){
                return reject(err);
            }else{
                return resolve(nightmare);
            }
        })
    })
}
module.exports = function(app){
    return createWorker(app)
};