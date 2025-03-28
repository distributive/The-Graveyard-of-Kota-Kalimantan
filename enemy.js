class Enemy {
  // STATIC
  static instances = [];

  static #nextId = 0;
  static #idToInstance = {};

  static async spawn(cardData, location, data) {
    const enemy = new Enemy(cardData, !data, data);
    await Broadcast.signal("onEnemySpawns", { enemy: this });
    await enemy.setLocation(
      location ? location : Location.getCurrentLocation(),
      !data
    );
    return enemy;
  }

  static getInstance(id) {
    return this.#idToInstance[id];
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
  static getAttackingEnemies() {
    // Enemies that are engaged and ready
    const localEnemies = this.getEnemiesAtCurrentLocation();
    return localEnemies.filter((enemy) => enemy.engaged && !enemy.exhausted);
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
    for (const enemy of this.getAttackingEnemies()) {
      await enemy.attack();
    }
  }

  // Move all hunters towards the player
  static async moveHunters() {
    for (const enemy of this.instances.filter(
      (enemy) => !enemy.exhausted && enemy.cardData.isHunter
    )) {
      let distance = enemy.#currentLocation.playerDistance;
      let moves = 1; //enemy.cardData == EnemyHantu ? 2 : 1;
      while (moves > 0) {
        if (distance > 0) {
          const directions = enemy.#currentLocation.neighbours.filter(
            (location) => location.playerDistance < distance
          );
          if (directions.length) {
            await enemy.moveTo(randomElement(directions));
          }
          moves--;
          distance = enemy.#currentLocation.playerDistance;
          await wait(500);
        } else {
          if (!enemy.engaged) {
            Alert.send(
              `You have been engaged by ${enemy.cardData.title}!`,
              ALERT_WARNING
            );
            await enemy.engage();
            await wait(500);
          }
          moves = 0;
        }
      }
    }
  }

  static async readyAll() {
    for (const enemy of this.instances) {
      const wasExhausted = enemy.exhausted;
      enemy.exhausted = false;
      if (wasExhausted && enemy.location == Location.getCurrentLocation()) {
        await enemy.engage();
      }
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
      target = enemy.strength;
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
      canCancel: canCancel,
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
      target: enemy.link,
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
    if (this.getAttackingEnemies().length == 0) {
      return;
    }
    Alert.send(
      "You have invoked an attack of opportunity: all enemies engaged with you will attack.",
      ALERT_DANGER
    );
    await this.engagedEnemiesAttack();
  }

  // Confirm with the player if they want to perform the current action if it would trigger an attack of opportunity
  static showAttackOfOpportunityWarning = true; // Intended to reset on refresh
  static async confirmAttackOfOpportunity() {
    if (
      !this.showAttackOfOpportunityWarning ||
      this.getAttackingEnemies().length == 0
    ) {
      return true;
    }
    const modal = new Modal({
      header: "Attack of opportunity",
      body: "Performing this action will trigger an attack of opportunity: before it resolves each unexhausted enemy engaged with you will attack.<br><br>Any action that does not directly interact with an enemy will trigger an attack of opportunity.<br><br>Do you wish to continue?",
      options: [new Option("", "Continue"), new Option("cancel", "Cancel")],
      checkboxes: [new Option("noWarn", "Don't show again")],
      allowKeyboard: false,
      size: "md",
    });
    const { option, checkboxes } = await modal.display();
    Modal.hide();
    if (checkboxes.noWarn) {
      this.showAttackOfOpportunityWarning = false;
    }
    return option != "cancel";
  }

  // Moves all engaged enemies to the current location
  static async moveEngagedEnemies() {
    for (const enemy of this.instances) {
      if (enemy.engaged) {
        await enemy.moveTo(Location.getCurrentLocation());
      }
    }
  }

  // Remove all existing enemies
  static deleteState() {
    this.instances.forEach((enemy) => enemy.remove());
    this.instances = [];
    this.#idToInstance = {};
    this.#nextId = 0;
    // For safety
    $(".enemy-container").remove();
  }

  // SERIALISATION
  static serialise() {
    const enemies = this.instances.map((enemy) => {
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
    return {
      nextId: this.#nextId,
      enemies: enemies,
    };
  }

  static async deserialise(json) {
    this.#nextId = json.nextId;

    // Remove all existing enemies
    this.deleteState();

    // Create new enemies
    json.enemies.forEach((data) => {
      const location = Location.getInstance(data.location);
      this.spawn(CardData.getCard(data.id), location, data);
    });
  }

  // INSTANCE
  #id;
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

  // This does not set the location of the enemy, as that is async
  constructor(cardData, doAnimate = true, data) {
    this.#id = data && data.id ? data.id : Enemy.#nextId++;
    Enemy.#idToInstance[this.#id] = this;

    Enemy.instances.push(this);
    this.#cardData = cardData;

    this.#jObj = $(`
      <div class="enemy-container">
        <div class="card-image-container ${doAnimate ? "flipping" : ""} h-100">
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
    this.#jObj.data("enemy-id", this.#id);
    Cards.populateData(
      this.#jObj.find(".card-image-container"),
      this.#cardData,
      "9px"
    );
    this.updateStats();
    this.#jObj.data("card-id", cardData.id);
    Location.root.append(this.#jObj);

    if (doAnimate) {
      const jObj = this.#jObj;
      setTimeout(function () {
        jObj.find(".flipping").removeClass("flipping");
      }, 10);
    }

    this.#jDamage = this.#jObj.find(".damage");
    this.#jClues = this.#jObj.find(".clues");
    this.#jDoom = this.#jObj.find(".doom");
    this.setDamage(data && Number.isInteger(data.damage) ? data.damage : 0);
    this.setClues(data && Number.isInteger(data.clues) ? data.clues : 0);
    this.setDoom(data && Number.isInteger(data.doom) ? data.doom : 0); // Theoretically causes async issues, but this should never advance the agenda

    if (data) {
      if (data.engaged) {
        this.engage();
      } else {
        this.disengage();
      }
      if (data.exhausted) {
        this.exhausted = true;
      }
    }
  }

  get cardData() {
    return this.#cardData;
  }
  get health() {
    return this.cardData.health;
  }
  get strength() {
    return this.cardData.calculateStrength
      ? this.cardData.calculateStrength(this)
      : this.cardData.strength;
  }
  get link() {
    return this.cardData.calculateLink
      ? this.cardData.calculateLink(this)
      : this.cardData.link;
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

  updateStats() {
    const jStrength = this.#jObj.find(".card-text-strength");
    const jLink = this.#jObj.find(".card-text-link");

    jStrength.html(this.strength);
    jLink.html(this.link);

    if (this.strength > this.cardData.strength) {
      jStrength.addClass("buffed");
    } else {
      jStrength.removeClass("buffed");
    }
    if (this.strength < this.cardData.strength) {
      jStrength.addClass("nerfed");
    } else {
      jStrength.removeClass("nerfed");
    }

    if (this.link > this.cardData.link) {
      jLink.addClass("buffed");
    } else {
      jLink.removeClass("buffed");
    }
    if (this.link < this.cardData.link) {
      jLink.addClass("nerfed");
    } else {
      jLink.removeClass("nerfed");
    }
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
    const successful = await this.setLocation(location);
    if (successful) {
      await Broadcast.signal("onEnemyMoves", {
        enemy: this,
        fromLocation: oldLocation,
        toLocation: location,
      });
    }
  }

  async setLocation(location, canEngage = true) {
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
    if (canEngage && Location.getCurrentLocation() == location) {
      await this.engage();
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
      if (this.cardData.deathEffect) {
        Audio.playEffect(this.cardData.deathEffect);
      } else {
        Audio.playEffect(AUDIO_TRASH);
      }
      this.remove();
      await Broadcast.signal("onEnemyDies", { enemy: this });
      UiMode.setFlag("engaged", Enemy.getAttackingEnemies().length > 0); // The UI only cares if the enemies are ready
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
  async addDoom(value, doAnimate = true) {
    await this.setDoom(this.#doom + value, doAnimate);
  }

  // If not in the current location, move there (maybe this behaviour is not wanted)
  async engage() {
    if (this.#engaged) {
      return;
    }
    if (this.#currentLocation != Location.getCurrentLocation()) {
      await this.moveTo(Location.getCurrentLocation());
    }
    this.#engaged = true;
    this.#jObj.addClass("engaged");
    UiMode.setFlag("engaged", Enemy.getAttackingEnemies().length > 0); // The UI only cares if the enemies are ready
    await Broadcast.signal("onPlayerEngages", { enemy: this });
    return this;
  }

  // If the evasion was not as part of a skill test, results will be null
  async evade(results) {
    if (!results || results.success) {
      this.disengage();
      this.exhausted = true;
    }
    await Broadcast.signal("onPlayerEvades", {
      enemy: this,
      results: results,
    });
    if (!results || results.success) {
      Game.logTurnEvent("evaded");
    }
  }

  async disengage() {
    this.#engaged = false;
    this.#jObj.removeClass("engaged");
    UiMode.setFlag("engaged", Enemy.getAttackingEnemies().length > 0); // The UI only cares if the enemies are ready
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
    await UiMode.setMode(UIMODE_WAITING);
    if (this.cardData.attackEffect) {
      Audio.playEffect(this.cardData.attackEffect);
    } else {
      Audio.playEffect(AUDIO_ATTACK);
    }
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
