class Markers {

  constructor () {
    this.items = [];
    this.div = document.createElement('DIV');
    this.div.className = 'osmb-markerpane';

    //this.detection();

  }

  detection () {
    console.log("hier")
    console.log(this)
    requestAnimationFrame(this.detection);
  }

  get () {
   return this.items;
  }
  add (item){
    this.items.push(item);
  }
  remove (obj){
    this.items.forEach( (item) => {if(item === obj){this.items.splice(item)}});
  }

  destroy (){
    this.items = [];
  }

}