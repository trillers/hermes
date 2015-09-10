var sp = require('hermes-settings').serviceItem.car;
var phantom = require('../bot/helper').phantom;
var createPage = phantom.createPage;
var waitFor = phantom.waitFor;
var signinBot = require('./SigninBot');
var cancelSubmitBtnLocator = 'button.aui_state_highlight';
var PromiseB = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var Bot = {};
_mixin(Bot, new EventEmitter());
function* cancelFastCar(order){
    var me = Bot;
    var page = yield createPage();
    page.set('onConsoleMessage', function (msg) {
        console.log(msg)
    });
    var phone = order.commissionerId.phone;
    try{
        yield page.openAsync(sp.url + 'InsteadCar/order');
        yield waitFor(function* checkFn(){
            var isExist = yield page.evaluateAsync(function(){
                if(document.querySelector('.orderStateBox')){
                    return true;
                }
                return false;
            });
            return isExist;
        }, 100, 100000);
        yield waitFor(4000);
        var title = yield page.evaluateAsync(function(){
            return document.title;
        });
        if(title !== '滴滴打车企业平台'){
            throw new Error('no_login');
        }
        var phoneList = yield page.evaluateAsync(function(phone){
            var phoneList = document.querySelectorAll('.orderState>.sub>.section>.onCar>.name');
            var phoneNode = _findPhoneDom(phoneList, phone);
            var aTag = phoneNode.parentNode.parentNode.nextElementSibling.children[0].nextElementSibling.children[0];
            aTag.click();
            function _findPhoneDom(phoneList, phone){
                for(var i=0, len= phoneList.length; i<len; i++){
                    if(_getPhoneNumber(phoneList[i].innerText) == phone.toString()){
                        return phoneList[i]
                    }
                }
            }
            function _getPhoneNumber(str){
                return str.split(' ')[1].toString();
            }
        }, phone);
        yield waitFor(1000);
        yield page.evaluateAsync(function(selector){
            document.querySelector(selector).click();
            return;
        }, cancelSubmitBtnLocator);
        page.myPh.exit();
        me.emit('OrderCancelled', order);
        return;
    }catch(e){
        console.log('error=================');
        console.log(e);
        page.myPh.exit();
        if(e.message === 'no_login'){
            yield signinBot();
            yield cancelFastCar(order, callback);
        }
        console.log("Failed to cancel fast car.");
        throw e;
    }
}
function _mixin(target, source){
    for(var prop in source){
        target[prop] = source[prop];
    }
}
Bot.handle = cancelFastCar;
module.exports = Bot;


//<div class="aside">
//    <div class="setTime">创建时间 2015-09-09 21:30</div>
//    <div class="bntBox">
//        <a title="" href="javascript:;" class="del" activeevent="cancelCall">取消叫车</a>
//    </div>
//</div>