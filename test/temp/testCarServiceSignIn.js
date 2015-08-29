var csService = require('../src/modules/car/services/CarService');
var assert = require("assert");
var co = require('co');
var Promise = require('bluebird')
before(function(){

})
describe('sign in didi', function(){
    it('sign in will ok', function(done){
        co(function* (){
            var startTime = (new Date()).getTime();
            console.log(startTime)
            yield csService.signIn();
            console.log('sign in operation\'s Execution time last: ' + ((new Date()).getTime()-startTime) + 'ms')
            done();
        })
    })
})

