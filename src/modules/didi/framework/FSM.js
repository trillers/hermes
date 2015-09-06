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
        {name: 'place', from: 'Draft', to: 'Reviewing'},
        {name: 'resolve', from: 'Reviewing', to: 'Applying'},
        {name: 'carry', from: 'Applying', to: 'Undertaken'},
        {name: 'getOn', from: 'Undertaken', to: 'InService'},
        {name: 'complete', from: 'InService', to: 'Completed'},
        {name: 'csCancel', from: ['Applying, Undertaken'], to: 'Cancelled'},
        {name: 'driverCancel', from: 'Undertaken', to: 'Cancelled'},
        {name: 'cancel', from: _.values(stt), to: 'Cancelled'}
    ]
});
FSM.registry(orderWorkflow);
module.exports = {
    FSM: FSM,
    orderWorkflow: orderWorkflow
};
