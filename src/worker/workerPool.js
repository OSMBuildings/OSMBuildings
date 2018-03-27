var WorkerPool;
// https://gonzalo123.com/2013/12/22/playing-with-html5-building-a-simple-pool-of-webwokers/
WorkerPool = (function() {
    var pool = {};
    var poolIds = [];

    function WorkerPool(worker, numberOfWorkers) {
        this.worker = worker;
        this.numberOfWorkers = numberOfWorkers;

        for (var i = 0; i < this.numberOfWorkers; i++) {
            poolIds.push(i);
            var myWorker = new Worker(worker);

            + function(i) {
                myWorker.addEventListener('message', function(e) {   

                    pool[i].status = true;
                    poolIds.push(i);
                });
            }(i);

            pool[i] = { status: true, worker: myWorker };

        }

        this.getFreeWorkerId = function(callback) {
            if (poolIds.length > 0) {
                return callback(poolIds.pop());
            } else {
                var that = this;
                setTimeout(function() {
                    that.getFreeWorkerId(callback);
                }, 100);
            }
        }
    }

    WorkerPool.prototype.postMessage = function(data) {
        this.getFreeWorkerId(function(workerId) {
            pool[workerId].status = false;
            var worker = pool[workerId].worker;
            //console.log("postMessage with worker #" + workerId);
            worker.postMessage(data);
        });
    };

    WorkerPool.prototype.registerOnMessage = function(callback) {
        for (var i = 0; i < this.numberOfWorkers; i++) {
            pool[i].worker.addEventListener('message', callback);
        }
    };

    WorkerPool.prototype.getFreeIds = function() {
        return poolIds;
    };

    return WorkerPool;
})();