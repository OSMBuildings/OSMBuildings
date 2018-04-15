class Markers {

  constructor () {
    this.items = [];
    this.div = document.createElement('DIV');
    this.div.className = 'osmb-markerpane';
    this.div.style.width = '100%';
    this.div.style.height = '100%';

    APP.container.appendChild(this.div);
    this.updateMarkerView();


  }

  updateMarkerView () {

    requestAnimationFrame(() => {

      this.items.forEach( (obj) => {

        let newPos = osmb.project(obj.position.latlng.latitude, obj.position.latlng.longitude, obj.position.elevation);

        if((obj.offsetX + newPos.x + obj.div.offsetWidth) < APP.width && (obj.offsetX + newPos.x) > APP.canvas.offsetLeft &&
          (obj.offsetY + newPos.y) < APP.height && (obj.offsetY + newPos.y) > APP.canvas.offsetTop){

          if(!obj.visibility){
            obj.addToMap();
            obj.visibility = true;
          }

          obj.div.style.transform = "translate(" + Math.round((obj.offsetX + newPos.x - obj.screenPosition.x)) + "px,"+ Math.round((obj.offsetY + newPos.y - obj.screenPosition.y)) + "px)";

        } else {
          if(obj.visibility)obj.removeFromMap()
        }

      });

      if (APP.activity.isBusy()) {
        this.updateMarkerView();

      } else {
        setTimeout(() => {
          this.updateMarkerView();
        }, 150);
      }

    }); // end requestAnimationFrame()

  }

  get () {
    return this.items;
  }

  add (item){
    this.items.push(item);
  }

  remove (item){
    for(let i = 0; i<this.items.length; i++){
      if(this.items[i] === item){this.items.splice(i,1)}
    }
  }

  destroy (){
    this.items = [];
  }

}