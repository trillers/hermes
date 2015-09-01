var sp = require('hermes-settings').serviceItem.car;
var Nightmare = require('nightmare');
var carService = require('../services/CarService');
var createWorker = require('./workerFactory')
var nameLocator = '.orderState>.sub>.section>.onCar>.name';
var cancelSubmitBtnLocator = 'button.aui_state_highlight';

function handle(cmd, callback){
    var nightmare = this.phantom;
    var phone = cmd.user.phone;
    nightmare
        .goto(sp.url + 'InsteadCar/order')
        .evaluate(function() {
            var phoneList = document.querySelectorAll(nameLocator);
            var phoneNode = _findPhoneDom(phoneList, phone);
            _findCancelBtn(phoneNode).click();
        }, function(){
            return;
        })
        .wait()
        .click(cancelSubmitBtnLocator)
        .run(function(err, nightmare){
            if(!err){
                return callback(null, null)
            }
        })
}
function _findCancelBtn(node){
    return node.parentNode.parentNode.nextSibling.firstChild.firstChild;
}
function _findPhoneDom(phoneList, phone){
    for(var i=0, len= phoneList.length; i<len; i++){
        if(_getPhoneNumber(phoneList[i].innerText) == phone){
            return phoneList[i]
        }
    }
}
function _getPhoneNumber(str){
    return str.split(' ')[1];
}
module.exports = function(app){
    return createWorker(app, handle)
};