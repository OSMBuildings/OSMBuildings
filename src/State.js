
var State = {};

(function() {

  function save(map) {
    if (!history.replaceState) {
      return;
    }

    var params = [];
    var center = map.getCenter();
    params.push('latitude=' + center.latitude.toFixed(5));
    params.push('longitude=' + center.longitude.toFixed(5));
    params.push('zoom=' + map.getZoom().toFixed(1));
    params.push('tilt=' + map.getTilt().toFixed(1));
    params.push('rotation=' + map.getRotation().toFixed(1));
    history.replaceState({}, '', '?'+ params.join('&'));
  }

  State.load = function(options) {
    var query = location.search;
    if (query) {
      var state = {};
      query = query.substring(1).replace( /(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
        if ($1) {
          state[$1] = $2;
        }
      });

      if (state.latitude !== undefined && state.longitude !== undefined) {
        options.center = { latitude:parseFloat(state.latitude), longitude:parseFloat(state.longitude) };
      }
      if (state.zoom !== undefined) {
        options.zoom = parseFloat(state.zoom);
      }
      if (state.rotation !== undefined) {
        options.rotation = parseFloat(state.rotation);
      }
      if (state.tilt !== undefined) {
        options.tilt = parseFloat(state.tilt);
      }
    }
    return options;
  };

  var timer;
  State.save = function(map) {
    clearTimeout(timer);
    timer = setTimeout(function() {
      save(map);
    }, 1000);
  };

}());
