var sp = require('hermes-settings').serviceItem.car;
var Nightmare = require('nightmare');
var carService = require('../services/CarService');
var createWorker = require('./workerFactory');
var request = require('request');
var url = 'api/CallCar/getOrderList?callback=_4776213433ae01f2c6a9&_=1441077088673';
var carKv = require('../kvs/Car');
var orderFSM = require('../framework/FSM').orderWorkflow;
function init(app, cb){
    function next(){
        request.get(sp.url + url, function(err, response, body){
            if (!error && response.statusCode == 200) {
                analysisOrderList(body.data, app, next);
            }
        });
    }
    next();
    cb(null, null);
}
function analysisOrderList(data, app, done){
    co(function* (){
        try{
            var orderList = data;
            var preOrderList = yield _getPreOrderList();
            var cmds = compactOrderList(preOrderList, orderList);
            cmds.forEach(function(cmd){
                app.emit(cmd.name, cmd);
            });
            setTimeout(function(){
                done();
            }, 2000);
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
                cmd.name = orderFSM.getChange(preStatus, currStatus);
                cmds.push(cmd);
            }
            delete preOrderList[currOrder.id];
        }else{
            //not exist -- new one
            cmd.name = 'place';
            cmds.push(cmd)
        }
    }
    //remain preOrderList -- cancel or done
    for(var i=0, len=preOrderList.length; i<len; i++){
        var cmd = preOrderList[i];
        if(preOrderList[i].status === 'Undertaken'){
            cmd.name = 'complete';
        }else{
            cmd.name = 'cancel';
        }
        cmds.push(cmd)
    }
    return cmds;
}

function _getPreOrderList(callback){
        return carKv.getOrderListAsync()
        .then(function(list){
            callback(null, list);
        }).catch(function(e){
            callback(e, null)
        })
}

function handle(cmd, callback){
    callback(new Error('orderMonitor nothing to handle'), null)
}
module.exports = function(app){
    return createWorker(app, handle, init)
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