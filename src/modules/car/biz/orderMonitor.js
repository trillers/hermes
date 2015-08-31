var sp = require('hermes-settings').serviceItem.car;
var Nightmare = require('nightmare');
var carService = require('../services/CarService');
var createWorker = require('./workerFactory')

function handle(cmd, callback){
    var nightmare = this.phantom;
    nightmare.on('resourceReceived', function(res){
        //维护着一个订单快照，每一次jsonp对比快照，发出改变的订单状态

    });
    nightmare.goto(sp.url + 'InsteadCar/order');

    //var page = require('webpage').create();
    //page.onResourceRequested = function(request) {
    //    console.log('Request ' + JSON.stringify(request, undefined, 4));
    //};
    //page.onResourceReceived = function(response) {
    //    console.log('Receive ' + JSON.stringify(response, undefined, 4));
    //};
    //page.open(url);
    callback(null, null)
}
module.exports = function(app){
    return createWorker(app, handle)
};