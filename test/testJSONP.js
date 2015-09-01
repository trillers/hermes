var request = require('request');
var phantom=require('node-phantom');
var cookie = '../src/modules/car/biznightmarecookie'
function test(){
    new Nightmare({cookiesFile: cookie})
        .on('resourceReceived', function(res){
            console.log(res)
        })
        .goto('http://es.xiaojukeji.com/api/CallCar/getOrderList')
        .evaluate(function(){
            return document.innerText
        }, function(item){
            console.log(item)
        })
        .run(function(err, nightmare){
            request('http://es.xiaojukeji.com/api/CallCar/getOrderList', function(err, res, body){
                console.log(body);
            })
        })
}
test()