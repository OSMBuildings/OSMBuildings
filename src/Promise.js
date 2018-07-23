class Promise {

  resolve (value) {
    if (this.state !== STATE_PENDING) {
      return;
    }

    if (value && (typeof value === 'function' || typeof value === 'object')) {
      let first = true; // first time through?
      try {
        const then = value.then;
        if (typeof then === 'function') {
          // and call the value.then (which is now in 'then') with value as the context and the
          // resolve/reject functions per thenable spec
          then.call(value, ra => {
            if (first) {
              first = false;
              this.resolve(ra);
            }
          }, rr => {
            if (first) {
              first = false;
              this.reject(rr);
            }
          });
          return;
        }
      }
      catch (e) {
        if (first) {
          this.reject(e);
        }
        return;
      }
    }

    this.state = STATE_FULFILLED;
    this.v = value;

    if (this.clients) {
      setImmediate(e => {
        this.clients.forEach(client => resolve(client, value));
      });
    }
  }

  reject (reason) {
    if (this.state !== STATE_PENDING) {
      return;
    }

    this.state = STATE_REJECTED;
    this.v = reason;

    if (this.clients) {
      setImmediate(e => {
        this.clients.forEach(client => reject(client, reason));
      });
    }
  }

  then (onF, onR) {
    const p = new Promise();
    const client = { y: onF, n: onR, p: p };

    if (this.state === STATE_PENDING) {
      // we are pending, so client must wait - so push client to end of this.clients array (create if necessary for efficiency)
      if (this.clients) {
        this.clients.push(client);
      } else {
        this.clients = [client];
      }
    } else { // if state was NOT pending, then we can just immediately (soon) call the resolve/reject handler
      const s = this.state, a = this.v;
      setImmediate(e => { // we are not pending, so yield script and resolve/reject as needed
        if (s === STATE_FULFILLED) {
          resolve(client, a);
        } else {
          reject(client, a);
        }
      });
    }

    return p;
  }
}

const STATE_PENDING   = [][0]; // These are the three possible states (PENDING remains undefined - as intended)
const STATE_FULFILLED = 'fulfilled'; // a promise can be in.  The state is stored
const STATE_REJECTED  = 'rejected'; // in this.state as read-only

function resolve(client, arg) {
  if (typeof client.y === 'function') {
    try {
      const yret = client.y(arg);
      client.p.resolve(yret);
    } catch (err) {
      client.p.reject(err)
    }
  } else {
    client.p.resolve(arg); // pass this along...
  }
}

function reject(client, reason) {
  if (typeof client.n === 'function') {
    try {
      const yret = client.n(reason);
      client.p.resolve(yret);
    } catch (err) {
      client.p.reject(err)
    }
  } else {
    client.p.reject(reason); // pass this along...
  }
}
