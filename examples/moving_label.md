### Moving label

This label moves virtually in space.

~~~ html
<div id="label" style="width:10px;height:10px;position:absolute;z-Index:10;border:3px solid red;"></div>
~~~

~~~ javascript
var label = document.getElementById('label');
osmb.on('change', function() {
  var pos = osmb.project(52.52, 13.37, 50);
  label.style.left = Math.round(pos.x) + 'px';
  label.style.top = Math.round(pos.y) + 'px';
});
~~~
