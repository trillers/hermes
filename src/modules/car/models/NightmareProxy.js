var Promise = require('bluebird');
module.exports = function(Nightmare){
    var nativeRun = Nightmare.prototype.run;
    var runAsync = Promise.promisify(nativeRun);
    Nightmare.prototype.run = runAsync;
    return Nightmare;
}