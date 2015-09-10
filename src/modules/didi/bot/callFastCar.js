var sp = require('hermes-settings').serviceItem.car;
var phantom = require('../bot/helper').phantom;
var createPage = phantom.createPage;
var waitFor = phantom.waitFor;
var signinBot = require('./SigninBot');
var PromiseB = require('bluebird');
var co = require('co');
var EventEmitter = require('events').EventEmitter;
var Bot = {};
_mixin(Bot, new EventEmitter());
Bot.handle = function* callFastCar(order){
    try{
        var me = Bot;
        var startTime = order.useTime;
        var fromAddress = order.subcase.origin;
        var toAddress = order.subcase.destination;
        var phone = order.commissionerId.phone;
        var page = yield createPage();
        yield fillStartTime(startTime, page);
        yield fillFromAddress(fromAddress, page);
        yield fillToAddress(toAddress, page);
        yield fillPhone(phone, page);
        yield getSomeInfo(page);
        yield submitForm(page);
        console.log("succeed to place order");
        me.emit('OrderSubmit', order);
        page.myPh.exit();
        return;
    }catch(err){
        console.log('???????????????????????????????');
        console.log(err);
        if(err.message === 'no_login'){
            yield signinBot();
            yield callFastCar(order);
            return;
        }
        me.emit('OrderRejected', order);
        page.myPh.exit();
        throw new Error('下单失败');
    }
}
function* fillStartTime(daytime, page){
    if(daytime === '0'){
        return page;
    }else{
        yield page.openAsync(sp.url + 'InsteadCar/fastCar');
        var dayTimeArr = daytime.split('-');
        var day = dayTimeArr[0];
        var hour = dayTimeArr[1];
        var min = dayTimeArr[2];
        var title = yield page.evaluateAsync(function(){
            return document.title;
        });
        console.log('-----------'+title);
        if(title !== '滴滴打车企业平台'){
            console.log('**************************');
            throw new Error('no_login');
            return;
        }
        yield waitFor(function* checkFn(){
            var isExist = yield page.evaluateAsync(function(){
                if(document.querySelector('div#userdaytime')){
                    return true;
                };
            });
            return isExist;
        }, 100, 1000000);
        console.log('wait over');
        yield page.evaluateAsync(function(){
            return document.querySelector('div#userdaytime').click();
        });
        yield waitFor(function* (){
            var isExist = yield page.evaluateAsync(function(){
                if(document.querySelector('div.dayGroup>a')){
                    return true;
                };
            });
            return isExist;
        }, 100, 10000);
        yield page.evaluateAsync(function(day){
            return document.querySelector('div.dayGroup>a:nth-child(' + (parseInt(day, 10)+1) + ')').click();
        }, day);
        yield page.evaluateAsync(function(hour){
            return document.querySelector('div.hourGroup>a[data="'+ hour +'"]').click();
        }, hour);
        yield page.evaluateAsync(function(min){
            return document.querySelector('div.minuteGroup>a[data="'+ min +'"]').click();
        }, min);
        yield waitFor(200);
        return page;
    }
}
function* fillFromAddress(from, page){
    yield page.evaluateAsync(function(){
       document.querySelector('input#start_address').focus();
    });
    page.sendEvent('keypress', from, null, null, 0);
    yield waitFor(4000);
    yield page.evaluateAsync(function(){
        var list = document.querySelectorAll('div._suggestbox');
        var item = list[4];
        item.childNodes[0].childNodes[0].click();
        return
    });
    yield waitFor(200);
    return page;
}
function* fillToAddress(to, page){
    yield page.evaluateAsync(function(){
        document.querySelector('input#end_address').focus();
    });
    page.sendEvent('keypress', to, null, null, 0);
    yield waitFor(4000);
    yield page.evaluateAsync(function(){
        var list = document.querySelectorAll('div._suggestbox');
        var item = list[5];
        item.childNodes[0].childNodes[0].click();
        return;
    });
    yield waitFor(200);
    return page;
}
function* fillPhone(phone, page){
    yield page.evaluateAsync(function(){
        document.querySelector('input#phone').focus();
    });
    page.sendEvent('keypress', phone, null, null, 0);
    yield waitFor(200);
    return page;
}
function* getSomeInfo(page){
    var price = yield page.evaluateAsync(function(){
        return document.querySelector('div.priceBox>em').innerText;
    });
    return price;
}
function* submitForm(page){
    yield page.evaluateAsync(function(){
        return document.querySelector('input#submitcall').click();
    });
}
function _mixin(target, source){
    for(var prop in source){
        target[prop] = source[prop];
    }
}
module.exports = Bot;