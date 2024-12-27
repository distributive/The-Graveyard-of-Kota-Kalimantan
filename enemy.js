const ENEMY_MODE_NONE = 0;
const ENEMY_MODE_ENGAGE = 1;
const ENEMY_MODE_FIGHT = 2;
const ENEMY_MODE_EVADE = 3;

///////////////////////////////////////////////////////////////////////////////

class Enemy {
  // STATIC
  static instances = [];
  static mode = ENEMY_MODE_NONE;

  static determineCanEngageFightEvade() {
    const [canEngage, canFight, canEvade] = this.canEngageFightEvade();
    UiMode.setFlag("can-engage", canEngage);
    UiMode.setFlag("can-fight", canFight);
    UiMode.setFlag("can-evade", canEvade);
  }
  static canEngageFightEvade() {
    const localEnemies = this.getEnemiesAtCurrentLocation();
    const engagedEnemies = localEnemies.filter((enemy) => enemy.engaged);
    const canEngage = engagedEnemies.length < localEnemies.length;
    const canFightEvade = engagedEnemies.length > 0;
    return [canEngage, canFightEvade, canFightEvade];
  }

  static getEnemiesAtCurrentLocation() {
    return this.getEnemiesAtLocation(Location.getCurrentLocation());
  }
  static getEnemiesAtLocation(location) {
    return this.instances.filter((enemy) => enemy.#currentLocation == location);
  }

  static actionEngage(callback) {
    // Determine if there are valid targets
    const [canEngage, canFight, canEvade] = this.canEngageFightEvade();
    if (!canEngage) {
      return false;
    }
    // Update UI/enemy modes
    UiMode.setFlag("can-cancel-engage", true);
    UiMode.uiMode = UIMODE_SELECT_ENEMY;
    this.mode = ENEMY_MODE_ENGAGE;
    // Make all valid targets selectable and set up their click callbacks
    const currentLocation = Location.getCurrentLocation();
    this.instances.forEach((enemy) => {
      enemy.selectable =
        enemy.#currentLocation == currentLocation && !enemy.engaged;
      if (enemy.selectable) {
        enemy.click(() => {
          enemy.engage();
          this.cancelAction();
          callback(true, enemy);
        });
      }
    });
  }

  static actionFight(callback) {
    // Determine if there are valid targets
    const [canEngage, canFight, canEvade] = this.canEngageFightEvade();
    if (!canFight) {
      return false;
    }
    // Update UI/enemy modes
    UiMode.setFlag("can-cancel-fight", true);
    UiMode.uiMode = UIMODE_SELECT_ENEMY;
    this.mode = ENEMY_MODE_FIGHT;
    // Make all valid targets selectable and set up their click callbacks
    const currentLocation = Location.getCurrentLocation();
    this.instances.forEach((enemy) => {
      enemy.selectable =
        enemy.#currentLocation == currentLocation && enemy.engaged;
      if (enemy.selectable) {
        enemy.click(() => {
          Chaos.runModal(
            "strength",
            3, // TODO - Set this to enemy strength
            false,
            "Fight!",
            `<p>If successful, you will do ${1} damage to this enemy.</p>`, // TODO
            function (result, token, value) {
              Modal.hide();
              if (result) {
                enemy.addDamage(1); // TODO
              }
              Enemy.cancelAction();
              callback(result, enemy);
            }
          );
        });
      }
    });
  }

  static actionEvade(callback) {
    // Determine if there are valid targets
    const [canEngage, canFight, canEvade] = this.canEngageFightEvade();
    if (!canEvade) {
      return false;
    }
    // Update UI/enemy modes
    UiMode.setFlag("can-cancel-evade", true);
    UiMode.uiMode = UIMODE_SELECT_ENEMY;
    this.mode = ENEMY_MODE_EVADE;
    // Make all valid targets selectable and set up their click callbacks
    const currentLocation = Location.getCurrentLocation();
    this.instances.forEach((enemy) => {
      enemy.selectable =
        enemy.#currentLocation == currentLocation && enemy.engaged;
      if (enemy.selectable) {
        enemy.click(() => {
          Chaos.runModal(
            "link",
            3, // TODO - Set this to enemy link
            false,
            "Evade!",
            `<p>If successful, you will evade this enemy.</p>`,
            function (result, token, value) {
              Modal.hide();
              if (result) {
                enemy.disengage();
              }
              Enemy.cancelAction();
              callback(result, enemy);
            }
          );
        });
      }
    });
  }

  static cancelAction() {
    // Relies on the calling function to reset the UI mode
    UiMode.setFlag("can-cancel-engage", false);
    UiMode.setFlag("can-cancel-fight", false);
    UiMode.setFlag("can-cancel-evade", false);
    this.mode = ENEMY_MODE_NONE;
    // Remove click callbacks
    $(".enemy-container").off("click");
  }

  // INSTANCE
  #jObj;
  #jDamage;
  #jClues;
  #jDoom;

  #currentLocation;
  #engaged = false;
  #damage;
  #clues;
  #doom;

  constructor(location) {
    Enemy.instances.push(this);

    this.#jObj = $(`
      <div class="enemy-container">
        <img src="img/card/enemyPlaceholder.png" class="enemy-image card-image" onmousedown="event.preventDefault()" />
        <div class="hosted-counters">
          <div class="damage shake-counter"></div>
          <div class="clues shake-counter"></div>
          <div class="doom shake-counter"></div>
        </div>
      </div>`);
    Location.root.append(this.#jObj);

    this.#jDamage = this.#jObj.find(".damage");
    this.#jClues = this.#jObj.find(".clues");
    this.#jDoom = this.#jObj.find(".doom");
    this.setDamage(0);
    this.setClues(0);
    this.setDoom(0);

    this.moveTo(location);
  }

  remove() {
    const index = Enemy.instances.indexOf(this);
    if (index >= 0) {
      Enemy.instances.splice(index, 1);
      Location.removeEnemy(this);
      return true;
    }
    return false;
  }

  moveTo(location) {
    if (this.#currentLocation) {
      this.#currentLocation.removeEnemy(this);
    }
    this.#currentLocation = location;
    this.#currentLocation.addEnemy(this);
    const [x, y] = location.pos;
    this.#jObj.css("--x-pos", `${Location.xCoordToPos(x)}px`);
    this.#jObj.css("--y-pos", `${Location.yCoordToPos(y)}px`);
  }

  // Ensures enemies at the same location don't fully overlap
  setOffsetIndex(index, length) {
    this.#jObj.css("--index", index);
    if (index == length - 1) {
      this.#jObj.find(".hosted-counters").removeClass("covered");
    } else {
      this.#jObj.find(".hosted-counters").addClass("covered");
    }
  }

  setDamage(value, doAnimate = true) {
    if (value == 0) {
      this.#jDamage.hide();
    } else {
      this.#jDamage.show();
    }
    let jDamage = this.#jDamage;
    jDamage.html(value);
    if (value != this.#damage && doAnimate) {
      jDamage.addClass("animate");
      setTimeout(function () {
        jDamage.removeClass("animate");
      }, 500);
    }
    this.#damage = value;
    return this;
  }
  addDamage(value, doAnimate = true) {
    this.setDamage(this.#damage + value, doAnimate);
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
  addClues(value, doAnimate = true) {
    this.setClues(this.#clues + value, doAnimate);
  }

  setDoom(value, doAnimate = true) {
    if (value == 0) {
      this.#jDoom.hide();
    } else {
      this.#jDoom.show();
    }
    let jDoom = this.#jDoom;
    jDoom.html(value);
    if (value != this.#doom && doAnimate) {
      jDoom.addClass("animate");
      setTimeout(function () {
        jDoom.removeClass("animate");
      }, 500);
    }
    this.#doom = value;
    return this;
  }
  addDoom(value, doAnimate = true) {
    this.setDoom(this.#doom + value, doAnimate);
  }

  get engaged() {
    return this.#engaged;
  }

  // if not in the current location, move there (maybe this behaviour is not wanted)
  engage() {
    if (this.#currentLocation != Location.getCurrentLocation()) {
      this.moveTo(Location.getCurrentLocation());
    }
    this.#engaged = true;
    this.#jObj.addClass("engaged");
    Enemy.determineCanEngageFightEvade();
    return this;
  }

  disengage() {
    this.#engaged = false;
    this.#jObj.removeClass("engaged");
    Enemy.determineCanEngageFightEvade();
    return this;
  }

  click(func) {
    this.#jObj.click(func);
  }
  removeClick() {
    this.#jObj.off("click");
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
}
