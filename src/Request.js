
var Request = {};

(function() {

  var queue = {};

  function load(url, callback) {
    if (queue[url]) {
      return queue[url];
    }

    var req = new XMLHttpRequest();

    req.onreadystatechange = function() {
      if (req.readyState !== 4) {
        return;
      }

      delete queue[url];

      if (!req.status || req.status<200 || req.status>299) {
        return;
      }

      callback(req);
    };

    queue[url] = req;
    req.open('GET', url);
    req.send(null);

    return {
      abort: function() {
        if (queue[url]) {
          req.abort();
          delete queue[url];
        }
      }
    };
  }

  //***************************************************************************

  Request.getText = function(url, callback) {
    return load(url, function(res) {
      if (res.responseText !== undefined) {
        callback(res.responseText);
      }
    });
  };

  Request.getXML = function(url, callback) {
    return load(url, function(res) {
      if (res.responseXML !== undefined) {
        callback(res.responseXML);
      }
    });
  };

  Request.getJSON = function(url, callback) {
    return load(url, function(res) {
      if (res.responseText) {
        var json;
        try {
          json = JSON.parse(res.responseText);
        } catch(ex) {
          console.warn('Could not parse JSON from '+ url +'\n'+ ex.message);
        }
        callback(json);
      }
    });
  };

  Request.abortAll = function() {
    for (var url in queue) {
      queue[url].abort();
    }
    queue = {};
  };

  Request.destroy = function() {
    this.abortAll();
  };

}());
