var sp = require('hermes-settings').serviceItem.car;
var Nightmare = require('nightmare');
var carService = require('../services/CarService');
var createWorker = require('./workerFactory')

function handle(cmd, callback){
    var startTime = cmd.startTime;
    var fromAddress = cmd.from;
    var toAddress = cmd.to;
    var userBiz = cmd.user;
    var nightmare = this;
    fillStartTime(startTime, nightmare)
    .then(function(nightmare){
        return fillFromAddress(fromAddress, nightmare);
    })
    .then(function(nightmare){
        return fillToAddress(toAddress, nightmare);
    })
    .then(function(nightmare){
        return fillPhone(userBiz.phone, nightmare);
    })
    .then(function(nightmare){
        nightmare.click('#submitcall')
            .run(function(){
                console.log("succeed to place order");
                return callback(null, null)
            })
    })
    .catch(function(err){
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
    return createWorker(app, handle)
};