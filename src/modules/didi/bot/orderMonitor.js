var sp = require('hermes-settings').serviceItem.car;
var url = 'api/CallCar/getOrderList?callback=_4776213433ae01f2c6a9&_=1441077088673';
var carKv = require('../kvs/Car');
var co = require('co');
var PromiseB = require('bluebird');
var phantom=require('phantom');
var cookieLocator = '../../../../../tmp/phantom_cookies';
var EventEmitter = require('events').EventEmitter;
var orderWf = require('../framework/FSM').orderWorkflow;
var waitFor = require('./helper').phantom.waitFor;
var statusMap = {
    '0': 'Applying',
    '1': 'Undertaken',
    '2': 'InService'
};
var Bot = {};
_mixin(Bot, new EventEmitter());
function statUpMonitor(callback){
    var me = Bot;
    console.log("start monitor---------");
    function next(){
        console.log('Monitor is polling----------')
        getRemoteOrderInfo(function(err, res){
            if(err && err.message === 'no_login'){
                return login(function(){
                    next();
                })
            }
            if(res){
                console.log("**************************");
                console.log("get order list---------" + require('util').inspect(res));
                console.log(res.data);
                console.log(res.data.length);
                console.log("**************************");
            }
            if(res && res.data && res.data.length > 0){
                console.log("enter check---------------")
                analysisOrderList(res.data, me, function(err, orderList){
                    if(err && err.message == 'no_modify'){
                        console.log("test----------" + err);
                        process.nextTick(function(){
                            setTimeout(function(){
                                next();
                            }, 3000)
                        });
                        return;
                    }
                    var arr = [];
                    orderList.forEach(function(order){
                        if(!order.hasOwnProperty('order_status')){
                            order.order_status = 0;
                        }
                        arr.push({order_id: order.order_id, order_status: order.order_status});
                    });
                    carKv.saveOrderListAsync(arr)
                    .then(function(){
                        next();
                    });
                })
            }else{
                process.nextTick(function(){
                    setTimeout(function(){
                        next();
                    }, 3000)
                })
            }
        });
    }
    next();
    callback(null, null);
}
function analysisOrderList(data, monitor, done){
    console.log("enter analysis---------------");
    co(function* (){
        try{
            console.log("orderList---------------");
            console.log(data);
            var orderList = data;
            var preOrderList = yield _getPreOrderList();
            if(preOrderList){
                console.log("preOrderList---------------");
                console.log(typeof preOrderList[0]);
                console.log(Array.isArray(preOrderList));
            }
            if(!preOrderList){
                console.log("no preOrderList---------------");
                orderList.forEach(function(order){
                    console.log("{{{{{{{{{{{{{{{{{{{{{{{{{{{");
                    console.log("order.status---------------------"+order.order_status);
                    console.log(getStatusMap(order.order_status));
                    console.log("{{{{{{{{{{{{{{{{{{{{{{{{{{{");
                    monitor.emit(orderWf.getPrevAction(getStatusMap(order.order_status || 0)), order)
                });
                return done(null, orderList);
            }
            var cmds = compactOrderList(preOrderList, orderList);
            if(cmds.length <= 0){
                return done(new Error('no_modify'), orderList);
            }
            cmds.forEach(function(cmd){
                monitor.emit(cmd.name, cmd);
            });
            done(null, orderList);
        }catch(e){
            console.log('error Occur--------');
            console.log(e)
        }
    });
}

