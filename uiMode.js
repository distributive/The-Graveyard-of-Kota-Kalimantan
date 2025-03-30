let uiMode_i = 0;
const UIMODE_NON_GAME = uiMode_i++;
const UIMODE_CORP_TURN = uiMode_i++;
const UIMODE_SELECT_ACTION = uiMode_i++;
const UIMODE_SELECT_LOCATION = uiMode_i++;
const UIMODE_SELECT_GRIP_CARD = uiMode_i++;
const UIMODE_SELECT_INSTALLED_CARD = uiMode_i++;
const UIMODE_ASSIGN_DAMAGE = uiMode_i++;
const UIMODE_SELECT_ENEMY = uiMode_i++;
const UIMODE_WAITING = uiMode_i++; // For misc pending interactions
const UIMODE_END_TURN = uiMode_i++;

///////////////////////////////////////////////////////////////////////////////

const UIMODE_TO_CLASS = {};
UIMODE_TO_CLASS[UIMODE_NON_GAME] = "uimode-non-game";
UIMODE_TO_CLASS[UIMODE_CORP_TURN] = "uimode-corp-turn";
UIMODE_TO_CLASS[UIMODE_SELECT_ACTION] = "uimode-select-action";
UIMODE_TO_CLASS[UIMODE_SELECT_LOCATION] = "uimode-select-location";
UIMODE_TO_CLASS[UIMODE_SELECT_GRIP_CARD] = "uimode-select-grip-card";
UIMODE_TO_CLASS[UIMODE_SELECT_INSTALLED_CARD] = "uimode-select-installed-card";
UIMODE_TO_CLASS[UIMODE_ASSIGN_DAMAGE] = "uimode-assign-damage";
UIMODE_TO_CLASS[UIMODE_SELECT_ENEMY] = "uimode-select-enemy";
UIMODE_TO_CLASS[UIMODE_WAITING] = "uimode-waiting";
UIMODE_TO_CLASS[UIMODE_END_TURN] = "uimode-end-turn";

///////////////////////////////////////////////////////////////////////////////

class UiModeDataError extends Error {
  static validate(mode, data, key) {
    if (!data || !data[key]) {
      throw new UiModeDataError(mode, key);
    }
  }

  constructor(mode) {
    super(`Entering UI mode '${mode}' with data.`);
    this.name = "UiModeDataError";
  }
}

///////////////////////////////////////////////////////////////////////////////

class UiMode {
  // Mode-specific data
  // This is set before each mode's enter function is called and not changed
  // until after their exit function is called
  static data = {};

  static #uiMode = UIMODE_NON_GAME;
  static #previousMode = this.#uiMode;
  static get uiMode() {
    return UiMode.#uiMode;
  }

  // The game should never be serialised while UiMode.data has data loaded, since that data cannot be easily serialised
  // The best way to ensure this is to only save between actions and at the start/end of each turn
  static serialise() {
    return {
      uiMode: this.#uiMode,
      prevMode: this.#previousMode,
    };
  }
  static async deserialise(json) {
    this.#previousMode = json.prevMode;
    await this.setMode(json.uiMode);
  }

