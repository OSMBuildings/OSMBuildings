<link rel="stylesheet" href="https://raw.githubusercontent.com/OSMBuildings/OSMBuildings/master/dist/OSMBuildings/OSMBuildings.css">
<link rel=stylesheet href=assets/tutorial_prep.css>
<script src=https://rawgit.com/OSMBuildings/OSMBuildings/master/dist/OSMBuildings/OSMBuildings.js></script>

<style>
  .control {
    position: absolute;
    left: 10px;
    z-index: 1000;
  }

  .control.tilt {
    top: 100px;
  }

  .control.rotation {
    top: 145px;
  }

  .control.zoom {
    top: 190px;
  }

  .control.zoom button{
    font-weight: normal;
  }

  .control button {
    width: 30px;
    height: 30px;
    margin: 15px 0 0 15px;
    border: 1px solid #999999;
    background: #ffffff;
    opacity: 0.6;
    border-radius: 5px;
    box-shadow: 0 0 5px #666666;
    font-weight: bold;
    text-align: center;
  }

  .control button:hover {
    opacity: 1;
    cursor: pointer;
  }
</style>


<div id='map'></div>
<div class="control tilt">
  <button class="dec">&#8601;</button>
  <button class="inc">&#8599;</button>
</div>

<div class="control rotation">
  <button class="inc">&#8630;</button>
  <button class="dec">&#8631;</button>
</div>

<div class="control zoom">
  <button class="dec">-</button>
  <button class="inc">+</button>
</div>

<script src=assets/tutorial_prep.js></script>

<script>
var controlButtons = document.querySelectorAll('.control button');

for (var i = 0; i < controlButtons.length; i++) {
  controlButtons[i].addEventListener('click', function(e) {
    var button = this;
    var parentClassList = button.parentNode.classList;
    var direction = button.classList.contains('inc') ? 1 : -1;
    var increment;
    var property;

    if (parentClassList.contains('tilt')) {
      property = 'Tilt';
      increment = direction*10;
    }
    if (parentClassList.contains('rotation')) {
      property = 'Rotation';
      increment = direction*10;
    }
    if (parentClassList.contains('zoom')) {
      property = 'Zoom';
      increment = direction*1;
    }
    if (property) {
      map['set'+ property](map['get'+ property]()+increment);
    }
  });
}
</script>

### Map control buttons

The code below adds buttons to the top left of the map, for controlling tilt, rotation, and zoom.

````css
.control {
  position: absolute;
  left: 10px; /* This might need to be tweaked */
  z-index: 1000;
}

.control.tilt {
  top: 100px; /* This might need to be tweaked */
}

.control.rotation {
  top: 145px; /* This might need to be tweaked */
}

.control.zoom {
  top: 190px; /* This might need to be tweaked */
}

.control.zoom button{
  font-weight: normal;
}

.control button {
  width: 30px;
  height: 30px;
  margin: 15px 0 0 15px;
  border: 1px solid #999999;
  background: #ffffff;
  opacity: 0.6;
  border-radius: 5px;
  box-shadow: 0 0 5px #666666;
  font-weight: bold;
  text-align: center;
}

.control button:hover {
  opacity: 1;
  cursor: pointer;
}
````


````xml
<div class="control tilt">
  <button class="dec">&#8601;</button>
  <button class="inc">&#8599;</button>
</div>

<div class="control rotation">
  <button class="inc">&#8630;</button>
  <button class="dec">&#8631;</button>
</div>

<div class="control zoom">
  <button class="dec">-</button>
  <button class="inc">+</button>
</div>
````

````javascript
var controlButtons = document.querySelectorAll('.control button');

for (var i = 0; i < controlButtons.length; i++) {
  controlButtons[i].addEventListener('click', function(e) {
    var button = this;
    var parentClassList = button.parentNode.classList;
    var direction = button.classList.contains('inc') ? 1 : -1;
    var increment;
    var property;

    if (parentClassList.contains('tilt')) {
      property = 'Tilt';
      increment = direction*10;
    }
    if (parentClassList.contains('rotation')) {
      property = 'Rotation';
      increment = direction*10;
    }
    if (parentClassList.contains('zoom')) {
      property = 'Zoom';
      increment = direction*1;
    }
    if (property) {
      map['set'+ property](map['get'+ property]()+increment);
    }
  });
}
````
