
class Promise {

  resolve(val) {
    if (this.state !== Promise.STATE_PENDING) {
      return;
    }

    if (val && (typeof val === 'function' || typeof val === 'object')) {
      let firstTime = true;

      try {
        const then = val.then;
        if (typeof then === 'function') {
          // and call the val.then (which is now in 'then') with val as the context and the
          // resolve/reject functions per thenable spec
          then.call(val, res => {
            if (firstTime) {
              firstTime = false;
              this.resolve(res);
            }
          }, err => {
            if (firstTime) {
              firstTime = false;
              this.reject(err);
            }
          });
          return;
        }
      } catch (ex) {
        if (firstTime) {
          this.reject(ex);
        }
        return;
      }
    }

    this.state = Promise.STATE_FULFILLED;
    this.val = val;

    if (this.listeners) {
      setTimeout(() => {
        this.listeners.forEach(listener => {
          resolveListener(listener, this.val);
        });
      }, 0);
    }
  }

  reject(reason) {
    if (this.state !== Promise.STATE_PENDING) {
      return;
    }

    this.state = Promise.STATE_REJECTED;
    this.val = reason;

    if (this.listeners) {
      setTimeout(() => {
        this.listeners.forEach(listener => {
          rejectListener(listener, this.val);
        });
      }, 0);
    }
  }

  then(success, error) {
    const promise = new Promise();
    const listener = { success: success, error: error, promise: promise };

    if (this.state === Promise.STATE_PENDING) {
      // we are pending, so client must wait - so push client to end of this.c array (create if necessary for efficiency)
      if (this.listeners) {
        this.listeners.push(listener);
      } else {
        this.listeners = [listener];
      }
    } else { // if state was NOT pending, then we can just immediately (soon) call the resolve/reject handler
      setTimeout(() => { // we are not pending, so yield script and resolve/reject as needed
        if (this.state === Promise.STATE_FULFILLED) {
          resolveListener(listener, this.val);
        } else {
          rejectListener(listener, this.val);
        }
      }, 0);
    }

    return promise;
  }
}

Promise.STATE_PENDING = [][0]; // undefined
Promise.STATE_FULFILLED = 'fulfilled';
Promise.STATE_REJECTED = 'rejected';

Promise.all = function(tasks) {
  const
    res = [],
    promise = new Promise(); // results and resolved count

  let done = 0;

  // function resolve(p, i) {
  //   if (!p || typeof p.then !== 'function')
  //     p = Promise.resolve(p);
  //   p.then(
  //     function(yv) {
  //       res[i] = yv;
  //       rc++;
  //       if (rc == tasks.length) promise.resolve(results);
  //     },
  //     function(nv) {
  //       promise.reject(nv);
  //     }
  //   );
  // }

  if (!tasks.length) {
    promise.resolve(res);
  } else {
    tasks.forEach((task, i) => {
      if (!task || typeof task.then !== 'function') {
        task = Promise.resolve(task);
      }

      task.then(val => {
        res[i] = val;
        done++;
        if (done === tasks.length) {
          promise.resolve(res);
        }
      }, err => {
        promise.reject(err);
      });
    });
  }

  return promise;
};

function resolveListener(listener, val) {
  if (typeof listener.success === 'function') {
    try {
      const res = listener.success(val);
      listener.promise.resolve(res);
    } catch (err) {
      listener.promise.reject(err)
    }
  } else {
    listener.promise.resolve(val); // pass this along...
  }
}

function rejectListener(listener, reason) {
  if (typeof listener.error === 'function') {
    try {
      const res = listener.error(reason);
      listener.promise.resolve(res);
    } catch (err) {
      listener.promise.reject(err)
    }
  } else {
    listener.promise.reject(reason); // pass this along...
  }
}
