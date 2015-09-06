var request = require('request');
var phantom=require('phantom');
var cookie = '../src/modules/didi/biznightmarecookie';
var PromiseB = require('bluebird');
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
function waitFor(checkFn, gap, timeout){
    var args = [].slice.call(arguments);
    if(args.length === 1){
        return new Promise(function(resolve, reject){
            setTimeout(function(){
                resolve()
            }, args[0])
        })
    }
    var startTime = (new Date()).getTime();
    return new Promise(function(resolve, reject){
        var count = setInterval(function(){
            if(((new Date()).getTime() - startTime) > timeout){
                clearInterval(count)
                reject(new Error('wait for something failed'));
            }
            var promise = checkFn.apply(null);
            promise.then(function(result){
                if(result){
                    clearInterval(count)
                    resolve(result)
                }
            })
        }, gap)
    })
}
function login(callback){
    phantom.create({parameters:{'cookies-file': './testcookie'}}, function (ph) {
        ph.createPage(function (page) {
            pageProxy = createProxy(page);
            pageProxy = PromiseB.promisifyAll(pageProxy);
            pageProxy.openAsync('http://es.xiaojukeji.com/Auth/login?__utm_source=nosource')
            .then(function(){
                return pageProxy.evaluateAsync(function(){
                    document.querySelector('#phone').focus();
                })
            })
            .then(function(){
                page.sendEvent('keypress', '15022539525', null, null, 0);
                return pageProxy.evaluateAsync(function(){
                    document.querySelector('#password').focus();
                })
            })
            .then(function(){
                page.sendEvent('keypress', '40115891r', null, null, 0)
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
            .then(function(cookie){
                console.log(cookie)
            })
        })
    })
}
getRemoteOrderInfo(function(err, data){
    console.log(data);
});
function getRemoteOrderInfo(callback) {
    phantom.create({parameters: {'cookies-file': './testcookie'}}, function (ph) {
        ph.createPage(function (page) {
            pageProxy = createProxy(page);
            pageProxy = PromiseB.promisifyAll(pageProxy);
            pageProxy.openAsync('http://es.xiaojukeji.com')
                .then(function (status) {
                    return;
                })
                .then(function () {
                    return waitFor(2000)
                })
                .then(function () {
                    return pageProxy.evaluateAsync(function () {
                        window._jsonpDate = null;
                        var oAjax = new XMLHttpRequest();
                        oAjax.open('GET', 'http://es.xiaojukeji.com/api/CallCar/getOrderList');
                        oAjax.send();
                        oAjax.onreadystatechange = function () {
                            if (oAjax.readyState == 4) {
                                if (oAjax.status == 200) {
                                    window._jsonpDate = oAjax.responseText;
                                } else {
                                    Promise.reject(new Error('ajax failed'));
                                }
                            }
                        };
                    })
                })
                .then(function (result) {
                    return waitFor(function () {
                        return pageProxy.evaluateAsync(function () {
                            return window._jsonpDate;
                        })
                    }, 100, 10000)
                })
                .then(function (result) {
                    //ph.exit();
                    callback(null, result)
                })
                .catch(function (e) {
                    console.log('Failed to get remote order list');
                    callback(e, null)
                })
        })
    })
}
//var url = 'http://es.xiaojukeji.com/api/CallCar/getOrderList'
//var j = request.jar()
//var request = request.defaults({jar:j})
//var cookie = request.cookie('auth_token=pBjaK/9PNn8H992+4iCgQvTKdNEh1+E7q/kRnJdvRNr+3+jdGvwcI4ix64iwdR+a1/81ep9Yz/WyZCd+3Q4F/t3/4TKMQ/tRQw7r+S0i6R/ynNgORUKtkh0Un7NtN8LQcu2HfCH0yeugYj8gbXFmTPIv/UsDxd+xJBlBeghi55jla4fRpPSsuKLvZhiLtawk/tt+iyoPgvOM8qj0k5ykHGOBTD+yC/UiKqMvW7VQZBmnK3lBUhKhCU8xMBatydHVh1gvqeT7RVc+6VNb7HqZd6pR+rrS5SAkqhQs0H0+ExKj2g2BGjaQl7ZnI+sopSUQoq3sUP3/vmjleiL+BviDGTHscUtSiCcrGohzj+xeqBu6OnrZgsHppUgSFDqD0s8DRQrTyzQb4a6E/w19FtjL5sqRWUtKidvuhOyV3YwkwhNGFTDgxeXzixOO38lfP1mitaTHV530IqFekdsHD9+d3g==0c0726e440122aeeb2525f3711f08aaffcc46b11');
//j.setCookie(cookie, url);
//request({url: url, jar: j}, function (err, res, body) {
//    var cookies = j.getCookies(url);
//    console.log(cookies)
//    console.log(body)
//})
