var serviceItem = require('hermes-settings').serviceItem.car;
var url = serviceItem.url;
var cskv = require('../kvs/Car');
var createProxy = require('./nightmare/NightmareProxy');
var Promise = require('bluebird')

var Service = {}
var locator = {
    username:'#phone',
    password:'#password',
    submitInput: 'input[type="submit"]',
    checkLogin: 'a.user-name'
};

function* signIn(nightmare){
    try {
        var username, password;
        var info = yield cskv.getAuthInfoAsync();
        username = info.username;
        password = info.password;
        var nightmare = nightmare || createProxy();
            nightmare.goto(url + '/Auth/login')
            .type(locator.username, username)
            .type(locator.password, password)
            .click(locator.submitInput)
            .wait('a.user-name')
            .evaluate(function(){
                return document.title
            }, function(title){
                console.log('startup document title---------')
                console.log(JSON.stringify(title));
            })
        var result = yield nightmare.run();
        return;
    }catch(err){
        console.log(err)
    }
};


module.exports = signIn;
