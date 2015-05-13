
var XHR = {};

(function() {

  var loading = {};

  function load(url, callback) {
    if (loading[url]) {
      return loading[url];
    }

    var req = new XMLHttpRequest();

    req.onreadystatechange = function() {
      if (req.readyState !== 4) {
        return;
      }

      delete loading[url];

      if (!req.status || req.status < 200 || req.status > 299) {
        return;
      }

      callback(req);
    };

    loading[url] = req;
    req.open('GET', url);
    req.send(null);

    return {
      abort: function() {
        req.abort();
        delete loading[url];
      }
    };
  }

  XHR.load = function(url, callback) {
    return load(url, function(req) {
      if (req.responseText !== undefined) {
        callback(req.responseText);
      }
    });
  };

  XHR.loadJSON = function(url, callback) {
    return load(url, function(req) {
      if (req.responseText) {
        var json;
        try {
          json = JSON.parse(req.responseText);
        } catch(ex) {
          console.error('Could not parse JSON from '+ url +'\n'+ ex.message);
        }
        callback(json);
      }
    });
  };

  XHR.abortAll = function() {
    for (var url in loading) {
      loading[url].abort();
    }
    loading = {};
  };

  XHR.destroy = function() {
    XHR.abortAll();
    loading = null;
  };

}());