  // Some modes serve a singular purpose and this function will maintain
  // control of the game state until that function is complete
  // This will never return values from those actions, but instead add them
  // to this.data
  // Changing the UI mode after these modes are entered is the source code's
  // responsibility
  // - UIMODE_SELECT_GRIP_CARD
  // - UIMODE_SELECT_INSTALLED_CARD
  // - UIMODE_ASSIGN_DAMAGE
  // - UIMODE_SELECT_ENEMY - TODO: move all cases to here
  static async setMode(mode, data) {
    $("#ui-mode").removeClass().addClass(UIMODE_TO_CLASS[mode]);

    switch (this.#uiMode) {
      case UIMODE_NON_GAME:
        await this.exitNonGame();
        break;
      case UIMODE_CORP_TURN:
        await this.exitCorpTurn();
        break;
      case UIMODE_SELECT_ACTION:
        await this.exitSelectAction();
        break;
      case UIMODE_SELECT_LOCATION:
        await this.exitSelectLocation();
        break;
      case UIMODE_SELECT_GRIP_CARD:
        await this.exitSelectGripCard();
        break;
      case UIMODE_SELECT_INSTALLED_CARD:
        await this.exitSelectInstalledCard();
        break;
      case UIMODE_ASSIGN_DAMAGE:
        await this.exitAssignDamage();
        break;
      case UIMODE_SELECT_ENEMY:
        await this.exitSelectEnemy();
        break;
      case UIMODE_WAITING:
        await this.exitWaiting();
        break;
      case UIMODE_END_TURN:
        await this.exitEndTurn();
        break;
    }

    this.#previousMode = this.#uiMode;
    this.#uiMode = mode;
    this.data = data ? data : {};

    switch (this.uiMode) {
      case UIMODE_NON_GAME:
        await this.enterNonGame();
        break;
      case UIMODE_CORP_TURN:
        await this.enterCorpTurn();
        break;
      case UIMODE_SELECT_ACTION:
        await this.enterSelectAction();
        break;
      case UIMODE_SELECT_LOCATION:
        await this.enterSelectLocation();
        break;
      case UIMODE_SELECT_GRIP_CARD:
        await this.enterSelectGripCard();
        break;
      case UIMODE_SELECT_INSTALLED_CARD:
        await this.enterSelectInstalledCard();
        break;
      case UIMODE_ASSIGN_DAMAGE:
        await this.enterAssignDamage();
        break;
      case UIMODE_SELECT_ENEMY:
        await this.enterSelectEnemy();
        break;
      case UIMODE_WAITING:
        await this.enterWaiting();
        break;
      case UIMODE_END_TURN:
        await this.enterEndTurn();
        break;
    }
  }

  static setFlag(flag, value) {
    if (value) {
      $("#ui-flags").addClass(flag);
    } else {
      $("#ui-flags").removeClass(flag);
    }
  }

  // UIMODE_NON_GAME
  static async enterNonGame() {}
  static async exitNonGame() {}

  // UIMODE_CORP_TURN
  static async enterCorpTurn() {}
  static async exitCorpTurn() {}

  // UIMODE_SELECT_ACTION
  static async enterSelectAction() {
    GripCard.markPlayableCards();
    RigCard.markUsableCards();
    Identity.markUsable();

    UiMode.setFlag("can-investigate", Location.getCurrentLocation().clues > 0);
    const [canEngage, canFight, canEvade] = Enemy.canEngageFightEvade();
    UiMode.setFlag("can-engage", canEngage);
    UiMode.setFlag("can-fight", canFight);
    UiMode.setFlag("can-evade", canEvade);

    UiMode.setFlag("engaged", Enemy.getAttackingEnemies().length > 0); // The UI only cares if the enemies are ready

    Serialisation.save();
  }
  static async exitSelectAction() {
    GripCard.markAllCardsUnplayable();
    RigCard.markAllCardsUnusable();
    Identity.markUnusable();
  }

  // UIMODE_SELECT_LOCATION
  // data {
  //  validTargets, // Optional (if unset, use valid move destinations)
  //  message, // Optional (if set, display a message until the selection is complete)
  //  canCancel,
  // [Assigned by enterSelectLocation]
  //  success,
  //  selectedLocation,
  // }
  static async enterSelectLocation() {
    const data = this.data;
    const alert = Alert.send(
      data.message ? data.message : "Pick a location",
      ALERT_INFO,
      false,
      true
    );
    const selectedLocation = await new Promise(function (resolve) {
      const targets = data.validTargets
        ? data.validTargets
        : Location.getValidDestinations();
      targets.forEach((location) => {
        location.selectable = true;
        location.removeClick().click(() => {
          resolve(location);
        });
      });
      $("#action-move").off("click");
      UiMode.setFlag("can-cancel-move", data.canCancel);
      if (data.canCancel) {
        $("#action-move").click(function () {
          resolve();
        });
      }
    });

    if (alert) {
      alert.close();
    }

    this.data.success = !!selectedLocation;
    this.data.selectedLocation = selectedLocation;
  }
  static async exitSelectLocation() {
    Location.instances.forEach((location) => {
      location.selectable = false;
    });
    Game.resetMoveButton();
    UiMode.setFlag("can-cancel-move", false);
  }

