function MyDispatcher(){
    this.workersMap = {};
    this.workersList = [];
};
MyDispatcher.prototype.registry = function(worker){
    this.workersList.push(worker)
};
MyDispatcher.prototype.dispatch = function(fn, callback){
    var worker = this.getWorker();
    worker.enqueue(fn, callback);
}
MyDispatcher.prototype.getWorker = function(){
    var returnWorker = {
        worker:{},
        len:0
    };
    for(var i=0, len=this.workersList.length, worker; i<len; i++){
        worker = this.workersList[i];
        var len = worker.running;
        if(len === 0){
            return worker;
        }else{
            if(len < returnWorker.len || returnWorker.len === 0){
                returnWorker.worker = worker;
                returnWorker.len = len;
            }
        }
    }
    return returnWorker.worker;
}
var createDispatcher = module.exports = function(){
    return new MyDispatcher()
}