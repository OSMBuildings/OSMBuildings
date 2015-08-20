
var State = {};

(function() {

  function save(map) {
    if (!history.replaceState) {
      return;
    }

    var params = [];
    var position = map.position;
    params.push('lat=' + position.latitude.toFixed(5));
    params.push('lon=' + position.longitude.toFixed(5));
    params.push('zoom=' + map.zoom.toFixed(1));
    params.push('tilt=' + map.tilt.toFixed(1));
    params.push('rotation=' + map.rotation.toFixed(1));
    history.replaceState({}, '', '?'+ params.join('&'));
  }

  State.load = function() {
    var state = {};
    var query = location.search;
    if (query) {
      var params = {};
      query = query.substring(1).replace( /(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
        if ($1) {
          params[$1] = $2;
        }
      });

      var res = {};
      if (params.lat !== undefined && params.lon !== undefined) {
        state.position = { latitude:parseFloat(params.lat), longitude:parseFloat(params.lon) };
      }
      if (params.zoom !== undefined) {
        state.zoom = parseFloat(params.zoom);
      }
      if (params.rotation !== undefined) {
        state.rotation = parseFloat(params.rotation);
      }
      if (params.tilt !== undefined) {
        state.tilt = parseFloat(params.tilt);
      }
    }
    return state;
  };

  var timer;
  State.save = function(map) {
    clearTimeout(timer);
    timer = setTimeout(function() {
      save(map);
    }, 1000);
  };

}());
