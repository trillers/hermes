var Nightmare = require('nightmare');
var nightmare = new Nightmare({cookiesFile: '../src/modules/car/biznightmarecookie'});
nightmare.on('resourceReceived', function(data){
    console.log(data)
})
nightmare.goto('http://es.xiaojukeji.com/InsteadCar/order')
    .evaluate(function(){
        return document.title;
    }, function(title){
        console.log("----------")
        console.log(title)
    })
    .run(function(){
        console.log("ok")
    }, 1);
    //.evaluate(function(){
    //    window.i=1
    //    window._jsonpDate = i++;
    //    var oAjax = new XMLHttpRequest();
    //    oAjax.open('GET', 'http://es.xiaojukeji.com/api/CallCar/getOrderList');
    //    oAjax.send();
    //    oAjax.onreadystatechange = function () {
    //        window._jsonpDate = 1;
    //        if (oAjax.readyState == 4) {
    //            if (oAjax.status == 200) {
    //                window._jsonpDate = oAjax.responseText;
    //            }
    //        }
    //    };
    //}, function(){
    //    var nightmare = this;
    //    function recur(){
    //        nightmare.evaluate(function(){
    //            return window._jsonpDate;
    //        }, function(data){
    //            console.log(data)
    //            //if(data){
    //            //    console.log(data)
    //            //}else{
    //                setTimeout(function(){
    //                    recur()
    //                }, 200)
    //            //}
    //        })
    //        .run(function(){
    //
    //        })
    //    }
    //    recur();
    //}.bind(nightmare))
    //.run(function(err, nightmare){
    //    //console.log('ok')
    //    //function recur(){
    //    //    console.log('recur')
    //    //    nightmare.evaluate(function(){
    //    //        return window._jsonpDate
    //    //    }, function(jsonp){
    //    //        console.log(jsonp)
    //    //        if(jsonp){
    //    //            console.log(jsonp)
    //    //            console.log(jsonp);
    //    //        }else{
    //    //            setTimeout(function(){
    //    //                recur();
    //    //            }, 200)
    //    //        }
    //    //    })
    //    //    .run(function(){
    //    //
    //    //    })
    //    //}
    //    //recur();
    //})
