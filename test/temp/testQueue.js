var dispatcher = require('../src/modules/car/framework')
var createQueue = require('../src/modules/car/framework/MyQueue')
queue1 = createQueue(2);
queue2 = createQueue(1);
dispatcher.registry(queue1);
dispatcher.registry(queue2);
var thunkify = require('thunkify');
var co = require('co');
function test(data, cb){
    setTimeout(function(){
        console.log('mission compelete')
        cb(null, data);
    }, 1000)
}
var thukTest = thunkify(test);
dispatcher.dispatch(thukTest('123'), function(err, data){
    console.log(data)
    console.log('ok')
})
dispatcher.dispatch(thukTest('123'), function(){
    console.log('ok')
})
dispatcher.dispatch(thukTest('123'), function(err, data){
    console.log(data)
    console.log('ok')
})
dispatcher.dispatch(thukTest('123'), function(){
    console.log('ok')
})