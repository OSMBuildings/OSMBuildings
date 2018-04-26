// class Marker {
//
//   constructor (options = {}) {
//     const
//       sourceLink = options.sourceLink || 0,
//       offsetX = options.offsetX || 0,
//       offsetY = options.offsetY || 0;
//
//     if (isNaN(offsetX)) {
//       this.offsetX = 0;
//     } else {
//       this.offsetX = Math.round(offsetX);
//     }
//
//     if (isNaN(offsetY)) {
//       this.offsetY = 0;
//     } else {
//       this.offsetY = Math.round(offsetY);
//     }
//
//     if (!sourceLink) {
//       this.div = document.createElement('DIV');
//       const icon = this.createPlaceholderIcon();
//       this.div.appendChild(icon.documentElement);
//     } else {
//       this.div = document.createElement('IMG');
//       this.div.setAttribute('src', sourceLink);
//     }
//
//     this.div.style.position = 'absolute';
//
//     this.visibility = false;
//     this.screenPosition = { x: 0, y: 0 };
//     this.position = { latlng: { latitude: 0, longitude: 0 }, elevation: 0 };
//
//     APP.markers.add(this);
//   }
//
//   getPosition () {
//     return osmb.unproject(this.div.style.left.substring(0, this.div.style.left.length - 2), this.div.style.top.substring(0, this.div.style.top.length - 2));
//   }
//
//   setPosition (latlng, elevation = 0) {
//     if (isNaN(latlng.latitude || latlng.longitude || elevation)) {
//       return;
//     }
//     this.position = { latlng: latlng, elevation: elevation };
//   }
//
//   addEventListener (type, callback) {
//     this.div.addEventListener(type, callback, false);
//   }
//
//   removeEventListener (type, callback) {
//     this.div.removeEventListener(type, callback, false);
//   }
//
//   addToMap () {
//     let pos = osmb.project(this.position.latlng.latitude, this.position.latlng.longitude, this.position.elevation);
//     this.screenPosition = pos;
//
//     this.div.style.left = this.offsetX + Math.round(pos.x) + 'px';
//     this.div.style.top = this.offsetY + Math.round(pos.y) + 'px';
//     this.visibility = true;
//     APP.markers.div.appendChild(this.div);
//   }
//
//   removeFromMap () {
//     APP.markers.div.removeChild(this.div);
//     this.visibility = false;
//   }
//
//   createPlaceholderIcon () {
//     return new DOMParser().parseFromString(`
// <?xml version="1.0" encoding="utf-8"?>
// <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
// <svg version="1.1" xmlns:cc="http://creativecommons.org/ns#" x="0" y="0" width="30" height="30" viewBox="0 0 15 15">
// <path d="M7.5,0C5.0676,0,2.2297,1.4865,2.2297,5.2703 C2.2297,7.8378,6.2838,13.5135,7.5,15c1.0811-1.4865,5.2703-7.027,5.2703-9.7297C12.7703,1.4865,9.9324,0,7.5,0z"/>
// </svg>`, 'image/svg+xml');
//   }
//
//   remove () {
//     APP.markers.items.forEach(item => {
//       if (item.div === this.div && this.visibility) {
//         APP.markers.div.removeChild(this.div);
//       }
//     });
//
//     APP.markers.remove(this);
//   }
// }
