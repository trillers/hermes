var Case = require('../models/Case').model;
var caseTaxiService = require('./CaseTaxiService');
var caseCoffeeService = require('./CaseCoffeeService');
var UserBiz = require('../../user/models/UserBiz');
var CaseEnum = require('../../common/models/TypeRegistry').item('Case');
var CaseStatus = require('../../common/models/TypeRegistry').item('CaseStatus');
var settings = require('hermes-settings');
var logger = require('../../../app/logging').logger;
var u = require('../../../app/util');
var wechat = require('../../wechat/common/api');
var subcaseServiceMap = {
    'Taxi': caseTaxiService,
    'Coffee': caseCoffeeService
}
var Service = {};

Service.load = function* (id) {
    try {
        var doc = yield Case.findById(id).populate('commissionerId').lean(true).exec();
        var subcaseService = subcaseServiceMap[CaseEnum.valueNames(doc.type)];
        var subcase = yield subcaseService.loadAsync(doc.subcase);
        doc.subcase = subcase;
        logger.debug('Succeed to load  Case [id=' + id + ']');
        return doc;
    }catch(e){
        logger.error('Fail to load Case [id=' + id + ']: ' + e);
    }
};

Service.create = function* (json) {
    try{
        var subcaseService = subcaseServiceMap[CaseEnum.valueNames(json.type)];
        var abscase = new Case(json);
        var subdoc = yield subcaseService.createAsync(json);
        abscase.subcase = subdoc._id;
        var casedoc = yield abscase.save();
        var result = casedoc.toObject();
        result.subcase = subdoc;
        logger.debug('Succeed to create Case: ' + require('util').inspect(result) + '\r\n');
        return result;
    }catch(e){
        console.error(e)
        logger.error('Fail to create Case: ' + require('util').inspect(result) + '\r\n');
    }
};

Service.delete = function* (id) {
    try{
        var doc = yield Case.findByIdAndRemove(id).exec();
        logger.debug('Succeed to delete Case [id=' + id + ']');
        return doc;
    }catch(e){
        logger.error('Fail to delete Case [id=' + id + ']: ' + e);
    }
};

Service.update = function* (id, update) {
    var doc = yield Case.findByIdAndUpdate(id, update, {new: true}).exec();
    logger.debug('Succeed to update Case [id=' + id + ']');
    return doc;
};

Service.updateByCondition = function* (condition, update) {
    var doc = Case.findOneAndUpdate(condition, update, {new: true});
    logger.debug('Succeed to update Case [id=' + doc._id + ']');
    return doc;
};

Service.findOneByPhone = function* (conditions){
    try {
        var findDoc = {}
        var docs = yield Case.find({status: {$in: ['df', 're', 'ap', 'ut', 'is']}}).populate('commissionerId').lean(true).exec();
        for(var i=0, len=docs.length; i<len; i++){
            if(docs[i].commissionerId.phone === conditions.phone){
                findDoc = docs[i];
                break;
            }
        }
        var subcaseService = subcaseServiceMap[CaseStatus.name(findDoc.type)];
        var subcase = yield subcaseService.loadAysnc(doc.subcase);
        doc.subcase = subcase;
        logger.debug('Succeed to load  Case [id=' + id + ']');
        return doc;
    }catch(e){
        logger.error('Fail to load Case [id=' + id + ']: ' + e);
    }
}

Service.find = function* (params) {
    var query = Case.find();

    if (params.options) {
        query.setOptions(params.options);
    }

    if (params.sort) {
        query.sort(params.sort);
    }

    if (params.page) {
        var skip = (params.page.no - 1) * params.page.size;
        var limit = params.page.size;
        if (skip) query.skip(skip);
        if (limit) query.limit(limit);
    }

    if (params.conditions) {
        query.find(params.conditions);
    }


    //TODO: specify select list, exclude comments in list view
    query.lean(true);
    var docs = yield query.exec();
    return docs;
};

Service.filter = function* (params) {
    var query = Case.find();

    if (params.options) {
        query.setOptions(params.options);
    }

    if (params.sort) {
        query.sort(params.sort);
    }

    if (params.page) {
        var skip = (params.page.no - 1) * params.page.size;
        var limit = params.page.size;
        if (skip) query.skip(skip);
        if (limit) query.limit(limit);
    }

    if (params.conditions) {
        query.find(params.conditions);
    }
    query.lean(true);
    var docs = yield query.exec();
    return docs;
};

module.exports = Service;