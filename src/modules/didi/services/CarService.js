var bot = require('../bot');
var caseService = require('../../case/services/CaseService');
var orderWf = require('../framework/FSM').orderWorkflow;
var util = require('../../../app/util');
var co = require('co');
var OrderMap = {
    OrderSubmit: OrderSubmitHandler
}
var Service = {}; //Pain object javascript service object

/**
 * Customer service can create or update a fast car order, but not submit it to
 * be reviewed.
 * @param order
 */
Service.saveFastCarOrder = function* (order){
    //TODO: need implementation
    //save order to db
    //return order
    order.useTime = util.dateParse(order.useTime);
    var result = yield caseService.create(order);
    return result;
};

/**
 * Customer service can submit a fast car order to be reviewed.
 * if order informatio is valid, then car service will create
 * a new order in didi enterprise platform
 * @param orderId
 */
Service.submitFastCarOrder = function* (orderId){
    //call bot to create an order
    try{
        var orderDoc = yield caseService.load(orderId);
        orderDoc.useTime = util.dateStringify(orderDoc.useTime);
        yield bot.createFastCarOrder(orderDoc);
        orderDoc.status = 're';
        yield caseService.update(orderId, orderDoc);
        return orderDoc;
    }catch(e){
        throw new Error('Failed to Call a Fast car');
    }

    // var orderDoc = loadOrder();
    // orderDoc.didiId =
    //update order record/document id, didiId
};

/**
 * load a order detail by order id.
 * @param orderId
 */
Service.getFastCarOrder = function* (orderId){
    //TODO: need implementation
    try {
        var orderDoc = yield caseService.load(orderId);
        return orderDoc;
    }catch(e){
        throw new Error('Failed to get fast car order');
    }
};

/**
 * Customer service can cancel a order which is
 * in applying or undertaken status on behalf of customer.
 * @param orderId
 */
Service.cancelOrder = function* (orderId){
    try{
        var orderDoc = yield caseService.load(orderId);
        yield bot.cancelFastCarOrder(orderDoc);
        var result = yield caseService.update(orderId, {status: 'cc'});
        return result;
    }catch(e){
        throw new Error('Failed to cancel a car order');
    }

};

/**
 * OrderRejected :
 * OrderSubmit
 * OrderApplying :
 * OrderUndertaken
 * OrderCancelled
 * OrderApplyingTimeout
 * OrderInService
 * OrderCompleted
 */
Service.on = function(type, callback){
    bot.on(type, function(type, order){
        console.log("!!!!!!!!!!!!!!!!!!!!!!")
        co(function*(){
            try{
                var newOrder = yield OrderMap[type](order);
                return callback(newOrder)
            }catch(e){
                return callback(e)
            }
        })
    });
};

['OrderRejected', 'OrderApplying', 'OrderUndertaken', 'OrderCancelled', 'OrderApplyingTimeout', 'OrderInService', 'OrderCompleted'].forEach(function(eventName){
    OrderMap[eventName] = OrderStatusModifyHandler
});
function* OrderSubmitHandler(type, order){
    console.log("###########################")
    try{
        var newOrder = yield caseService.update(order._id, {status: 're'});
        console.log("###########################")
        callback(null, newOrder);
    }catch(e){
        callback(e, null);
    }
}
function* OrderStatusModifyHandler(type, originOrder){
    console.log("&&&&&&&&&&&&&&&&&&")
    try {
        var json = {
            status: orderWf.getActionTo(type),
            responsibleId: 'xj',
            cost: originOrder.pre_total_fee,
            useTime: originOrder.departure_time,
            place: '',
            origin: originOrder.start_name,
            destination: originOrder.end_name,
        };
        originOrder.driver_phone && (json['driverPhone'] = originOrder.driver_phone);
        //save or update originOrder
        var caseObj = yield caseService.findOneByPhone({conditions: {phone: originOrder.passenger_phone}});
        var doc = yield caseService.update(caseObj._id, json);
        console.log("$$$$$$$$$$$$$$$$$$$$$")
        return doc;
    }catch(e){
        throw e;
    }
}
module.exports = Service;