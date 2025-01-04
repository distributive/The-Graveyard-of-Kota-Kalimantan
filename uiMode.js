let uiMode_i = 0;
const UIMODE_NON_GAME = uiMode_i++;
const UIMODE_CORP_TURN = uiMode_i++;
const UIMODE_SELECT_ACTION = uiMode_i++;
const UIMODE_MOVEMENT = uiMode_i++;
const UIMODE_SELECT_GRIP_CARD = uiMode_i++;
const UIMODE_SELECT_INSTALLED_CARD = uiMode_i++;
const UIMODE_ASSIGN_DAMAGE = uiMode_i++;
const UIMODE_SELECT_ENEMY = uiMode_i++;
const UIMODE_END_TURN = uiMode_i++;

///////////////////////////////////////////////////////////////////////////////

const UIMODE_TO_CLASS = {};
UIMODE_TO_CLASS[UIMODE_NON_GAME] = "uimode-non-game";
UIMODE_TO_CLASS[UIMODE_CORP_TURN] = "uimode-corp-turn";
UIMODE_TO_CLASS[UIMODE_SELECT_ACTION] = "uimode-select-action";
UIMODE_TO_CLASS[UIMODE_MOVEMENT] = "uimode-movement";
UIMODE_TO_CLASS[UIMODE_SELECT_GRIP_CARD] = "uimode-select-grip-card";
UIMODE_TO_CLASS[UIMODE_SELECT_INSTALLED_CARD] = "uimode-select-installed-card";
UIMODE_TO_CLASS[UIMODE_ASSIGN_DAMAGE] = "uimode-assign-damage";
UIMODE_TO_CLASS[UIMODE_SELECT_ENEMY] = "uimode-select-enemy";
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
      case UIMODE_MOVEMENT:
        await this.exitMovement();
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
      case UIMODE_MOVEMENT:
        await this.enterMovement();
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
  }
  static async exitSelectAction() {
    GripCard.markAllCardsUnplayable();
  }

  // UIMODE_MOVEMENT
  static async enterMovement() {}
  static async exitMovement() {}

  // UIMODE_SELECT_GRIP_CARD
  // data {
  //  minCards,
  //  maxCards,
  //  canCancel,
  //  success, // Assigned by enterSelectGripCard
  // }
  static async enterSelectGripCard() {
    // Create alert
    const message =
      this.data.minCards != this.data.maxCards
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
    const optionId = await alert.waitForOption();
    alert.close();

    // Declare if the selection went ahead
    this.data.success = optionId == "accept"; // TODO - record the selected cards?
  }
  static async exitSelectGripCard() {
    GripCard.deselectAll();
  }

  // UIMODE_SELECT_INSTALLED_CARD
  // data {
  //  minCards,
  //  maxCards,
  //  canCancel,
  //  success, // Assigned by enterSelectInstalledCard
  // }
  static async enterSelectInstalledCard() {
    // Create alert
    const message =
      this.data.minCards != this.data.maxCards
        ? `Select between ${this.data.minCards} and ${this.data.maxCards} installed cards, inclusive.`
        : `Select ${this.data.maxCards} installed ${
            this.data.maxCards == 1 ? "card" : "cards"
          }.`;
    const options = [new Option("accept", "Accept")];
    if (this.data.canCancel) {
      options.push(new Option("cancel", "Cancel", "warning"));
    }
    const alert = Alert.send(message, ALERT_PRIMARY, false, true, options);

    // Wait for the selection to be approved or cancelled
    const optionId = await alert.waitForOption();
    alert.close();

    // Declare if the selection went ahead
    this.data.success = optionId == "accept"; // TODO - record the selected cards?
  }
  static async exitSelectInstalledCard() {
    RigCard.deselectAll();
  }

  // UIMODE_ASSIGN_DAMAGE
  // data {
  //   damage,
  //   destroyedCardIds, // Defined by enterAssignDamage
  // }
  static async enterAssignDamage() {
    // Create the alert
    const message = `Choose up to ${this.data.damage} damage to split among installed cards. Any excess will be dealt to your identity.`;
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
        destroyedCardIds = await RigCard.applyAllPerceivedDamage();
      } else {
        RigCard.resetAllPerceivedDamage();
      }
    }
    this.data.destroyedCardIds = destroyedCardIds;
  }
  static async exitAssignDamage() {}

  // UIMODE_SELECT_ENEMY
  static async enterSelectEnemy() {}
  static async exitSelectEnemy() {}

  // UIMODE_END_TURN
  static async enterEndTurn() {}
  static async exitEndTurn() {}
}

///////////////////////////////////////////////////////////////////////////////

UiMode.setMode(UIMODE_NON_GAME);
