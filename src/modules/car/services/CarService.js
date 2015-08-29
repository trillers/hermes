var serviceItem = require('hermes-settings').serviceItem;
var url = serviceItem.url;
var cskv = require('../kvs/Car');
var Nightmare = require('nightmare');
var createProxy = require('../models/NightmareProxy');
Nightmare = createProxy(Nightmare);

var Service = {}
var locator = {
    username:'#iphone',
    password:'#password',
    submitInput: 'input[type="submit"]'
};

Service.signIn = function* (){
    var username, password;
    var info = yield cskv.getAuthInfoAsync();
    username = info.username;
    password = info.password;
    var nightmare = new Nightmare()
        .goto(url)
        .type(locator.username, username)
        .type(locator.password, password)
        .click(locator.submitInput)
        .wait('#headmenu');
    yield nightmare.run();
    
};
Service.placeOrder = function(json){
    new Nightmare()
        .goto(url)
        .type('input[title="Search"]', 'github nightmare')
        .click('.searchsubmit')
        .run(function (err, nightmare) {
            if (err) return console.log(err);
            console.log('Done!');
        });
};


module.exports = Promise.promisifyAll(Service);
