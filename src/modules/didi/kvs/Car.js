var redis = require('../../../app/redis');
var logger = require('../../../app/logging').logger;
var Promise = require('bluebird');
var cbUtil = require('../../../framework/callback');

var serviceProviderKey = function(){
    return 'sp:xj';
}
var orderListKey = function(){
    return 'orderlist:xj';
}
var kv = {}
kv.getAuthInfo = function(callback){
    redis.hgetall(serviceProviderKey(), function(err, result){
        cbUtil.logCallback(
            err,
            'Fail to load service provider info: ' + err,
            'Succeed to load service provider info');
        cbUtil.handleSingleValue(callback, err, result);
    });
}
kv.getOrderList = function(callback){
    redis.get(orderListKey(), function(err, result){
        cbUtil.logCallback(
            err,
            'Fail to load order list info: ' + err,
            'Succeed to load order list info');
        cbUtil.handleSingleValue(callback, err, JSON.parse(result));
    })
}
kv.setAuthInfo = function(json, callback){
    redis.hmset(serviceProviderKey(), json, function(err, result){
        cbUtil.logCallback(
            err,
            'Fail to save service provider info: ' + err,
            'Succeed to save service provider info');
        cbUtil.handleOk(callback, err, result, json);
    })
}
kv.saveOrderList = function(json, callback){
    redis.set(orderListKey(), JSON.stringify(json), function(err, result){
        cbUtil.logCallback(
            err,
            'Fail to save order list: ' + err,
            'Succeed to save order list');
        cbUtil.handleOk(callback, err, result, json);
    })
}
module.exports = Promise.promisifyAll(kv);