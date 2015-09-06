var carService = require('../src/modules/didi/services/CarService');
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
            yield carService.signIn();
            console.log('sign in operation\'s Execution time last: ' + ((new Date()).getTime()-startTime) + 'ms')
            done();
        })
    })
})

