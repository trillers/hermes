var mongoose = require('../../../app/mongoose');
var DomainBuilder = require('../../../framework/model/DomainBuilder');

var schema = DomainBuilder
    .i('CaseTaxi')
    .withBasis()
    .withLifeFlag()
    .withCreatedOn()
    .withProperties({
        origin: {type: String},         //出发地
        destination: {type: String},    //目的地
        driverName: {type: String},     //司机姓名
        driverPhone: {type: String},    //司机手机
        carLicensePlate: {type: String},//车牌照
        carModel: {type: String},       //车型
        mileage: {type: Number}         //里程数
    })
    .build();

module.exports.schema = schema;
module.exports.model = schema.model(true);