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
  static data = {}; // Mode-specific data

  static #uiMode = UIMODE_NON_GAME;
  static #previousMode = this.#uiMode;
  static get uiMode() {
    return UiMode.#uiMode;
  }
  static setMode(mode, data) {
    $("#ui-mode").removeClass().addClass(UIMODE_TO_CLASS[mode]);

    switch (this.#uiMode) {
      case UIMODE_NON_GAME:
        this.exitNonGame();
        break;
      case UIMODE_CORP_TURN:
        this.exitCorpTurn();
        break;
      case UIMODE_SELECT_ACTION:
        this.exitSelectAction();
        break;
      case UIMODE_MOVEMENT:
        this.exitMovement();
        break;
      case UIMODE_SELECT_GRIP_CARD:
        this.exitSelectGripCard();
        break;
      case UIMODE_SELECT_INSTALLED_CARD:
        this.exitSelectInstalledCard();
        break;
      case UIMODE_ASSIGN_DAMAGE:
        this.exitAssignDamage();
        break;
      case UIMODE_SELECT_ENEMY:
        this.exitSelectEnemy();
        break;
      case UIMODE_END_TURN:
        this.exitEndTurn();
        break;
    }

    this.#previousMode = this.#uiMode;
    this.#uiMode = mode;
    this.data = data ? data : {};

    switch (this.uiMode) {
      case UIMODE_NON_GAME:
        this.enterNonGame();
        break;
      case UIMODE_CORP_TURN:
        this.enterCorpTurn();
        break;
      case UIMODE_SELECT_ACTION:
        this.enterSelectAction();
        break;
      case UIMODE_MOVEMENT:
        this.enterMovement();
        break;
      case UIMODE_SELECT_GRIP_CARD:
        this.enterSelectGripCard();
        break;
      case UIMODE_SELECT_INSTALLED_CARD:
        this.enterSelectInstalledCard();
        break;
      case UIMODE_ASSIGN_DAMAGE:
        this.enterAssignDamage();
        break;
      case UIMODE_SELECT_ENEMY:
        this.enterSelectEnemy();
        break;
      case UIMODE_END_TURN:
        this.enterEndTurn();
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
  static enterNonGame() {}
  static exitNonGame() {}

  // UIMODE_CORP_TURN
  static enterCorpTurn() {}
  static exitCorpTurn() {}

  // UIMODE_SELECT_ACTION
  static enterSelectAction() {}
  static exitSelectAction() {}

  // UIMODE_MOVEMENT
  static enterMovement() {}
  static exitMovement() {}

  // UIMODE_SELECT_GRIP_CARD
  // data {
  //  minCards,
  //  maxCards,
  //  onAccept,
  //  canCancel,
  // }
  static enterSelectGripCard() {
    const message =
      this.data.minCards != this.data.maxCards
        ? `Select between ${this.data.minCards} and ${this.data.maxCards} cards, inclusive, from your hand.`
        : `Select ${this.data.maxCards} ${
            this.data.maxCards == 1 ? "card" : "cards"
          } from your hand.`;
    const options = [new Option("Accept", this.data.onAccept)];
    if (this.data.canCancel) {
      options.push(
        new Option(
          "Cancel",
          function () {
            UiMode.setMode(UiMode.#previousMode); // TODO - this doesn't account for the previous mode data
          },
          "warning"
        )
      );
    }
    Alert.send(message, ALERT_PRIMARY, false, true, options);
  }
  static exitSelectGripCard() {
    GripCard.deselectAll();
  }

  // UIMODE_SELECT_INSTALLED_CARD
  // data {
  //  minCards,
  //  maxCards,
  //  onAccept,
  //  canCancel,
  // }
  static enterSelectInstalledCard() {
    const message =
      this.data.minCards != this.data.maxCards
        ? `Select between ${this.data.minCards} and ${this.data.maxCards} installed cards, inclusive.`
        : `Select ${this.data.maxCards} installed ${
            this.data.maxCards == 1 ? "card" : "cards"
          }.`;
    const options = [new Option("Accept", this.data.onAccept)];
    if (this.data.canCancel) {
      options.push(
        new Option(
          "Cancel",
          function () {
            UiMode.setMode(UiMode.#previousMode); // TODO - this doesn't account for the previous mode data
          },
          "warning"
        )
      );
    }
    Alert.send(message, ALERT_PRIMARY, false, true, options);
  }
  static exitSelectInstalledCard() {
    RigCard.deselectAll();
  }

  // UIMODE_ASSIGN_DAMAGE
  // data {
  //   damage,
  //   onAccept,
  // }
  static enterAssignDamage() {}
  static exitAssignDamage() {}

  // UIMODE_SELECT_ENEMY
  static enterSelectEnemy() {}
  static exitSelectEnemy() {}

  // UIMODE_END_TURN
  static enterEndTurn() {}
  static exitEndTurn() {}
}

///////////////////////////////////////////////////////////////////////////////

UiMode.setMode(UIMODE_NON_GAME);
