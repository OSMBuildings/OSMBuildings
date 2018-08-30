
/**
 * @private
 */
function add2 (a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

/**
 * @private
 */
function mul2scalar (a, f) {
  return [a[0] * f, a[1] * f];
}

/**
 * @private
 */
function getEventXY (e) {
  const el = e.target;
  const box = el.getBoundingClientRect();
  return { x: e.x - box.left, y: e.y - box.top };
}

/**
 * @private
 */
function addListener (target, type, fn) {
  target.addEventListener(type, fn, false);
}


class Events {

  /**
   * @param container {HTMLElement} DOM element for local pointer events.
   */
  constructor (container) {
    this.listeners = {};
    this.isDisabled = false;

    this.prevX = 0;
    this.prevY = 0;
    this.startZoom = 0;
    this.prevRotation = 0;
    this.prevTilt = 0;
    this.startDist = 0;
    this.startAngle = 0;
    this.button = null;

    this.addAllListeners(container);
  }

  addAllListeners (container) {
    const doc = window.document;

    if ('ontouchstart' in window) {
      addListener(container, 'touchstart', e => {
        this.onTouchStart(e);
      });

      addListener(doc, 'touchmove', e => {
        this.onTouchMoveDocument(e);
      });
      addListener(container, 'touchmove', e => {
        this.onTouchMove(e);
      });
      addListener(doc, 'touchend', e => {
        this.onTouchEndDocument(e);
      });
      addListener(doc, 'gesturechange', e => {
        this.onGestureChangeDocument(e);
      });
    } else {
      addListener(container, 'mousedown', e => {
        this.onMouseDown(e);
      });
      addListener(doc, 'mousemove', e => {
        this.onMouseMoveDocument(e);
      });
      addListener(container, 'mousemove', e => {
        this.onMouseMove(e);
      });
      addListener(doc, 'mouseup', e => {
        this.onMouseUpDocument(e);
      });
      addListener(container, 'mouseup', e => {
        this.onMouseUp(e);
      });
      addListener(container, 'dblclick', e => {
        this.onDoubleClick(e);
      });
      addListener(container, 'mousewheel', e => {
        this.onMouseWheel(e);
      });
      addListener(container, 'DOMMouseScroll', e => {
        this.onMouseWheel(e);
      });
      addListener(container, 'contextmenu', e => {
        this.onContextMenu(e);
      });
    }

    let resizeTimer;
    addListener(window, 'resize', e => {
      if (resizeTimer) {
        return;
      }
      resizeTimer = setTimeout(() => {
        resizeTimer = null;
        APP.setSize(APP.container.offsetWidth, APP.container.offsetHeight);
      }, 250);
    });
  }

  cancelEvent (e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    //if (e.stopPropagation) {
    //  e.stopPropagation();
    //}
    e.returnValue = false;
  }

  onDoubleClick (e) {
    APP.view.speedUp();
    this.cancelEvent(e);

    const pos = getEventXY(e);
    this.emit('doubleclick', { x: pos.x, y: pos.y });

    if (!this.isDisabled) {
      APP.setZoom(APP.zoom + 1, e);
    }
  }

  onMouseDown (e) {
    APP.view.speedUp();
    this.cancelEvent(e);

    this.startZoom = APP.zoom;
    this.prevRotation = APP.rotation;
    this.prevTilt = APP.tilt;

    this.prevX = e.clientX;
    this.prevY = e.clientY;
    this.isClick = true;

    if (((e.buttons === 1 || e.button === 0) && e.altKey) || e.buttons === 2 || e.button === 2) {
      this.button = 2;
    } else if (e.buttons === 1 || e.button === 0) {
      this.button = 0;
    }

    const pos = getEventXY(e);
    this.emit('pointerdown', { x: pos.x, y: pos.y, button: this.button });
  }

  onMouseMoveDocument (e) {
    // detect if it is really a move after some tolerance
    if (this.isClick) {
      const
        dx = e.clientX-this.prevX,
        dy = e.clientY-this.prevY;
      this.isClick = (dx*dx+dy*dy < 15);
    }

    if (this.button === 0) {
      APP.view.speedUp(); // do it here because no button means the event is not related to us
      this.moveMap(e);
    } else if (this.button === 2) {
      APP.view.speedUp(); // do it here because no button means the event is not related to us
      this.rotateMap(e);
    }

    this.prevX = e.clientX;
    this.prevY = e.clientY;
  }

  onMouseMove (e) {
    const pos = getEventXY(e);
    this.emit('pointermove', pos);
  }

  onMouseUpDocument (e) {
    if (this.button === 0) {
      this.moveMap(e);
      this.button = null;
    } else if (this.button === 2) {
      this.rotateMap(e);
      this.button = null;
    }
  }

  onMouseUp (e) {
    if (this.isClick) {
      const pos = getEventXY(e);
      APP.view.Picking.getTarget(pos.x, pos.y, target => {
        this.emit('pointerup', { features: target.features, marker: target.marker });
      });
    }
  }

  onMouseWheel (e) {
    APP.view.speedUp();
    this.cancelEvent(e);

    let delta = 0;
    if (e.wheelDeltaY) {
      delta = e.wheelDeltaY;
    } else if (e.wheelDelta) {
      delta = e.wheelDelta;
    } else if (e.detail) {
      delta = -e.detail;
    }

    if (!this.isDisabled) {
      const adjust = 0.2 * (delta > 0 ? 1 : delta < 0 ? -1 : 0);
      APP.setZoom(APP.zoom + adjust, e);
    }
  }

  onContextMenu (e) {
    this.cancelEvent(e);
  }

  //***************************************************************************

  moveMap (e) {
    if (this.isDisabled) {
      return;
    }

    // FIXME: make movement exact
    // the constant 0.86 was chosen experimentally for the map movement to be
    // "pinned" to the cursor movement when the map is shown top-down

    const
      scale = 0.86 * Math.pow(2, -APP.zoom),
      lonScale = 1 / Math.cos(APP.position.latitude / 180 * Math.PI),
      dx = e.clientX - this.prevX,
      dy = e.clientY - this.prevY,
      angle = APP.rotation * Math.PI / 180,
      vRight = [Math.cos(angle), Math.sin(angle)],
      vForward = [Math.cos(angle - Math.PI / 2), Math.sin(angle - Math.PI / 2)],
      dir = add2(mul2scalar(vRight, dx), mul2scalar(vForward, -dy));

    const newPosition = {
      longitude: APP.position.longitude - dir[0] * scale * lonScale,
      latitude: APP.position.latitude + dir[1] * scale
    };

    APP.setPosition(newPosition);
    this.emit('move', newPosition);
  }

  rotateMap (e) {
    if (this.isDisabled) {
      return;
    }

    this.prevRotation += (e.clientX - this.prevX) * (360 / window.innerWidth);
    this.prevTilt -= (e.clientY - this.prevY) * (360 / window.innerHeight);
    APP.setRotation(this.prevRotation);
    APP.setTilt(this.prevTilt);
  }

  emitGestureChange (e) {
    const
      t1 = e.touches[0],
      t2 = e.touches[1],
      dx = t1.clientX - t2.clientX,
      dy = t1.clientY - t2.clientY,
      dist = dx * dx + dy * dy,
      angle = Math.atan2(dy, dx);

    this.onGestureChangeDocument({ rotation: ((angle - this.startAngle) * (180 / Math.PI)) % 360, scale: Math.sqrt(dist / this.startDist) });
  }

  //***************************************************************************

  onTouchStart (e) {
    APP.view.speedUp();
    this.cancelEvent(e);

    this.button = 0;
    this.isClick = true;

    const t1 = e.touches[0];

    // gesture polyfill adapted from https://raw.githubusercontent.com/seznam/JAK/master/lib/polyfills/gesturechange.js
    // MIT License
    if (e.touches.length === 2 && !('ongesturechange' in window)) {
      const t2 = e.touches[1];
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      this.startDist = dx * dx + dy * dy;
      this.startAngle = Math.atan2(dy, dx);
    }

    this.startZoom = APP.zoom;
    this.prevRotation = APP.rotation;
    this.prevTilt = APP.tilt;

    this.prevX = t1.clientX;
    this.prevY = t1.clientY;

    this.emit('pointerdown', { x: e.x, y: e.y, button: 0 });
  }

  onTouchMoveDocument (e) {
    if (this.button === null) {
      return;
    }

    APP.view.speedUp();

    const t1 = e.touches[0];

    // detect if it is really a move after some tolerance
    if (this.isClick) {
      const
        dx = t1.clientX-this.prevX,
        dy = t1.clientY-this.prevY;
      this.isClick = (dx*dx+dy*dy < 15);
    }
    
    if (e.touches.length > 1) {
      APP.setTilt(this.prevTilt + (this.prevY - t1.clientY) * (360 / window.innerHeight));
      this.prevTilt = APP.tilt;
      if (!('ongesturechange' in window)) {
        this.emitGestureChange(e);
      }
    } else {
      this.moveMap(t1);
    }
    
    this.prevX = t1.clientX;
    this.prevY = t1.clientY;
  }

  onTouchMove (e) {
    if (e.touches.length === 1) {
      const pos = getEventXY(e.touches[0]);
      this.emit('pointermove', { x: pos.x, y: pos.y, button: 0 });
    }
  }

  onTouchEndDocument (e) {
    if (this.button === null) {
      return;
    }

    const t1 = e.touches[0];

    if (e.touches.length === 0) {
      this.button = null;

      if (!this.isClick) {
        this.emit('pointerup', {});
      } else {
        const pos = getEventXY(e);
        APP.view.Picking.getTarget(pos.x, pos.y, target => {
          this.emit('pointerup', { features: target.features, marker: target.marker });
        });
      }

    } else if (e.touches.length === 1) {
      // There is one touch currently on the surface => gesture ended. Prepare for continued single touch move
      this.prevX = t1.clientX;
      this.prevY = t1.clientY;
    }
  }

  onGestureChangeDocument (e) {
    if (this.button === null) {
      return;
    }

    APP.view.speedUp();
    this.cancelEvent(e);

    if (!this.isDisabled) {
      APP.setZoom(this.startZoom + (e.scale - 1));
      APP.setRotation(this.prevRotation - e.rotation);
    }

    this.emit('gesture', e);
  }

  //***************************************************************************

  on (type, fn) {
    (this.listeners[type] || (this.listeners[type] = [])).push(fn);
  }

  off (type, fn) {
    this.listeners[type] = (this.listeners[type] || []).filter(item => item !== fn);
  }

  emit (type, payload) {
    if (this.listeners[type] === undefined) {
      return;
    }

    setTimeout(() => {
      this.listeners[type].forEach(listener => listener(payload));
    }, 0);
  }

  destroy() {
    // TODO: remove all DOM listeners
    this.listeners = {};
  }
}