  // UIMODE_SELECT_GRIP_CARD
  // data {
  //  message, // Optional
  //  minCards,
  //  maxCards,
  //  canCancel,
  //  validTargets, // Optional (if unset, all cards are valid)
  // [Assigned by enterSelectGripCard]
  //  success,
  //  selectedCards,
  // }
  static async enterSelectGripCard() {
    // Highlight valid targets
    Cards.grip.forEach((card) => {
      card.selectable =
        !this.data.validTargets || this.data.validTargets.includes(card);
    });

    // Create alert
    const message = this.data.message
      ? this.data.message
      : this.data.minCards != this.data.maxCards
      ? `Select between ${this.data.minCards} and ${this.data.maxCards} cards, inclusive, from your hand.`
      : `Select ${this.data.maxCards} ${
          this.data.maxCards == 1 ? "card" : "cards"
        } from your hand.`;
    const options = [new Option("accept", "Accept")];
    if (this.data.canCancel) {
      options.push(new Option("cancel", "Cancel", "warning"));
    }
    const alert = Alert.send(message, ALERT_PRIMARY, false, true, options);

    // Wait for the selection to be approved or cancelled
    let optionId;
    let validSelection = false;
    while (!validSelection) {
      optionId = await alert.waitForOption();
      if (
        optionId == "cancel" ||
        (GripCard.selectedCards.size >= this.data.minCards &&
          GripCard.selectedCards.size <= this.data.maxCards)
      ) {
        validSelection = true;
      } else {
        Alert.send(
          `You must select at least ${this.data.minCards} ${
            this.data.minCards == 1 ? "card" : "cards"
          }`,
          ALERT_WARNING
        );
      }
    }
    alert.close();

    // Record the outcome
    this.data.success = optionId == "accept";
    if (this.data.success) {
      this.data.selectedCards = Array.from(GripCard.selectedCards);
    }
  }
  static async exitSelectGripCard() {
    GripCard.deselectAll();
    GripCard.markAllCardsUnselectable();
  }

  // UIMODE_SELECT_INSTALLED_CARD
  // data {
  //  validTargets,
  //  minCards,
  //  maxCards,
  //  reason,
  //  effect,
  //  canCancel,
  // [Assigned by enterSelectInstalledCard]
  //  success,
  // }
  static async enterSelectInstalledCard() {
    // Highlight cards
    RigCard.highlightCards(this.data.validTargets);
    // Create alert
    const effect = this.data.effect ? ` ${this.data.effect}` : "";
    const message =
      (this.data.reason ? `${this.data.reason}: ` : "") +
      (this.data.minCards != this.data.maxCards
        ? `Select between ${this.data.minCards} and ${this.data.maxCards} installed cards, inclusive${effect}.`
        : `Select ${this.data.maxCards} installed ${
            this.data.maxCards == 1 ? "card" : "cards"
          }${effect}.`);
    const options = [new Option("accept", "Accept")];
    if (this.data.canCancel) {
      options.push(new Option("cancel", "Cancel", "warning"));
    }
    const alert = Alert.send(message, ALERT_PRIMARY, false, true, options);

    // Wait for the selection to be approved or cancelled
    let optionId;
    let validSelection = false;
    while (!validSelection) {
      optionId = await alert.waitForOption();
      if (
        optionId == "cancel" ||
        (RigCard.selectedCards.size >= this.data.minCards &&
          RigCard.selectedCards.size <= this.data.maxCards)
      ) {
        validSelection = true;
      } else {
        Alert.send(
          `You must select at least ${this.data.minCards} ${
            this.data.minCards == 1 ? "card" : "cards"
          }`,
          ALERT_WARNING
        );
      }
    }
    alert.close();

    // Record the outcome
    this.data.success = optionId == "accept";
    if (this.data.success) {
      this.data.selectedCards = Array.from(RigCard.selectedCards);
    }
  }
  static async exitSelectInstalledCard() {
    RigCard.deselectAll();
    console.log(RigCard.selectedCards);
  }

