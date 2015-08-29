var redis = require('../../../app/redis');
var logger = require('../../../app/logging').logger;
var Promise = require('bluebird');
var cbUtil = require('../../../framework/callback');

var serviceProviderKey = function(){
    return 'sp:xj';
}
var kv = {}
kv.getAuthInfo = function(callback){
    redis.hgetall(serviceProviderKey, function(err, result){
        cbUtil.logCallback(
            err,
            'Fail to load service provider info: ' + err,
            'Succeed to load service provider info');
        cbUtil.handleSingleValue(callback, err, result);
    });
}
kv.setAuthInfo = function(json, callback){
    redis.hmset(serviceProviderKey, json, function(err, result){
        cbUtil.logCallback(
            err,
            'Fail to save service provider info: ' + err,
            'Succeed to save service provider info');
        cbUtil.handleOk(callback, err, result);
    })
}
module.exports = kv;