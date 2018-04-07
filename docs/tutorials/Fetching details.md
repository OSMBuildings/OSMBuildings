<link rel="stylesheet" href="https://raw.githubusercontent.com/OSMBuildings/OSMBuildings/master/dist/OSMBuildings/OSMBuildings.css">
<link rel=stylesheet href=assets/tutorial_prep.css>
<script src=https://rawgit.com/OSMBuildings/OSMBuildings/master/dist/OSMBuildings/OSMBuildings.js></script>

<div id='map'></div>

<script src=assets/tutorial_prep.js></script>

<script>
// This function does an HTTP get request, given a URL, and passes the response to a callback
// Source: http://stackoverflow.com/a/4033310/1202488
function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

osmb.on('pointerdown', function(e) {
  var id = osmb.getTarget(e.detail.x, e.detail.y, function(id) {
    if (id) {
      var url = "http://overpass-api.de/api/interpreter?data=[out:json];(relation(" + id.replace(/^[a-z]+/, '') + ");way(r);node(w);way(" + id.replace(/^[a-z]+/, '') + ");way(23853131);node(w));out;";
      httpGetAsync(url, function(response){
        alert(response);
      });
    }
  });
});
</script>

Sometimes, you may want access to the raw Openstreetmap data. Currently, we don't store that
locally, but we do store the ids, so you can query overpass turbo for it.

When you click on a building above, it will query overpass turbo, and a short while later, it will
display an alert window with the response, which contains the details for that building.

````javascript
// This function does an HTTP get request, given a URL, and passes the response to a callback
// Source: http://stackoverflow.com/a/4033310/1202488
function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

osmb.on('pointerdown', function(e) {
  var id = osmb.getTarget(e.detail.x, e.detail.y, function(id) {
    if (id) {
      var url = "http://overpass-api.de/api/interpreter?data=[out:json];(relation(" + id.replace(/^[a-z]+/, '') + ");way(r);node(w);way(" + id.replace(/^[a-z]+/, '') + ");way(23853131);node(w));out;";
      httpGetAsync(url, function(response){
        alert(response);
      });
    }
  });
});
````
