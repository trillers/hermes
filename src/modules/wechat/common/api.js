var settings = require('hermes-settings');
var Wechat = require('../../wechat/services/Wechat');
var wechat = new Wechat(settings.wechat.appKey, settings.wechat.appSecret);

module.exports = wechat;