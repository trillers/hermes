var Service = {}; //Pain object javascript service object

/**
 * Customer service can create or update a fast car order, but not submit it to
 * be reviewed.
 * @param order
 */
Service.saveFastCarOrder = function(order){
    //TODO: need implementation
    //save order to db
    //return order
};

/**
 * Customer service can submit a fast car order to be reviewed.
 * if order informatio is valid, then car service will create
 * a new order in didi enterprise platform
 * @param orderId
 */
Service.submitFastCarOrder = function(orderId){
    //TODO: need implementation
    //call bot to create an order






    // var orderDoc = loadOrder();
    // orderDoc.didiId =
    //update order record/document id, didiId
};

/**
 * load a order detail by order id.
 * @param orderId
 */
Service.getFastCarOrder = function(orderId){
    //TODO: need implementation
};

/**
 * Customer service can cancel a order which is
 * in applying or undertaken status on behalf of customer.
 * @param orderId
 */
Service.cancelFastCarOrder = function *(orderId){
    //TODO: need implementation
    var cancelFastCarBot = new require('../bot/cancelFastCar');

    var result = yield cancelFastCarBot(orderId);
    yield update(orderId, );
};

/**
 * OrderRejected :
 * OrderApplying :
 * OrderUndertaken
 * OrderCancelled
 * OrderApplyingTimeout
 * OrderInService
 *
 * var carService = ...;
 * carService.saveFastCarOrder();
 * carService.on('OrderRejected', function(InvalidOrder){
 *     ...
 * });
 */
Service.on = function(){
    //TODO: need implementation
};





module.exports = Service;