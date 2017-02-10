```css
.button-wrapper{
  position: absolute;
  top:1em;
  left:1em;
  font-family: Arial, sans-serif;
  font-size:12px;
}
.button-wrapper .label{
  font-weight: bold;
  color:#555;
  margin-bottom:.5em;
}
.button-wrapper button{
  padding: .7em 1em;
  background: white;
  font-weight:bold;
  border:none;
  box-shadow: 0 2px 3px rgba(0,0,0,.1);
  border-radius:2px;
  z-index:99;
  cursor: pointer;
  background:#dd5050;
  color:white;
}
.button-wrapper button:hover{
  box-shadow: 0 3px 4px rgba(0,0,0,.3);
}
.button-wrapper button:active{
  box-shadow: 0 1px 2px rgba(0,0,0,.05);
}
.button-wrapper button:focus{
  outline:none
}
```

```html
<div class="button-wrapper">
  <div class="label">points:</div>
  <button data-point="b">point b</button>
  <button data-point="a">point a</button>
</div>
```

```js

// code
var osmb = new OSMBuildings({
    position: { latitude:50.25655, longitude:127.51859 },
    zoom: 16,
    minZoom: 1,
    maxZoom: 128,
    state: true, // stores map position/rotation in url
});

var pointData = {
  a: function(){
    return {latitude: 50.257123, longitude: 127.51700, rotation: -30, zoom: 17.6, tilt: 45};
  },
  b: function(){
    return {latitude: 50.2575, longitude: 127.5019, rotation: 15, zoom: 16.8, tilt: 25};
  }
};

// button handling
var currentPoint = 'a';
var animationTime = 2500;
var buttons = document.querySelectorAll('button');
var tween = null;
var isAnimating = false;

[].forEach.call(buttons, function(button){
   button.addEventListener('click', handleButton, false);
});

function handleButton(){
  var pointTo = this.getAttribute('data-point');
  var pointFrom = pointTo === 'a' ? 'b' : 'a';

  if(currentPoint === pointTo || isAnimating){
    return false;
  }

  currentPoint = pointTo;
  startAnimation(pointData[pointFrom](), pointData[pointTo]());
}

function startAnimation(valuesFrom, valuesTo){
  if(tween){
    tween.stop();
  }

  isAnimating = true;
  tween = new TWEEN.Tween(valuesFrom)
  .to(valuesTo, animationTime)
  .onUpdate(function() {
    osmb.setPosition({ latitude: this.latitude, longitude: this.longitude });
    osmb.setRotation(this.rotation);
    osmb.setZoom(this.zoom);
    osmb.setTilt(this.tilt);
  })
  .onComplete(function(){
    isAnimating = false;
  })
  .start();

  requestAnimationFrame(animate);
}

function animate(time) {
  requestAnimationFrame(animate);
  TWEEN.update(time);
}


```
