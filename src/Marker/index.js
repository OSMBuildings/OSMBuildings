class Markers {

  constructor () {
    this.items = [];
    this.div = document.createElement('DIV');
    this.div.className = 'osmb-markerpane';
    this.div.style.width = '100%';
    this.div.style.height = '100%';
    APP.container.appendChild(this.div);
    this.bounds = { southWest: {latitude: 0, longitude: 0}, northEast: {latitude: 0, longitude: 0}};
    this.changeDetection();

  }

  changeDetection () {

    requestAnimationFrame(() => {

      this.items.forEach( (obj) => {

        let newPos = osmb.project(obj.position.latlng.latitude, obj.position.latlng.longitude, obj.position.elevation);

        if(obj.offsetX+newPos.x < (APP.canvas.offsetLeft+APP.width) && obj.offsetX+newPos.x > APP.canvas.offsetLeft &&
          obj.offsetY+newPos.y < APP.height && obj.offsetY+newPos.y > APP.canvas.offsetTop){

          if(obj.div.style.visibility === 'hidden') { obj.div.style.visibility = 'visible'}

          obj.div.style.transform = "translate(" + Math.round((obj.offsetX + newPos.x - obj.screenPosition.x)) + "px,"+ Math.round((obj.offsetY + newPos.y - obj.screenPosition.y)) + "px)";

          // obj.div.style.left = obj.offsetX+Math.round(newPos.x) + 'px';
          // obj.div.style.top = obj.offsetY+Math.round(newPos.y) + 'px';
        } else {
          if(obj.div.style.visibility === 'visible'){
            obj.div.style.visibility = 'hidden';
          }
        }

      });

      if (APP.activity.isBusy()) {
        this.changeDetection();

      } else {
        setTimeout(() => {
          this.changeDetection();
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
    this.items.forEach( (obj) => {if(obj === item){this.items.splice(obj)}});
  }

  destroy (){
    this.items = [];
  }

}