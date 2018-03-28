
// TODO: introduce promises

class Request {

  static load(url, callback) {

    const req = new XMLHttpRequest();

    req.onreadystatechange = () => {
      if (req.readyState !== 4) {
        return;
      }

      if (!req.status || req.status<200 || req.status>299) {
        return;
      }

      callback(req);
    };

    req.open('GET', url);
    req.send(null);

    return {
      abort: () => {
        req.abort();
      }
    };
  }

  static getText(url, callback) {
    return this.load(url, res => {
      if (res.responseText !== undefined) {
        callback(res.responseText);
      }
    });
  }

  static getXML(url, callback) {
    return this.load(url, res => {
      if (res.responseXML !== undefined) {
        callback(res.responseXML);
      }
    });
  }

  static getJSON(url, callback) {
    return this.load(url, res => {
      if (res.responseText) {
        let json;
        try {
          json = JSON.parse(res.responseText);
        } catch(ex) {
          console.warn(`Could not parse JSON from {url}\n{ex.message}`);
        }
        callback(json);
      }      
    });
  }
}
