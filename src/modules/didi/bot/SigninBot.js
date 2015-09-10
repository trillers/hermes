var serviceItem = require('hermes-settings').serviceItem.car;
var url = serviceItem.url;
var cskv = require('../kvs/Car');
var waitFor = require('./helper').phantom.waitFor;
var cookieLocator = '../../../../../tmp/phantom_cookies';
var Promise = require('bluebird');
var phantom = require('phantom');
function signIn(callback){
    var username, password;
    cskv.getAuthInfoAsync()
    .then(function(info){
        username = info.username;
        password = info.password;
        phantom.create({parameters:{'cookies-file': cookieLocator}}, function (ph) {
            ph.createPage(function (page) {
                var pageProxy = createProxy(page);
                pageProxy = Promise.promisifyAll(pageProxy);
                pageProxy.openAsync('http://es.xiaojukeji.com/Auth/login?__utm_source=nosource')
                    .then(function(){
                        return waitFor(2000);
                    })
                    .then(function(){
                        return pageProxy.evaluateAsync(function(){
                            document.querySelector('#phone').focus();
                        })
                    })
                    .then(function(){
                        page.sendEvent('keypress', username, null, null, 0);
                        return pageProxy.evaluateAsync(function(){
                            document.querySelector('#password').focus();
                        })
                    })
                    .then(function(){
                        page.sendEvent('keypress', password, null, null, 0)
                        return;
                    })
                    .then(function(){
                        return pageProxy.evaluateAsync(function(){
                            document.querySelector('input[type="submit"]').click()
                        })
                    })
                    .then(function(){
                        return pageProxy.evaluateAsync(function(){
                            return document.title;
                        })
                    })
                    .then(function(title){
                        console.log("login succeed----------------");
                        return waitFor(3000)
                    })
                    .then(function(){
                        ph.exit();
                        callback(null, null)
                    })
                    .catch(function(e){
                        ph.exit();
                        callback(e, null)
                    })
            })
        })
    });
}
function createProxy(page){
    var pageProxy = {};
    pageProxy.open=function(url, callback){
        page.open(url, function(status){
            callback(null, status)
        });
    };
    pageProxy.evaluate=function(fn, callback){
        page.evaluate(fn, function(result){
            callback(null, result)
        });
    };
    return pageProxy;
}
module.exports = Promise.promisify(signIn);
