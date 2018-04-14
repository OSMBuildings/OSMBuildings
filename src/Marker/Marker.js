Marker = class {

  constructor (sourceLink, offsetX = 0, offsetY = 0) {

    this.parent = APP.markerPane;
    this.div = document.createElement("IMG");
    this.div.setAttribute("src", sourceLink);
    this.div.style.position = "absolute";
    this.div.style.visibility = 'hidden';
    /*
    this.div.className = ' ' + 'osmb-popup';
    this.div.style.position = "absolute";
    this.div.style.zIndex = 1000;
    */
    this.screenPosition = {x: 0, y:0};
    this.position= {latlng: {latitude: 0, longitude: 0}, elevation: 0};

    if(!isNaN(offsetX)){
      this.offsetX = Math.round(offsetX);
    }
    else {
      this.offsetX = 0;
    }

    if(!isNaN(offsetY)){
      this.offsetY = Math.round(offsetY);
    } else {
      this.offsetY = 0;
    }

    // osmb.on('change', () => {
    //   this.setPosition({latitude: this.position.latlng.latitude, longitude: this.position.latlng.longitude }, this.position.elevation)
    // })

  }

  getPosition(){
    return osmb.unproject(this.div.style.left.substring(0,this.div.style.left.length-2), this.div.style.top.substring(0,this.div.style.top.length-2));
  }

  setPosition(latlng, elevation = 0){
    if(isNaN(latlng.latitude || latlng.longitude || elevation)) return;

    let pos = osmb.project(latlng.latitude, latlng.longitude, elevation);

    this.position = {latlng: latlng, elevation: elevation};
    this.screenPosition = pos;
    this.div.style.left = this.offsetX+Math.round(pos.x) + 'px';
    this.div.style.top = this.offsetY+Math.round(pos.y) + 'px';
    APP.markers.add(this);

  }

  addToMap(){
    APP.markers.div.appendChild(this.div);
  }

  remove(){
    APP.markers.div.removeChild(this.div);
    APP.markers.remove(this);
    delete this;
  }

}

