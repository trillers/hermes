var Promise = require('bluebird');
var Nightmare = require('Nightmare')
var cookieLocator = '../../../../../tmp/nightmare_cookie';
function createProxy(){
    var nativeRun = Nightmare.prototype.run;
    var runAsync = Promise.promisify(nativeRun);
    Nightmare.prototype.run = function(){
        var args = [].slice.call(arguments);
        args.splice(0, args.length-1);
        return runAsync.apply(this, args)
    };
    var nightmare = new Nightmare({cookiesFile: cookieLocator});
    return nightmare;
};

module.exports = {
    createProxy:createProxy
}