function compactOrderList(preOrderList, orderList){
    console.log("enter compact---------------");
    var cmds = [];
    for(var i=0, len=orderList.length; i<len; i++){
        var currOrder = orderList[i];
        var cmd = currOrder;
        var currStatus = currOrder.order_status || 0;
        //is exist
        var metaData = existInPreOrder(preOrderList, currOrder);
        var preOrder = metaData && metaData.preOrder || null;
        var preIndex = metaData && metaData.index || null;
        console.log("preOrder---------------");
        console.log(preOrder);
        if(preOrder){
            console.log("preOrderIsExist---------------");
            var preStatus = preOrder.order_status;
            console.log(preStatus);
            console.log(currStatus);
            if(preStatus != currStatus){
                cmd.name = orderWf.getPrevAction(getStatusMap(currStatus));
                //cmd.name = orderFSM.getChange(preStatus, currStatus);
                cmds.push(cmd);
            }
            preOrderList.splice(preIndex, 1);
        }else{
            console.log("new one---------------");
            //not exist -- new one
            cmd.name = orderWf.getPrevAction(getStatusMap(currStatus));
            //cmd.name = 'Applying';
            cmds.push(cmd);
        }
    }
    //remain preOrderList -- cancel or done
    for(var i=0, len=preOrderList.length; i<len; i++){
        var cmd = preOrderList[i];
        if(preOrderList[i].order_status === '2'){
            cmd.name = 'OrderCompleted';
        }else{
            cmd.name = 'OrderCancelled';
        }
        cmds.push(cmd)
    }
    return cmds;
}
function existInPreOrder(preOrderList, currOrder){
    for(var i=0, len=preOrderList.length; i<len; i++){
        preOrderList[i].order_id === currOrder.order_id;
        return {preOrder:preOrderList[i], index: i};
    }
    return null;
}
function _getPreOrderList(){
        return carKv.getOrderListAsync()
        .then(function(list){
            return list;
        }).catch(function(e){
            PromiseB.reject(e)
        })
}

function createProxy(page){
    var pageProxy = {};
    pageProxy.open=function(url, callback){
        page.open(url, function(status){
            callback(null, status)
        });
    };
    pageProxy.evaluate=function(fn, callback){
        page.evaluate(fn, function(result){
            callback(null, result)
        });
    };
    return pageProxy;
}
function login(callback){
    phantom.create({parameters:{'cookies-file': cookieLocator}}, function (ph) {
        ph.createPage(function (page) {
            pageProxy = createProxy(page);
            pageProxy = PromiseB.promisifyAll(pageProxy);
            pageProxy.openAsync('http://es.xiaojukeji.com/Auth/login?__utm_source=nosource')
                .then(function(){
                    return waitFor(2000);
                })
                .then(function(){
                    return pageProxy.evaluateAsync(function(){
                        document.querySelector('#phone').focus();
                    })
                })
                .then(function(){
                    page.sendEvent('keypress', '15022539525', null, null, 0);
                    return pageProxy.evaluateAsync(function(){
                        document.querySelector('#password').focus();
                    })
                })
                .then(function(){
                    page.sendEvent('keypress', '40115891r', null, null, 0)
                    return;
                })
                .then(function(){
                    return pageProxy.evaluateAsync(function(){
                        document.querySelector('input[type="submit"]').click()
                    })
                })
                .then(function(){
                    return pageProxy.evaluateAsync(function(){
                        return document.title;
                    })
                })
                .then(function(title){
                    return waitFor(3000)
                })
                .then(function(){
                    ph.exit();
                    callback(null, null)
                })
                .catch(function(e){
                    callback(e, null)
                })
        })
    })
}
function getRemoteOrderInfo(callback) {
    phantom.create({parameters: {'cookies-file': cookieLocator}}, function (ph) {
        ph.createPage(function (page) {
            pageProxy = createProxy(page);
            pageProxy = PromiseB.promisifyAll(pageProxy);
            pageProxy.openAsync('http://es.xiaojukeji.com')
                .then(function (status) {
                    return;
                })
                .then(function(){
                    return pageProxy.evaluateAsync(function(){
                        return document.title;
                    })
                })
                .then(function (title){
                    if(title && title != '滴滴打车企业平台'){
                        console.log(title);
                        ph.exit();
                        return PromiseB.reject(new Error('no_login'));
                    }
                })
                .then(function () {
                    return pageProxy.evaluateAsync(function () {
                        window._jsonpDate = null;
                        var oAjax = new XMLHttpRequest();
                        oAjax.open('GET', 'http://es.xiaojukeji.com/api/CallCar/getOrderList');
                        oAjax.send();
                        oAjax.onreadystatechange = function () {
                            if (oAjax.readyState == 4) {
                                if (oAjax.status == 200) {
                                    window._jsonpDate = oAjax.responseText;
                                }
                            }
                        };
                    })
                })
                .then(function (result) {
                    return waitFor(function () {
                        return pageProxy.evaluateAsync(function () {
                            return window._jsonpDate;
                        })
                    }, 100, 10000)
                })
                .then(function (data) {
                    //ph.exit();
                    var result = JSON.parse(data)
                    callback(null, result)
                })
                .catch(function (e) {
                    console.log('Failed to get remote order list');
                    callback(e, null)
                })
        })
    })
}
function getStatusMap(originStatus){
    return statusMap[originStatus];
}
function _mixin(target, source){
    for(var prop in source){
        target[prop] = source[prop];
    }
}
Bot.handle = PromiseB.promisify(statUpMonitor)
module.exports = Bot;

