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
        let objStyle = obj.div.style;

        if((obj.offsetX + newPos.x + obj.div.width) < APP.width && (obj.offsetX + newPos.x) > APP.canvas.offsetLeft &&
          (obj.offsetY + newPos.y) < APP.height && (obj.offsetY + newPos.y) > APP.canvas.offsetTop){

          if(objStyle.visibility === 'hidden') objStyle.visibility = 'visible'

          objStyle.transform = "translate(" + Math.round((obj.offsetX + newPos.x - obj.screenPosition.x)) + "px,"+ Math.round((obj.offsetY + newPos.y - obj.screenPosition.y)) + "px)";

        } else {
          if(objStyle.visibility === 'visible') objStyle.visibility = 'hidden'
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
    for(let i = 0; i<this.items.length; i++){
      if(this.items[i] === item){this.items.splice(i,1)}
    }
  }

  destroy (){
    this.items = [];
  }

}