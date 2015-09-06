function MyQueue(concurrency){
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
}
MyQueue.prototype.enqueue = function(fn, callback){
    this.queue.push({fn: fn, cb: callback});
    if(this.running < this.concurrency){
        this.execute()
    }
};
MyQueue.prototype.execute = function(){
    var me = this;
    function next(){
        if(me.queue.length != 0 && me.running < me.concurrency){
            me.running++;
            var task = me.queue.shift()
            var thunkFn = task.fn;
            function cbWrap(cb){
                return function(){
                    cb.apply(null, arguments);
                    me.running--;
                    next();
                }
            }
            thunkFn.call(null, cbWrap(task.cb));
        }
    }
    next();
};
module.exports = createQueue = function(concurrency){
    return new MyQueue(concurrency);
}