//{
//    status: 0,
//        msg: "success",
//    data: [
//    {
//        finish_time: "0000-00-00 00:00:00",
//        input: "1",
//        tip: "0",
//        passenger_id: "7370571777",
//        product_id: "4",
//        driver_start_distance: "11679",
//        consult_min: "15",
//        resend_reason: "",
//        schema_id: "4",
//        strive_car_level: "600",
//        cap_price: "0.00",
//        current_lng: "116.295940",
//        driver_display_price: "0.00",
//        channel: "29999",
//        dest_name: "邓庄南路|唐家岭新城东区",
//        type: "1",
//        driver_id: "563428383461377",
//        passenger_phone: "15001322885",
//        current_lat: "40.051329",
//        call_times: "1",
//        setoncar_time: "0000-00-00 00:00:00",
//        travel_id: "0",
//        strategy_token: "ba19ed6b19bac3006f8058c9e7c1cc0a",
//        _modify_time: "2015-09-01 11:13:02",
//        start_dest_distance: "3549",
//        district: "010",
//        combo_id: "0",
//        pre_total_fee: "7.00",
//        arrive_time: "0000-00-00 00:00:00",
//        dest_lng: "116.277510",
//        driver_type: "1",
//        starting_name: "海淀区海定区中关村软件园二号路二号楼|中关村软件园孵化器2号楼",
//        consult_time: "2015-09-01 20:50:00",
//        extra_type: "33",
//        car_id: "1989896",
//        consult_status: "1",
//        remark: "",
//        begin_charge_time: "0000-00-00 00:00:00",
//        _status: "1",
//        passenger_count: "0",
//        departure_time: "2015-09-01 20:50",
//        dynamic_price: "0",
//        _birth_time: "2015-09-01 11:11:27",
//        order_status: "1",
//        dest_lat: "40.068448",
//        order_id: "343158780",
//        bouns: "36",
//        close_reason: "0",
//        strive_time: "2015-09-01 11:13:02",
//        starting_lat: "40.051329",
//        pay_type: "0",
//        require_level: "600",
//        area: "1",
//        extra_info: "",
//        _create_time: "2015-09-01 11:11",
//        driver_phone: "13426112877",
//        version: "3",
//        delay_time_start: "0000-00-00 00:00:00",
//        starting_lng: "116.295940",
//        is_pay: "0",
//        combo_type: "0",
//        driverInfo: {},
//        resend_flag: 0,
//        driver_pos: {},
//        distance: 0,
//        arrivedTime: 0,
//        status: "wait_driver",
//        status_no: 1,
//        interval: 30,
//        now: 1441077635,
//        encode_oid: "TkRNeU9USTRNekUzTkRBPQ==",
//        id: "5644357958945498690",
//        passenger_name: "",
//        start_name: "中关村软件园孵化器2号楼",
//        start_time: "2015-09-01 11:11:27",
//        end_name: "唐家岭新城东区",
//        combo_time: "0 小时",
//        traffic_number: "",
//        nav_create_time: "20:50",
//        is_driver_change: 0,
//        html_status: 3,
//        use_car_srv: 301
//    }
//],
//    html_string: ""
//}