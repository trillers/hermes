var carService = require('../../../../src/modules/didi/services/CarService');
var assert = require("assert");
var co = require('co');
var Promise = require('bluebird');
var mockId = null;
setTimeout(function() {
    // do some setup

    describe('save FastCar order to db', function(){
        var mockOrder = {
            type: 'tx',
            commissionerId: 'KPse',
            responsibleId: 'xj',
            conversationId: '123',
            useTime: '2-03-30',
            origin: '西二旗',
            destination: '平谷'
        };
        it('just save the order to db and return the doc while saved', function(done){
            co(function* () {
                var order = yield carService.saveFastCarOrder(mockOrder);
                mockId = order._id;
                assert.ok(order._id);
                done();
            })
        })
    });
    describe('submit a FastCar Order', function(){
        it('db will update the change of orders status when a order-reject event is triggered', function(done){
            carService.on('OrderRejected', function(err, order){
                console.log(data);
            });
            done();
        });
        it('db will update the change of orders status when a order-reject event is triggered', function(done){
            carService.on('OrderSubmit', function(err, order){
                console.log('a order had been submit[id]----' + order._id);
            })
            done();
        });
        it('db will update the change of orders status when a order-cancelled event is triggered', function(done){
            carService.on('OrderCancelled', function(err, order){
                console.log('a order had been cancelled[id]----' + order._id);
            })
            done();
        });
        it('db will update the change of orders status when a order-cancelled event is triggered', function(done){
            carService.on('OrderApplying', function(err, order){
                console.log('a order had been applying[id]----' + order._id);
            })
            done();
        });
        it('db will update the change of orders status when a order-cancelled event is triggered', function(done){
            carService.on('OrderUndertaken', function(err, order){
                console.log('a order had been undertaken[id]----' + order._id);
            })
            done();
        });
        it('the bot will place the order and return the order doc while updated it from db', function(done){
            co(function* () {
                var order = yield carService.submitFastCarOrder(mockId);
                assert.equal(order.status, 're');
                //done();
            })
        })
        //it('the bot will cancel the order and return the order doc while updated it from db', function(done){
        //    co(function* (){
        //        var order = yield carService.cancelFastCarOrder(mockId);
        //        console.log(order);
        //        assert.equal(order.status, 'cc');
        //        done();
        //    })
        //})
    });
    //describe('get a FastCar order from db', function(){
    //    it('just load the order doc from db', function(done){
    //        co(function* () {
    //            var order = yield carService.getFastCarOrder(mockId);
    //            console.log('~~~~~~~~~~~~~~~~~~~~~~~~~')
    //            console.log(order);
    //            assert.ok(order._id);
    //            done();
    //        })
    //    })
    //});


    run();
}, 3000);
//超时            3
//监听（取消，变化）1
//应用程序对接     2