  // UIMODE_ASSIGN_DAMAGE
  // data {
  //   damage,
  //   source,
  //  [Defined by enterAssignDamage]
  //   destroyedCardIds,
  // }
  static async enterAssignDamage() {
    // Highlight damageable cards
    RigCard.highlightDamageableCards();

    // Create the alert
    const source = this.data.source ? `${this.data.source}: ` : "";
    const message = `${source}Choose up to ${this.data.damage} damage to split among installed cards. Any excess will be dealt to your identity.`;
    const options = [
      new Option("accept", "Accept"),
      new Option("reset", "Reset", "warning"),
    ];
    const alert = Alert.send(message, ALERT_PRIMARY, false, true, options);

    // Respond to the options
    let destroyedCardIds = null;
    while (destroyedCardIds == null) {
      const optionId = await alert.waitForOption();
      if (optionId == "accept") {
        alert.close();
        Identity.addDamage(this.data.damage - RigCard.totalPerceivedDamage);
        destroyedCardIds = await RigCard.applyAllPerceivedDamage();
      } else {
        RigCard.resetAllPerceivedDamage();
        RigCard.highlightDamageableCards();
      }
    }
    this.data.destroyedCardIds = destroyedCardIds;

    // Revert UI
    RigCard.unhighlightAllCards();
  }
  static async exitAssignDamage() {}

  // UIMODE_SELECT_ENEMY
  // data {
  //  validTargets,
  //  canCancel,
  //  reason, // ["engage", "fight", "evade"] // Any other string will be posted to the user in an alert
  // [Assigned by enterSelectEnemy]
  //  success,
  //  selectedEnemy,
  // }
  static async enterSelectEnemy() {
    // Disable enemy-related action buttons
    UiMode.setFlag("can-engage", false);
    UiMode.setFlag("can-fight", false);
    UiMode.setFlag("can-evade", false);

    // Wait for selection or cancellation
    const data = this.data;
    let alert;
    const selectedEnemy = await new Promise(async function (resolve) {
      // Highlight targets
      data.validTargets.forEach((enemy) => {
        enemy.selectable = true;
        enemy.removeClick().click(() => {
          resolve(enemy);
        });
      });
      // Cancel buttons for the enemy-based actions
      if (data.canCancel) {
        if (data.reason == "engage") {
          UiMode.setFlag("can-cancel-engage", true);
          $("#action-engage").click(function () {
            resolve();
          });
        } else if (data.reason == "fight") {
          UiMode.setFlag("can-cancel-fight", true);
          $("#action-fight").click(function () {
            resolve();
          });
        } else if (data.reason == "evade") {
          UiMode.setFlag("can-cancel-evade", true);
          $("#action-evade").click(function () {
            resolve();
          });
        }
      }
      // Send an alert for other actions
      const options = [];
      const message =
        data.reason == "engage"
          ? "Select an enemy to engage."
          : data.reason == "fight"
          ? "Select an enemy to fight."
          : data.reason == "evade"
          ? "Select an enemy to evade."
          : data.reason;
      if (
        data.canCancel &&
        !["engage", "fight", "evade"].includes(data.reason)
      ) {
        options.push(new Option("cancel", "Cancel", "warning"));
      }
      alert = Alert.send(message, ALERT_PRIMARY, false, true, options);
      const optionId = await alert.waitForOption();
      if (optionId == "cancel") {
        resolve();
      }
    });

    // Reset UI
    UiMode.setFlag("can-cancel-engage", false);
    UiMode.setFlag("can-cancel-fight", false);
    UiMode.setFlag("can-cancel-evade", false);
    Game.resetEngageButton();
    Game.resetFightButton();
    Game.resetEvadeButton();
    Enemy.instances.forEach((enemy) => {
      enemy.removeClick().selectable = false;
    });
    if (alert) {
      alert.close();
    }

    // Output
    this.data.success = !!selectedEnemy;
    this.data.selectedEnemy = selectedEnemy;
  }
  static async exitSelectEnemy() {}

  // UIMODE_WAITING
  static async enterWaiting() {}
  static async exitWaiting() {}

  // UIMODE_END_TURN
  static async enterEndTurn() {
    Serialisation.save();
  }
  static async exitEndTurn() {}
}

///////////////////////////////////////////////////////////////////////////////

UiMode.setMode(UIMODE_NON_GAME);
