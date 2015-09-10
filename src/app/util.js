var util = {};
util.extend = function(obj, source) {
    for (var prop in source) {
        obj[prop] = source[prop];
    }
    return obj;
};
util.extendAll = function(target, source){
    for (var prop in source) {
        if(typeof source[prop]=='object'){
            if(typeof target[prop]!='object'){
                target[prop] = {};
            }
            util.extendAll(target[prop], source[prop]);
        }
        else{
            target[prop] = source[prop];

        }
    }
    return target;
};
util.clone = function(source) {
    return util.extend({},source);
};
util.defaults = function(obj, source) {
    for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
    }
    return obj;
};
util.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return typeof value === 'function' ? value.call(object) : value;
};


util.appendLine = function(target, str, parseFlag){
    str = str.replace(/%%.*%%/, parseFlag);
    target += str + "\n";
    return target;
}

//relationshipId generator(Two strings have the same length)
util.genOneToOneId = function(str1, str2) {
    return _sortStr(str1, str2);
}

function _sortStr(str1, str2) {
    for(var i = 0, len = str1.length; i<len; i++) {
        var char1 = str1.charAt(i),
            char2 = str2.charAt(i);
        if(char1 < char2) {
            return str1 + str2;
        }else if(char1 > char2){
            return str2 + str1;
        }else if(i === (len-1)){
            throw new Error('Failed to generate relationshipId One to One [error]: two objs has the same Id');
        }
    }
}
//2-03-30
util.dateParse = function(str){
    var now = new Date();
    var nowyear = now.getFullYear();
    var nowmonth = now.getMonth() + 1;
    if(nowmonth.toString().length <2 ){
        nowmonth = '0' + nowmonth;
    }
    var nowday = now.getDate();
    if(nowday.toString().length <2 ){
        nowday = '0' + nowday;
    }
    var day = str.split('-')[0];
    var hour = str.split('-')[1];
    var min = str.split('-')[2];
    var timestamp = Date.parse(nowyear + '/' + nowmonth + '/' + nowday);
    console.log(new Date(timestamp));
    timestamp += (day*24*3600 + hour*3600 + min*60)*1000;
    return new Date(timestamp);
}
util.dateStringify = function(date){
    var now = new Date();
    var nowday = now.getDate();
    var day = date.getDate();
    var hour = date.getHours();
    if(hour.toString().length<2){
        hour = '0' + hour;
    }
    var min = date.getMinutes();
    if(min.toString().length<2){
        min = '0' + min;
    }
    var dateArr = [];
    dateArr.push(day-nowday);
    dateArr.push(hour);
    dateArr.push(min);
    return dateArr.join('-');
}
module.exports = {
    extend: util.extend,
    extendAll: util.extendAll,
    clone: util.clone,
    defaults: util.defaults,
    result: util.result,
    appendLine: util.appendLine,
    genOneToOneId: util.genOneToOneId,
    dateStringify: util.dateStringify,
    dateParse: util.dateParse
};