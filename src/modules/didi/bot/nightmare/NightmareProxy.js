var Promise = require('bluebird');

module.exports = function createProxy(Nightmare){
    var nativeRun = Nightmare.prototype.run;
    var runAsync = Promise.promisify(nativeRun);
    Nightmare.prototype.run = function(){
        var args = [].slice.call(arguments);
        args.splice(0, args.length-1);
        return runAsync.apply(this, args)
    };
    return Nightmare;
};