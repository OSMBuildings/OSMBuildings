
class Request {

  static load (url, callback) {
    const req = new XMLHttpRequest();

    const timer = setTimeout(t => {
      if (req.readyState !== 4) {
        req.abort();
        callback('status');
      }
    }, 10000);

    req.onreadystatechange = () => {
      if (req.readyState !== 4) {
        return;
      }

      clearTimeout(timer);

      if (!req.status || req.status < 200 || req.status > 299) {
        callback('status');
        return;
      }

      callback(null, req);
    };

    req.open('GET', url);
    req.send(null);

    return {
      abort: () => {
        req.abort();
      }
    };
  }

  static getText (url, callback) {
    return this.load(url, (err, res) => {
      if (err) {
        callback(err);
        return;
      }
      if (res.responseText !== undefined) {
        callback(null, res.responseText);
      } else {
        callback('content');
      }
    });
  }

  static getXML (url, callback) {
    return this.load(url, (err, res) => {
      if (err) {
        callback(err);
        return;
      }
      if (res.responseXML !== undefined) {
        callback(null, res.responseXML);
      } else {
        callback('content');
      }
    });
  }

  static getJSON (url, callback) {
    return this.load(url, (err, res) => {
      if (err) {
        callback(err);
        return;
      }
      if (!res.responseText) {
        callback('content');
        return;
      }

      let json;
      try {
        json = JSON.parse(res.responseText);
        callback(null, json);
      } catch (ex) {
        console.warn(`Could not parse JSON from ${url}\n${ex.message}`);
        callback('content');
      }
    });
  }
}
