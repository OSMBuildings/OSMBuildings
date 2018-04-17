class Markers {

  constructor () {
    this.items = [];
    this.div = document.createElement('DIV');
    this.div.className = 'osmb-markers';
    this.div.style.width = '100%';
    this.div.style.height = '100%';

    APP.container.appendChild(this.div);
    this.updateMarkerView();
  }

  updateMarkerView () {
    // compensate map offset
    let offset = (APP.maxZoom - APP.zoom) * 2;

    this.items.forEach(item => {
      const newPos = osmb.project(item.position.latlng.latitude, item.position.latlng.longitude, item.position.elevation);

      if ((item.offsetX + newPos.x + item.div.offsetWidth) < APP.width && (item.offsetX + newPos.x) > APP.canvas.offsetLeft &&
        (item.offsetY + newPos.y) < APP.height && (item.offsetY + newPos.y) > APP.canvas.offsetTop) {

        if (!item.visibility) {
          item.addToMap();
          item.visibility = true;
        }

        item.div.style.transform = `translate(${Math.round(item.offsetX + newPos.x - item.screenPosition.x - offset)}px, ${Math.round(item.offsetY + newPos.y - item.screenPosition.y)}px)`;
      } else {
        if (item.visibility) {
          item.removeFromMap();
          // ? item.visibility = false;
        }
      }
    });
  }

  get () {
    return this.items;
  }

  add (item) {
    this.items.push(item);
  }

  remove (item) {
    this.items = this.items.filter(i => i !== item);
  }

  destroy () {
    this.items = [];
    // Q: destroy items? remove from DOM?
  }
}