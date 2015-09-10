var phantom = require('phantom');
var cookieLocator = '../../../../../../tmp/phantom_cookies';
var thunkify = require('thunkify');
var PromiseB = require('bluebird');
var co = require('co');
function waitFor(checkFn, gap, timeout){
    var page = this;
    var args = [].slice.call(arguments);
    if(args.length === 1){
        if(typeof args[0] === 'number'){
            return new Promise(function(resolve, reject){
                setTimeout(function(){
                    resolve()
                }, args[0])
            })
        }
        if(typeof args[0] === 'string'){
            return _waitForHelper(function* checkFn(){
                var isExist = yield page.evaluateAsync(function(){
                    if(document.querySelector(args[0])){
                        return true;
                    };
                    return false;
                });
                return isExist;
            }, gap, timeout);
        }
    }
    return _waitFullCheck(checkFn, gap, timeout);
}
function _waitFullCheck(checkFn, gap, timeout){
    return new Promise(function(resolve, reject){
        var startTime = (new Date()).getTime();
        var count = setInterval(function(){
            if(((new Date()).getTime() - startTime) > timeout){
                clearInterval(count)
                return reject(new Error('wait for something failed'));
            }
            co(function* (){
                var result = yield checkFn.apply(null);
                if(result){
                    clearInterval(count)
                    resolve(result)
                }
            })
        }, gap)
    })
}
//function* test(){
//    return 1;
//}
//co(function* (){
//    yield waitFor(function* (){
//        var test1 = yield test();
//        console.log(test1);
//        return test1;
//    }, 100, 100000);
//})
function singleValueNodeStylify(obj, method){
    return function(){
        var args = [].slice.apply(arguments);
        var callback = args.slice(args.length-1, args.length)[0];
        args.splice(args.length-1, args.length);
        obj[method].apply(phantom, args.concat([function(data){
            callback(null, data);
        }]))
    }
}
var phantomCreateThunk = thunkify(singleValueNodeStylify(phantom, 'create'));
function* createPage(){
    var ph = yield phantomCreateThunk({parameters:{'cookies-file': cookieLocator}});
    var phCreatePageThunk = thunkify(singleValueNodeStylify(ph, 'createPage'));
    var page = yield phCreatePageThunk();
    var pageProxy = {};
    pageProxy.openAsync = thunkify(function(url, callback){
        var me = this;
        page.open.call(me, url, function(status){
            callback(null, status)
        });
    });
    pageProxy.evaluateAsync = thunkify(function(fn, options, callback){
        var me = this;
        if(!callback){
            callback = options;
        }
        page.evaluate.call(me, fn, function(result){
            callback(null, result)
        }, options);
    });
    _mixin(pageProxy, page);
    pageProxy.myPh = ph;
    return pageProxy;
}
function _mixin(target, source){
    for(var prop in source){
        target[prop] = source[prop];
    }
    return;
}
module.exports = {
    waitFor: waitFor,
    createPage: createPage
};