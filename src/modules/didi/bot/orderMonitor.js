var sp = require('hermes-settings').serviceItem.car;
var Nightmare = require('nightmare');
var carService = require('./CarService');
var createService = require('./serviceFactory');
var request = require('request');
var url = 'api/CallCar/getOrderList?callback=_4776213433ae01f2c6a9&_=1441077088673';
var carKv = require('../kvs/Car');
var orderFSM = require('../framework/FSM').orderWorkflow;
var co = require('co');
var PromiseB = require('bluebird');
var phantom=require('phantom');
var cookieLocator = '../../../../tmp/phantom_cookie';
var statusMap = {
    '0': 'Applying',
    '1': 'Undertaken',
    '2': 'InService'
}
function init(app, cb){
    this.phantom = phantom;
    login(phantom, cb);
}
function postFn(callback){
    var app = this;
    function next(){
        console.log('Monitor is polling----------')
        getRemoteOrderInfo(function(err, res){
            if(res && res.data && res.data.length > 0){
                analysisOrderList(res.data, app, function(){
                    next();
                })
            }else{
                setTimeout(function(){
                    next();
                }, 3000)
            }

        });
    }
    next();
    callback();
}
function analysisOrderList(data, app, done){
    co(function* (){
        try{
            var orderList = data;
            var preOrderList = yield _getPreOrderList();
            if(!preOrderList){
                orderList.forEach(function(cmd){
                    return app.emit(getStatusMap(cmd.status), cmd)
                })
            }
            if(!orderList){
                return;
            }
            var cmds = compactOrderList(preOrderList, orderList);
            cmds.forEach(function(cmd){
                app.emit(cmd.name, cmd);
            });
            setTimeout(function(){
                done();
            }, 6000);
        }catch(e){
            console.log('error Occur--------');
            console.log(e)
        }
    });
}

function compactOrderList(preOrderList, orderList){
    var cmds = [];
    for(var i=0, len=orderList.length; i<len; i++){
        var currOrder = orderList[i];
        var cmd = currOrder;
        //is exist
        var preOrder = preOrderList[currOrder.id];
        if(preOrder){
            var preStatus = preOrder.status;
            var currStatus = currOrder.status;
            if(preStatus != currStatus){
                cmd.name = getStatusMap(currStatus);
                //cmd.name = orderFSM.getChange(preStatus, currStatus);
                cmds.push(cmd);
            }
            delete preOrderList[currOrder.id];
        }else{
            //not exist -- new one
            cmd.name = getStatusMap(currStatus);
            //cmd.name = 'Applying';
            cmds.push(cmd);
        }
    }
    //remain preOrderList -- cancel or done
    for(var i=0, len=preOrderList.length; i<len; i++){
        var cmd = preOrderList[i];
        if(preOrderList[i].status === 'InService'){
            cmd.name = 'Completed';
        }else{
            cmd.name = 'Cancelled';
        }
        cmds.push(cmd)
    }
    return cmds;
}

function _getPreOrderList(){
        return carKv.getOrderListAsync()
        .then(function(list){
            Promise.resolve(list)
        }).catch(function(e){
            Promise.reject(e)
        })
}

function handle(cmd, callback){
    callback(new Error('orderMonitor nothing to handle'), null)
}
function waitFor(checkFn, gap, timeout){
    var args = [].slice.call(arguments);
    if(args.length === 1){
        return new Promise(function(resolve, reject){
            setTimeout(function(){
                resolve()
            }, args[0])
        })
    }
    var startTime = (new Date()).getTime();
    return new Promise(function(resolve, reject){
        var count = setInterval(function(){
            if(((new Date()).getTime() - startTime) > timeout){
                clearInterval(count)
                reject(new Error('wait for something failed'));
            }
            var promise = checkFn.apply(null);
            promise.then(function(result){
                if(result){
                    clearInterval(count)
                    resolve(result)
                }
            })
        }, gap)
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
function login(phantom, callback){
    phantom.create({parameters:{'cookies-file': cookieLocator}}, function (ph) {
        ph.createPage(function (page) {
            pageProxy = createProxy(page);
            pageProxy = PromiseB.promisifyAll(pageProxy);
            pageProxy.openAsync('http://es.xiaojukeji.com/Auth/login?__utm_source=nosource')
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
                .then(function(cookie){
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
                .then(function () {
                    return waitFor(2000)
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
                                } else {
                                    Promise.reject(new Error('ajax failed'));
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
                .then(function (result) {
                    //ph.exit();
                    callback(null, result)
                })
                .catch(function (e) {
                    console.log('Failed to get remote order list');
                    console.log(e)
                    callback(e, null)
                })
        })
    })
}
function getStatusMap(originStatus){
    return statusMap[originStatus];
}
module.exports = function(app){
    return createService(app, handle, init, postFn)
};

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