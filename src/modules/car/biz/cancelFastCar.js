var sp = require('hermes-settings').serviceItem.car;
var Nightmare = require('nightmare');
var carService = require('../services/CarService');
var createWorker = require('./workerFactory')

function handle(cmd, callback){
    var nightmare = this.phantom;
    nightmare
        .goto(sp.url + 'InsteadCar/order')
        .evaluate(function() {
            var list = document.querySelectorAll('div.orderState');
            list.forEach(function(item){
                //item
                //div.sub a.del
            })
        }, function(){
            return;
        })
        .run(function(err, nightmare){
            if(!err){
                return callback(null, null)
            }
        })
}
module.exports = function(app){
    return createWorker(app, handle)
};