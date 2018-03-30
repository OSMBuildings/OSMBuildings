class Request {

  static load (url, callback) {
    const req = new XMLHttpRequest();

    let time = setTimeout(function () {

      if (req.onreadystatechange !== 4) {
        req.abort();
        callback('status');
      }
    }, 2000);

    req.onreadystatechange = () => {
      if (req.readyState !== 4) {
        return;
      }

      clearTimeout(time);

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
    return this.load(url, (error, res) => {
      if (error) {
        callback();
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
    return this.load(url, (error, res) => {
      if (error) {
        callback();
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
    return this.load(url, (error, res) => {
      if (error) {
        callback('content');
        return;
      }
      if (res.responseText) {
        let json;
        try {
          json = JSON.parse(res.responseText);

          callback(null, json);
        } catch (ex) {
          console.warn(`Could not parse JSON from {url}\n{ex.message}`);
          callback('content');
        }
      }
    });
  }
}
