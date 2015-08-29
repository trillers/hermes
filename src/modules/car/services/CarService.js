var serviceItem = require('hermes-settings').serviceItem.car;
var url = serviceItem.url;
var cskv = require('../kvs/Car');
var Nightmare = require('nightmare');
var createProxy = require('../proxys/NightmareProxy');
var Promise = require('bluebird')
Nightmare = createProxy(Nightmare);

var Service = {}
var locator = {
    username:'#phone',
    password:'#password',
    submitInput: 'input[type="submit"]',
    checkLogin: 'a.user-name'
};

var callFastCarNightMare = new Nightmare().goto('http://es.xiaojukeji.com/InsteadCar/fastCar')
Service.signIn = function* (){
    try {
        var username, password;
        var info = yield cskv.getAuthInfoAsync();
        username = info.username;
        password = info.password;
        var nightmare = new Nightmare()
            .goto(url + '/Auth/login')
            .type(locator.username, username)
            .type(locator.password, password)
            .click(locator.submitInput)
            .wait('a.user-name')
        var result = yield nightmare.run();
    }catch(err){
        console.log(err)
    }
};
Service.callFastCar = function(json){
    if(json.startTime !== '0'){
        callFastCarNightMare.userdaytime
    }
        callFastCarNightMare
        .type('input[title="Search"]', 'github nightmare')
        .click('.searchsubmit')
        .run(function (err, nightmare) {
            if (err) return console.log(err);
            console.log('Done!');
        });
};


module.exports = Service;
