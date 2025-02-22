class Enemy {
  // STATIC
  static instances = [];

  static async spawn(cardData, location) {
    new Enemy(cardData, location);
    await Broadcast.signal("onEnemySpawns", { enemy: this });
  }

  static canEngageFightEvade() {
    const localEnemies = this.getEnemiesAtCurrentLocation();
    const engagedEnemies = this.getEngagedEnemies();
    const canEngage = engagedEnemies.length < localEnemies.length;
    const canFight = localEnemies.length > 0;
    const canEvade = engagedEnemies.length > 0;
    return [canEngage, canFight, canEvade];
  }

  static getEngagedEnemies() {
    const localEnemies = this.getEnemiesAtCurrentLocation();
    return localEnemies.filter((enemy) => enemy.engaged);
  }
  static getEnemiesAtLocation(location) {
    return this.instances.filter((enemy) => enemy.#currentLocation == location);
  }
  static getUnengagedEnemiesAtLocation(location) {
    return this.instances.filter(
      (enemy) => !enemy.engaged && enemy.#currentLocation == location
    );
  }
  static getUnengagedEnemiesAtCurrentLocation() {
    return this.getUnengagedEnemiesAtLocation(Location.getCurrentLocation());
  }
  static getEnemiesAtCurrentLocation() {
    return this.getEnemiesAtLocation(Location.getCurrentLocation());
  }

  static async engagedEnemiesAttack() {
    for (const enemy of this.getEngagedEnemies()) {
      await enemy.attack();
    }
  }

  // Move all hunters towards the player
  static async moveHunters() {
    for (const enemy of this.instances.filter(
      (enemy) => !enemy.exhausted && enemy.cardData.isHunter
    )) {
      const distance = enemy.#currentLocation.playerDistance;
      if (distance > 0) {
        const directions = enemy.#currentLocation.neighbours.filter(
          (location) => location.playerDistance < distance
        );
        if (directions.length) {
          await enemy.moveTo(randomElement(directions));
        }
      }
    }
  }

  static readyAll() {
    for (const enemy of this.instances) {
      enemy.exhausted = false;
    }
  }

  static async actionEngage(canCancel = true, costsClick = true) {
    // Determine if there are valid targets
    const [canEngage, canFight, canEvade] = this.canEngageFightEvade();
    if (!canEngage) {
      return {};
    }

    // Get selection
    await UiMode.setMode(UIMODE_SELECT_ENEMY, {
      validTargets: Enemy.getUnengagedEnemiesAtCurrentLocation(),
      canCancel: true,
      reason: "engage",
    });

    // Resolve effects
    if (UiMode.data.success) {
      if (costsClick) {
        await Stats.addClicks(-1);
      }
      await UiMode.data.selectedEnemy.engage();
      return { success: true, enemy: UiMode.data.selectedEnemy };
    } else {
      return { success: false };
    }
  }

  static async actionFight(data) {
    let {
      damage = 1,
      canCancel = true,
      costsClick = true,
      stat = "strength",
      base,
      target,
    } = data;

    // Determine if there are valid targets
    const [canEngage, canFight, canEvade] = this.canEngageFightEvade();
    if (!canFight) {
      return {};
    }

    // Get selection
    await UiMode.setMode(UIMODE_SELECT_ENEMY, {
      validTargets: Enemy.getEnemiesAtCurrentLocation(),
      canCancel: canCancel,
      reason: "fight",
    });
    if (!UiMode.data.success) {
      return;
    }
    const enemy = UiMode.data.selectedEnemy;

    // Set default target
    if (target == null) {
      target = enemy.cardData.strength;
    }

    // Exit early if cancelled
    if (!UiMode.data.success) {
      return { results: { success: false } };
    }

    // Engage the enemy if they are not already engaged
    if (!UiMode.data.selectedEnemy.engaged) {
      await UiMode.data.selectedEnemy.engage();
    }

    // Trigger events
    if (costsClick) {
      await Stats.addClicks(-1);
    }
    await Broadcast.signal("onPlayerAttackAttempt", {
      enemy: enemy,
      damage: damage,
    });

    // Run the modal
    const results = await Chaos.runModal({
      stat: stat,
      base: base,
      target: target,
      title: "Fight!",
      description: `<p>If successful, you will do ${damage} damage to this enemy.</p>`,
      forceOutcome: Tutorial.active ? "success" : null, // Always succeed during the tutorial
    });
    Modal.hide();

    // Apply effects/triggers
    await Broadcast.signal("onPlayerAttacks", {
      enemy: enemy,
      results: results,
      damage: damage,
    });
    if (results.success) {
      await enemy.addDamage(damage);
    }

    return { results: results, enemy: enemy };
  }

  static async actionEvade(data) {
    const { canCancel = true, costsClick = true } = data;
    // Determine if there are valid targets
    const [canEngage, canFight, canEvade] = this.canEngageFightEvade();
    if (!canEvade) {
      return false;
    }

    // Get selection
    await UiMode.setMode(UIMODE_SELECT_ENEMY, {
      validTargets: Enemy.getEngagedEnemies(),
      canCancel: true,
      reason: "evade",
    });
    const enemy = UiMode.data.selectedEnemy;

    // Exit early if cancelled
    if (!UiMode.data.success) {
      return { results: { success: false } };
    }

    // Trigger events
    if (costsClick) {
      await Stats.addClicks(-1);
    }
    await Broadcast.signal("onPlayerEvadeAttempt", {
      enemy: enemy,
    });

    // Run the modal
    const results = await Chaos.runModal({
      stat: "link",
      target: enemy.cardData.link,
      title: "Evade!",
      description: `<p>If successful, you will evade this enemy.</p>`,
      forceOutcome: Tutorial.active ? "success" : null, // Always succeed during the tutorial
    });
    Modal.hide();

    // Apply effects/triggers
    await enemy.evade(results);

    return { results: results, enemy: enemy };
  }

  // Call this whenever there should be an attack of opportunity
  // i.e. before any action that isn't fighting, evading, or parleying
  static async attackOfOpportunity() {
    if (this.getEngagedEnemies().length == 0) {
      return;
    }
    Alert.send(
      "You have invoked an attack of opportunity: all enemies engaged with you will attack.",
      ALERT_DANGER
    );
    await this.engagedEnemiesAttack();
  }

  // Moves all engaged enemies to the current location
  static async moveEngagedEnemies() {
    for (const enemy of this.instances) {
      if (enemy.engaged) {
        await enemy.moveTo(Location.getCurrentLocation());
      }
    }
  }

  // SERIALISATION
  static serialise() {
    return this.instances.map((enemy) => {
      return {
        id: enemy.cardData.id,
        damage: enemy.damage,
        clues: enemy.clues,
        doom: enemy.doom,
        engaged: enemy.engaged,
        exhausted: enemy.exhausted,
        location: enemy.location.id,
      };
    });
  }

  static async deserialise(json) {
    // Remove all existing enemies
    this.instances.forEach((enemy) => enemy.remove());
    // Create new enemies
    json.forEach((data) => {
      const enemy = new Enemy(
        CardData.getCard(data.id),
        Location.getInstance(data.location),
        data
      );
    });
  }

  // INSTANCE
  #cardData;

  #jObj;
  #jDamage;
  #jClues;
  #jDoom;

  #currentLocation;
  #engaged = false;
  #exhausted = false;
  #damage;
  #clues;
  #doom;

  constructor(cardData, location, data) {
    Enemy.instances.push(this);
    this.#cardData = cardData;

    this.#jObj = $(`
      <div class="enemy-container">
        <div class="card-image-container h-100">
          <img src="${
            this.#cardData.image
          }" class="enemy-image card-image" onmousedown="event.preventDefault()" />
        </div>
        <div class="enemy-outro-container h-100">
          <img class="enemy-outro h-100" src="img/card/trashedCardOutro.png" />
        </div>
        <div class="hosted-counters">
          <div class="damage shake-counter"></div>
          <div class="clues shake-counter"></div>
          <div class="doom shake-counter"></div>
        </div>
      </div>`);
    Cards.populateData(
      this.#jObj.find(".card-image-container"),
      this.#cardData,
      "9px"
    );
    this.#jObj.data("card-id", cardData.id);
    Location.root.append(this.#jObj);

    this.#jDamage = this.#jObj.find(".damage");
    this.#jClues = this.#jObj.find(".clues");
    this.#jDoom = this.#jObj.find(".doom");
    this.setDamage(data && Number.isInteger(data.damage) ? data.damage : 0);
    this.setClues(data && Number.isInteger(data.clues) ? data.clues : 0);
    this.setDoom(data && Number.isInteger(data.doom) ? data.doom : 0);

    if (data && data.engaged) {
      this.engage();
    }
    if (data && data.exhausted) {
      this.exhausted();
    }

    this.setLocation(location);
  }

  get cardData() {
    return this.#cardData;
  }
  get health() {
    return this.cardData.health;
  }

  get engaged() {
    return this.#engaged;
  }

  get damage() {
    return this.#damage;
  }
  get clues() {
    return this.#clues;
  }
  get doom() {
    return this.#doom;
  }

  remove() {
    const index = Enemy.instances.indexOf(this);
    if (index >= 0) {
      Enemy.instances.splice(index, 1);
      this.#currentLocation.removeEnemy(this);
      const jObj = this.#jObj;
      jObj.addClass("transition-out");
      setTimeout(function () {
        jObj.remove();
      }, 1000);
      return true;
    }
    return false;
  }

  async moveTo(location) {
    const oldLocation = this.#currentLocation;
    if (this.setLocation(location)) {
      await Broadcast.signal("onEnemyMoves", {
        enemy: this,
        fromLocation: oldLocation,
        toLocation: location,
      });
    }
  }

  setLocation(location) {
    if (location == this.#currentLocation) {
      return false;
    }
    if (this.#currentLocation) {
      this.#currentLocation.removeEnemy(this);
    }
    this.#currentLocation = location;
    this.#currentLocation.addEnemy(this);
    const [x, y] = location.pos;
    this.#jObj.css("--x-pos", `${Location.xCoordToPos(x)}px`);
    this.#jObj.css("--y-pos", `${Location.yCoordToPos(y)}px`);
    if (Location.getCurrentLocation() == location) {
      this.engage();
    }
    return true;
  }

  get location() {
    return this.#currentLocation;
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

  async setDamage(value, doAnimate = true) {
    if (value == 0 || value >= this.health) {
      this.#jDamage.hide();
    } else {
      this.#jDamage.show();
    }
    if (value < this.health) {
      let jDamage = this.#jDamage;
      jDamage.html(value);
      if (value != this.#damage && doAnimate) {
        animate(jDamage, 500);
      }
    } else {
      await Broadcast.signal("onEnemyDies", { enemy: this });
      this.remove();
      UiMode.setFlag("engaged", Enemy.getEngagedEnemies().length > 0);
    }
    this.#damage = value;
    return this;
  }
  async addDamage(value, doAnimate = true) {
    await this.setDamage(this.#damage + value, doAnimate);
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
      animate(jDoom, 500);
    }
    this.#doom = value;
    return this;
  }
  addDoom(value, doAnimate = true) {
    this.setDoom(this.#doom + value, doAnimate);
  }

  // if not in the current location, move there (maybe this behaviour is not wanted)
  async engage() {
    if (this.#engaged) {
      return;
    }
    if (this.#currentLocation != Location.getCurrentLocation()) {
      await this.moveTo(Location.getCurrentLocation());
    }
    await Broadcast.signal("onPlayerEngages", { enemy: this });
    this.#engaged = true;
    this.#jObj.addClass("engaged");
    UiMode.setFlag("engaged", true);
    return this;
  }

  // If the evasion was not as part of a skill test, results will be null
  async evade(results) {
    if (results.success) {
      this.disengage();
      this.exhausted = true;
    }
    await Broadcast.signal("onPlayerEvades", {
      enemy: this,
      results: results,
    });
    if (results.success) {
      Game.logTurnEvent("evaded");
    }
  }

  async disengage() {
    this.#engaged = false;
    this.#jObj.removeClass("engaged");
    UiMode.setFlag("engaged", Enemy.getEngagedEnemies().length > 0);
    return this;
  }

  get exhausted() {
    return this.#exhausted;
  }
  set exhausted(value) {
    this.#exhausted = value;
    if (value) {
      this.#jObj.addClass("tapped");
    } else {
      this.#jObj.removeClass("tapped");
    }
  }

  async attack() {
    this.#jObj.addClass("attacking");
    UiMode.setMode(UIMODE_WAITING);
    await wait(1000);
    await this.#cardData.attack(this);
    await Broadcast.signal("onEnemyAttacks", { enemy: this });
    this.#jObj.removeClass("attacking");
    await wait(1000);
  }

  click(func) {
    this.#jObj.click(func);
    return this;
  }
  removeClick() {
    this.#jObj.off("click");
    return this;
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
