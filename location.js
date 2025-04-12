const LOCATION_WIDTH = 160; //px
const LOCATION_HEIGHT = 224; //px
const LOCATION_GAP = 75; //px
const LOCATION_ZOOMS = [0.3, 0.39, 0.5, 0.65, 0.85, 1.1, 1.5];
const LOCATION_ZOOM_DEFAULT = 3; // index

class Location {
  // MAP
  static get window() {
    return $("#location-window");
  }
  static get root() {
    return $("#location-position");
  }

  static #mapOffsetX = 0;
  static #mapOffsetY = 0;
  static setMapOffset(x, y) {
    x = Number.isNaN(x) ? this.#mapOffsetX : x;
    y = Number.isNaN(y) ? this.#mapOffsetY : y;
    this.#mapOffsetX = x;
    this.#mapOffsetY = y;
    this.window
      .css("--local-x", `${this.#mapOffsetX}px`)
      .css("--local-y", `${this.#mapOffsetY}px`);
  }
  static adjustMapOffset(x, y) {
    const zoom = LOCATION_ZOOMS[this.#zoomIndex];
    this.setMapOffset(this.#mapOffsetX + x / zoom, this.#mapOffsetY + y / zoom);
    if (x != 0 || y != 0) {
      $("#map-reset").attr("disabled", false);
    }
  }
  static resetMapOffset(movePeriod) {
    this.setMapOffset(0, 0, movePeriod);
    $("#map-reset").attr(
      "disabled",
      !this.#currentLocation || this.#currentLocation.pos == [0, 0]
    );
  }
  static focusMapOffsetCurrentLocation() {
    if (this.#currentLocation) {
      this.focusMapOffsetToLocation(this.getCurrentLocation());
      $("#map-reset").attr("disabled", true);
    } else {
      this.resetMapOffset();
    }
  }
  static focusMapOffsetToLocation(location) {
    const [dx, dy] = location.pos;
    this.focusMapOffsetToLocationPosition(dx, dy);
  }
  static focusMapOffsetToLocationPosition(x, y) {
    this.setMapOffset(-this.xCoordToPos(x), -this.yCoordToPos(y));
  }

  static #zoomIndex = LOCATION_ZOOM_DEFAULT;
  static setZoomIndex(value) {
    this.#zoomIndex = Math.min(Math.max(value, 0), LOCATION_ZOOMS.length - 1);
    this.window.css("--zoom", LOCATION_ZOOMS[this.#zoomIndex]);
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

  // STATIC
  static instances = [];
  static #idToInstance = {};
  static #nextId = 0;
  static #currentLocation = null;

  static getCurrentLocation() {
    return this.#currentLocation;
  }
  static getInstance(id) {
    return this.#idToInstance[id];
  }

  static getValidDestinations() {
    return this.instances.filter((location) =>
      location.#jObj.hasClass("valid-destination")
    );
  }

  static #coordToInstance = {};
  static recordLocationByPosition(instance) {
    this.#coordToInstance[instance.x * 10000 + instance.y] = instance;
  }
  static getLocationAtPosition(x, y) {
    return this.#coordToInstance[x * 10000 + y];
  }

  static recalculatePlayerDistance() {
    // Reset all to -1
    this.instances.forEach((location) => {
      location.#playerDistance = -1;
    });
    // BFS
    let currentLayer = [this.getCurrentLocation()];
    let distance = 0;
    while (currentLayer.length) {
      const copy = currentLayer.filter(
        (location) => location.#playerDistance == -1
      );
      currentLayer = [];
      for (const location of copy) {
        location.#playerDistance = distance;
        for (const neighbour of location.#neighbours) {
          currentLayer.push(neighbour);
        }
      }
      distance += 1;
    }
  }

  // Deletes all neighbour relations, hosted enemies, and the location jObj#
  // Does not update player distance
  static remove(location, force = false) {
    if (location == this.getCurrentLocation() && !force) {
      throw new Error("Attmpted to delete current location!");
    }
    while (location.#neighbours.length > 0) {
      location.removeNeighbour(location.#neighbours[0]);
    }
    while (location.#enemies.length > 0) {
      location.#enemies[0].remove();
    }
    location.#jObj.remove();
    const index = this.instances.indexOf(location);
    if (index >= 0) {
      this.instances.splice(index, 1);
    }
    if (this.#coordToInstance[location.x * 10000 + location.y] == location) {
      delete this.#coordToInstance[location.x * 10000 + location.y];
    }
  }

  // Remove all existing locations
  static deleteState() {
    while (this.instances.length > 0) {
      this.remove(this.instances[0], true);
    }
    this.#idToInstance = {};
    this.#nextId = 0;
    // This shouldn't be necessary but until I work out why these aren't getting cleaned up properly this will ensure they do
    $(".location-connector").remove();
  }

  // SERIALISATION
  static serialise() {
    const locations = this.instances.map((location) => {
      return {
        id: location.id,
        cardId: location.cardData.id,
        x: location.x,
        y: location.y,
        playerDistance: location.playerDistance,
        clues: location.clues,
        doom: location.doom,
        neighbours: location.#neighbours.map((neighbour) => neighbour.id),
      };
    });
    return {
      current: this.getCurrentLocation().id,
      nextId: this.#nextId,
      locations: locations,
    };
  }

  static deserialise(json) {
    // Remove all existing locations
    this.deleteState();

    // Create new locations from serialised data
    json.locations.forEach((data) => {
      const location = new Location(
        CardData.getCard(data.cardId),
        data.x,
        data.y,
        false,
        data
      );
    });
    this.#nextId = json.nextId;

    // Create connections
    json.locations.forEach((data) => {
      const location = this.getInstance(data.id);
      data.neighbours.forEach((neighbourID) => {
        location.addNeighbour(this.getInstance(neighbourID));
      });
    });

    // Set current location
    this.getInstance(json.current).setCurrentLocation();
  }

  // INSTANCE
  #id = -1;
  #cardData;
  #x = 0;
  #y = 0;
  #playerDistance = -1; // Whenever the player moves, recalculate (used for hunter enemies)

  #clues = 0;
  #doom = 0;

  #neighbours = [];
  #connections = {};

  #enemies = [];

  #jObj = null;
  #jClues = null;
  #jDoom = null;

  constructor(cardData, x, y, doAnimate = true, data = null) {
    this.#id = data && data.id ? data.id : Location.#nextId++;
    this.#cardData = cardData;
    this.#x = x;
    this.#y = y;
    Location.#idToInstance[this.#id] = this;
    Location.instances.push(this);
    Location.recordLocationByPosition(this);

    let jObj = $(`
      <div class="location-container ${doAnimate ? "transition-in" : ""}">
        <div class="card-image-container h-100">
          <img src="" class="location-image card-image" onmousedown="event.preventDefault()" />
          <div class="card-text"></div>
        </div>
        <div class="hosted-counters">
          <div class="clues shake-counter"></div>
          <div class="doom shake-counter"></div>
        </div>
      </div>`);
    this.#jObj = jObj;
    jObj.data("location-id", this.#id);
    jObj.data("card-id", this.#cardData.id);
    Location.root.append(jObj);
    this.setPos(x, y);

    // Animate the background colour of the location (needed to obscure connections)
    if (doAnimate) {
      setTimeout(function () {
        jObj.removeClass("transition-in");
      }, 100);
    }

    this.#jClues = this.#jObj.find(".clues").hide();
    this.#jDoom = this.#jObj.find(".doom").hide();

    const placeCounters = function () {
      instance.setClues(
        data && Number.isInteger(data.clues) ? data.clues : cardData.clues
      );
      instance.setDoom(data && Number.isInteger(data.doom) ? data.doom : 0); // Theoretically causes async issues, but this should never advance the agenda
    };

    // Place counters after the intro animation
    const instance = this;
    if (doAnimate) {
      setTimeout(placeCounters, 2000);
    } else {
      placeCounters();
    }

    // Animate the location
    Cards.flip(jObj.find(".card-image-container"), cardData, doAnimate);
  }

  get id() {
    return this.#id;
  }
  get cardData() {
    return this.#cardData;
  }

  get shroud() {
    return this.#cardData.shroud;
  }
  get clues() {
    return this.#clues;
  }
  get doom() {
    return this.#doom;
  }

  get playerDistance() {
    return this.#playerDistance;
  }

  get selectable() {
    this.#jObj.hasClass("selectable");
    return this;
  }
  set selectable(value) {
    if (value) {
      this.#jObj.addClass("selectable");
    } else {
      this.#jObj.removeClass("selectable");
    }
    return this;
  }

  get neighbours() {
    return this.#neighbours.filter(() => true);
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
      animate(jClues, 500);
    }
    this.#clues = value;
    return this;
  }
  addClues(number) {
    if (this.#clues + number < 0) {
      this.setClues(0);
      return false;
    }
    this.setClues(this.#clues + number);
    return true;
  }

  async setDoom(value, doAnimate = true) {
    if (value == 0) {
      this.#jDoom.hide();
    } else {
      this.#jDoom.show();
    }
    let jDoom = this.#jDoom;
    jDoom.html(value);
    if (value != this.#doom && doAnimate) {
      animate(jDoom, 500);
    }
    if (this.#doom < value) {
      await Broadcast.signal("onDoomPlaced", {
        doom: value,
        card: this,
        cardData: this.cardData,
      });
    }
    this.#doom = value;
    return this;
  }
  async addDoom(number) {
    if (this.#doom + number < 0) {
      await this.setDoom(0);
      return false;
    }
    await this.setDoom(this.#doom + number);
    return true;
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
  get x() {
    return this.#x;
  }
  get y() {
    return this.#y;
  }

  calculateValidLocations() {
    $(".location-container").removeClass("valid-destination");
    this.#neighbours.forEach((location) => {
      location.#jObj.addClass("valid-destination");
    });
    $(".location-connector").removeClass("valid-connection");
    Object.keys(this.#connections).forEach((key) =>
      this.#connections[key].addClass("valid-connection")
    );
  }

  setCurrentLocation(firstTime = false) {
    // Commenting this out because we need to reset the current location as the current location when spawning the boss because ????
    // if (Location.#currentLocation == this) {
    //   return this;
    // }
    if (Location.#currentLocation) {
      Location.#currentLocation.#jObj.removeClass("current-location");
    }
    Location.#currentLocation = this;
    this.#jObj.addClass("current-location");

    // Reassign valid destinations
    this.calculateValidLocations();

    // Move the current-location identifier
    $("#current-location-marker")
      .css("--x-pos", `${Location.xCoordToPos(this.#x)}px`)
      .css("--y-pos", `${Location.yCoordToPos(this.#y)}px`);
    $(".location-container").unbind("mouseenter mouseleave");
    this.#jObj.hover(
      function () {
        $("#current-location-marker").addClass("hover");
      },
      function () {
        $("#current-location-marker").removeClass("hover");
      }
    );
    if (!firstTime && this.#jObj.is(":hover")) {
      // This location is already being hovered
      $("#current-location-marker").addClass("hover");
    }
    $("#current-location-marker").addClass("moving");
    setTimeout(function () {
      $("#current-location-marker").removeClass("moving");
    }, 300);

    // Move camera to new location
    Location.focusMapOffsetCurrentLocation();

    // Update UI buttons
    $("#map-reset").attr("disabled", false);
    UiMode.setFlag("can-investigate", this.#clues > 0);

    // Recalculate player distance
    Location.recalculatePlayerDistance();

    return this;
  }

  // Does not recalculate player distance
  // Assumes all connections are bidirectional
  addNeighbour(neighbour) {
    if (!neighbour || this.#neighbours.includes(neighbour)) {
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

    if (Location.#currentLocation == this) {
      jLine.addClass("valid-connection");
      neighbour.#jObj.addClass("valid-destination");
    } else if (Location.#currentLocation == neighbour) {
      jLine.addClass("valid-connection");
      this.#jObj.addClass("valid-destination");
    }

    return this;
  }

  // Does not recalculate player distance
  removeNeighbour(neighbour) {
    // Remove neighbour relation
    let index = this.#neighbours.indexOf(neighbour);
    if (index > -1) {
      this.#neighbours.splice(index, 1);
    }
    index = neighbour.#neighbours.indexOf(this);
    if (index > -1) {
      neighbour.#neighbours.splice(index, 1);
    }

    // Remove connection
    const connection = this.#connections[neighbour.#id];
    delete this.#connections[neighbour.#id];
    delete neighbour.#connections[this.#id];

    // Remove connection jObj
    if (connection) {
      connection.remove();
    }

    this.calculateValidLocations();
    return this;
  }

  // These do not affect the enemies, they are just for logging them at locations
  addEnemy(enemy) {
    if (this.#enemies.includes(enemy)) {
      return false;
    }
    if (this.#enemies.length == 0) {
      setTimeout(() => {
        if (this.#enemies.length > 0) {
          this.cover();
        }
      }, 250); // Timing chosen based on the enemy movement speed of 0.2s
    }
    this.#enemies.push(enemy);
    this.setEnemyIndices();
    return true;
  }
  removeEnemy(enemy) {
    const index = this.#enemies.indexOf(enemy);
    if (index >= 0) {
      this.#enemies.splice(index, 1);
      this.setEnemyIndices();
      if (this.#enemies.length == 0) {
        this.uncover();
      }
      return true;
    }
    return false;
  }

  // Repositions each enemy so they don't fully cover each other
  setEnemyIndices() {
    this.#enemies.forEach(function (enemy, i, enemies) {
      enemy.setOffsetIndex(i, enemies.length);
    });
  }

  setCard(cardData, doAnimate = true, fast = true) {
    this.#cardData = cardData;
    this.#jObj.data("card-id", cardData.id);
    Cards.flip(
      this.#jObj.find(".card-image-container"),
      cardData,
      doAnimate,
      fast
    );
  }

  // Moves hosted counters out of the way of hosted enemies
  cover() {
    this.#jObj.find(".hosted-counters").addClass("covered");
  }
  uncover() {
    this.#jObj.find(".hosted-counters").removeClass("covered");
  }

  click(func) {
    this.#jObj.click(func);
    return this;
  }
  removeClick() {
    this.#jObj.off("click");
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
  $("body").mouseup(function () {
    isDraggingMap = false;
    Location.root.removeClass("dragged");
  });
  Location.window
    .mousedown(function (e) {
      isDraggingMap = true;
      Location.root.addClass("dragged");
      mapMouseX = e.pageX;
      mapMouseY = e.pageY;
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
