var fsmModule = require('../../../framework/fsm');
var _ = require('underscore')
var Workflow = fsmModule.Workflow;
var FSM = fsmModule.FSM;
var stt = {
    'Draft': '0',
    'Reviewing': '1',
    'Applying': '2',
    'Undertaken': '3',
    'InService': '4',
    'Completed': '5',
    'Cancelled': '6'
};
var orderWorkflow = FSM.create({
    name: 'orderWorkflow',
    initial: 'Draft',
    actions:[
        {name: 'OrderRejected', from: 'Reviewing', to: 'Draft'},
        {name: 'OrderSubmit', from: 'Draft', to: 'Reviewing'},
        {name: 'OrderApplying', from: 'Reviewing', to: 'Applying'},
        {name: 'OrderUndertaken', from: 'Applying', to: 'Undertaken'},
        {name: 'OrderInService', from: 'Undertaken', to: 'InService'},
        {name: 'OrderCompleted', from: 'InService', to: 'Completed'},
        {name: 'OrderCancelled', from: _.values(stt), to: 'Cancelled'},
        {name: 'OrderApplyingTimeout', from: 'Applying', to: 'Timeout'}
    ]
});
FSM.registry(orderWorkflow);
module.exports = {
    FSM: FSM,
    orderWorkflow: orderWorkflow
};
