var cskv = require('../src/modules/didi/kvs/Car')
var assert = require("assert");
describe('init xiaoju auth', function(){
    var username = '15022539525';
    var password = '40115891r';
    var json = {
        username: username,
        password: password
    }
    it('save will ok', function(done){
        cskv.setAuthInfoAsync(json, function(err, result){
            console.log('..................')
            console.log(result)
            done()
        })
    })
})