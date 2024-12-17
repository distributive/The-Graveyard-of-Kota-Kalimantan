const LOCATION_WIDTH = 160; //px
const LOCATION_HEIGHT = 224; //px
const LOCATION_GAP = 40; //px
const LOCATION_ZOOMS = [0.3, 0.39, 0.5, 0.65, 0.85, 1.1, 1.5];
const LOCATION_ZOOM_DEFAULT = 2; // index

class Location {
  // STATIC
  static get window() {
    return $("#location-window");
  }
  static get root() {
    return $("#location-map");
  }

  static #mapOffsetX = 0;
  static #mapOffsetY = 0;
  static setMapOffset(x, y) {
    this.#mapOffsetX = Number.isNaN(x) ? this.#mapOffsetX : x;
    this.#mapOffsetY = Number.isNaN(y) ? this.#mapOffsetY : y;
    const root = this.root;
    root.css("--local-x", `${this.#mapOffsetX}px`);
    root.css("--local-y", `${this.#mapOffsetY}px`);
  }
  static adjustMapOffset(x, y) {
    this.setMapOffset(this.#mapOffsetX + x, this.#mapOffsetY + y);
    if (x != 0 || y != 0) {
      $("#map-reset").attr("disabled", false);
    }
  }
  static resetMapOffset() {
    const window = this.window;
    const x = window.innerWidth() / 2;
    const y = window.innerHeight() / 2;
    this.setMapOffset(x, y);
    $("#map-reset").attr(
      "disabled",
      !this.currentLocation || this.currentLocation.pos == [0, 0]
    );
  }
  static focusMapOffsetCurrentLocation() {
    if (!this.currentLocation) {
      return this.resetMapOffset();
    }
    const window = this.window;
    const x = window.innerWidth() / 2;
    const y = window.innerHeight() / 2;
    const [dx, dy] = this.currentLocation.pos;
    this.setMapOffset(
      x - this.xCoordToPos(dx) / 2,
      y - this.yCoordToPos(dy) / 2
    );
    $("#map-reset").attr("disabled", true);
  }

  static #zoomIndex = LOCATION_ZOOM_DEFAULT;
  static setZoomIndex(value) {
    this.#zoomIndex = Math.min(Math.max(value, 0), LOCATION_ZOOMS.length - 1);
    this.root.css("--zoom", LOCATION_ZOOMS[this.#zoomIndex]);
    $("#map-zoom-in").attr(
      "disabled",
      this.#zoomIndex == LOCATION_ZOOMS.length - 1
    );
    $("#map-zoom-out").attr("disabled", this.#zoomIndex == 0);
  }
  static adjustZoom(deltaIndex) {
    this.setZoomIndex(this.#zoomIndex + deltaIndex);
  }
  static resetZoom() {
    this.setZoomIndex(LOCATION_ZOOM_DEFAULT);
  }

  static xCoordToPos(x) {
    return x * (LOCATION_WIDTH + LOCATION_GAP);
  }
  static yCoordToPos(y) {
    return y * (LOCATION_HEIGHT + LOCATION_GAP);
  }

  static instances = [];
  static idToInstance = {};
  static currentLocation = null;
  static nextId = 0;

  static getInstance(id) {
    return this.idToInstance[id];
  }

  // INSTANCE
  #id = -1;
  #x = 0;
  #y = 0;
  #clues = 0;
  #neighbours = [];
  #connections = {};

  #jObj = null;
  #jClues = null;

  constructor(x, y) {
    this.#id = Location.nextId;
    Location.idToInstance[this.#id] = this;
    Location.nextId++;
    Location.instances.push(this);

    let jObj = $(`
      <div class="location-container">
        <img src="img/card/location.png" class="location-image card-image" onmousedown="event.preventDefault()" />
        <div class="location-clues shake-centered"></div>
      </div>`);
    this.#jObj = jObj;
    jObj.data("location-id", this.#id);
    Location.root.append(jObj);
    this.setPos(x, y);
    jObj.click(() => {
      if (UiMode.uiMode != UIMODE_MOVEMENT) {
        return;
      }
      if (jObj.hasClass("valid-destination")) {
        let id = jObj.data("location-id");
        let location = Location.getInstance(id);
        if (location) {
          location.setCurrentLocation();
        }
      }
    });

    this.#jClues = this.#jObj.find(".location-clues");
    this.setClues(0);
  }

  setClues(value, doAnimate = true) {
    if (value == 0) {
      this.#jClues.hide();
    } else {
      this.#jClues.show();
    }
    let jClues = this.#jClues;
    jClues.html(value);
    if (value != this.#clues && doAnimate) {
      jClues.addClass("animate");
      setTimeout(function () {
        jClues.removeClass("animate");
      }, 500);
    }
    this.#clues = value;
    return this;
  }

  setPos(x, y) {
    this.#x = x;
    this.#y = y;
    this.#jObj.css("--x-pos", `${Location.xCoordToPos(x)}px`);
    this.#jObj.css("--y-pos", `${Location.yCoordToPos(y)}px`);
    return this;
  }
  get pos() {
    return [this.#x, this.#y];
  }

  setCurrentLocation() {
    if (Location.currentLocation == this) {
      return this;
    }
    if (Location.currentLocation) {
      Location.currentLocation.#jObj.removeClass("current-location");
    }
    Location.currentLocation = this;
    this.#jObj.addClass("current-location");

    $(".location-container").removeClass("valid-destination");
    this.#neighbours.forEach((location) => {
      location.#jObj.addClass("valid-destination");
    });
    $(".location-connector").removeClass("valid-connection");
    Object.keys(this.#connections).forEach((key) =>
      this.#connections[key].addClass("valid-connection")
    );

    return this;
  }

  // assume all connections are bidirectional
  addNeighbour(neighbour) {
    if (this.#neighbours.includes(neighbour)) {
      return this;
    }
    this.#neighbours.push(neighbour);
    neighbour.#neighbours.push(this);

    let x0 = Location.xCoordToPos(this.#x);
    let y0 = Location.yCoordToPos(this.#y);
    let x1 = Location.xCoordToPos(neighbour.#x);
    let y1 = Location.yCoordToPos(neighbour.#y);
    let length = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
    let rotation = Math.atan2(neighbour.#y - this.#y, neighbour.#x - this.#x); //rad

    let jLine = $(`<div class="location-connector"></div>`);
    jLine.css("--mid-x", `${(x0 + x1) / 2}px`);
    jLine.css("--mid-y", `${(y0 + y1) / 2}px`);
    jLine.css("--length", `${length}px`);
    jLine.css("--rotation", `${rotation}rad`);
    Location.root.append(jLine);
    this.#connections[neighbour.#id] = jLine;
    neighbour.#connections[this.#id] = jLine;

    if (Location.currentLocation == this) {
      jLine.addClass("valid-connection");
      neighbour.#jObj.addClass("valid-destination");
    } else if (Location.currentLocation == neighbour) {
      jLine.addClass("valid-connection");
      this.#jObj.addClass("valid-destination");
    }

    return this;
  }

  set image(path) {}
}

///////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  let isHoveringMap = false;
  let isDraggingMap = false;
  let mapMouseX;
  let mapMouseY;
  Location.window
    .mousedown(function (e) {
      isDraggingMap = true;
      Location.root.addClass("dragged");
      mapMouseX = e.pageX;
      mapMouseY = e.pageY;
    })
    .mouseup(function () {
      isDraggingMap = false;
      Location.root.removeClass("dragged");
    })
    .mousemove(function (e) {
      if (isDraggingMap) {
        Location.adjustMapOffset(e.pageX - mapMouseX, e.pageY - mapMouseY);
        mapMouseX = e.pageX;
        mapMouseY = e.pageY;
      }
    })
    .mouseenter(function () {
      isHoveringMap = true;
    })
    .mouseleave(function () {
      isHoveringMap = false;
    });
  addEventListener("wheel", (e) => {
    if (isHoveringMap && e.deltaY != 0) {
      Location.adjustZoom(e.deltaY < 0 ? 1 : -1);
    }
  });

  $("#map-zoom-in").click((e) => {
    e.preventDefault();
    Location.adjustZoom(1);
  });
  $("#map-zoom-out").click((e) => {
    e.preventDefault();
    Location.adjustZoom(-1);
  });
  $("#map-reset").click((e) => {
    e.preventDefault();
    Location.focusMapOffsetCurrentLocation();
  });
});
