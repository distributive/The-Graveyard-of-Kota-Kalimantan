const UIMODE_NON_GAME = 0;
const UIMODE_CORP_TURN = 1;
const UIMODE_SELECT_ACTION = 2;
const UIMODE_MOVEMENT = 3;
const UIMODE_SELECT_GRIP_CARD = 4;
const UIMODE_SELECT_INSTALLED_CARD = 5;

///////////////////////////////////////////////////////////////////////////////

const UIMODE_TO_CLASS = {};
UIMODE_TO_CLASS[UIMODE_NON_GAME] = "uimode-non-game";
UIMODE_TO_CLASS[UIMODE_CORP_TURN] = "uimode-corp-turn";
UIMODE_TO_CLASS[UIMODE_SELECT_ACTION] = "uimode-select-action";
UIMODE_TO_CLASS[UIMODE_MOVEMENT] = "uimode-movement";
UIMODE_TO_CLASS[UIMODE_SELECT_GRIP_CARD] = "uimode-select-grip-card";
UIMODE_TO_CLASS[UIMODE_SELECT_INSTALLED_CARD] = "uimode-select-installed-card";

///////////////////////////////////////////////////////////////////////////////

class UiMode {
  static #uiMode = UIMODE_NON_GAME;
  static get uiMode() {
    return UiMode.#uiMode;
  }
  static set uiMode(mode) {
    $("#ui-mode").removeClass().addClass(UIMODE_TO_CLASS[mode]);
    UiMode.#uiMode = mode;
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
  static enterSelectGripCard() {}
  static exitSelectGripCard() {}

  // UIMODE_SELECT_INSTALLED_CARD
  static enterSelectInstalledCard() {}
  static exitSelectInstalledCard() {}
}

///////////////////////////////////////////////////////////////////////////////

UiMode.uiMode = UIMODE_NON_GAME;
