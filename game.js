class Game {
  static initGameState() {
    // TODO read ID for stats
    Stats.influence = 3;
    Stats.mu = 3;
    Stats.strength = 3;
    Stats.link = 3;

    // TODO read decklist for given ID
    let xs = [];
    for (let i = 0; i < 45; i++) {
      xs.push(0);
    }
    Cards.addToStack(xs);

    Cards.draw(5);

    Stats.credits = 0;
    for (let i = 1; i <= 5; i++) {
      setTimeout(() => {
        Stats.credits = i;
      }, i * 100);
    }

    Stats.clues = 0;

    Agenda.setDoom(0);

    Location.focusMapOffsetCurrentLocation();
  }

  static startTurn() {
    UiMode.uiMode = UIMODE_SELECT_ACTION;
    Stats.clicks = 4;
    animateTurnBanner("runner");
  }
  static endTurn() {
    UiMode.uiMode = UIMODE_CORP_TURN;
    Stats.clicks = 0;
    Agenda.addDoom(1);
    animateTurnBanner("corp");

    // TEMP //
    setTimeout(() => {
      this.startTurn();
    }, 2000);
  }

  static checkTurnEnd() {
    if (Stats.clicks <= 0) {
      this.endTurn();
      return true;
    }
    return false;
  }

  static actionMoveTo(location) {
    location.setCurrentLocation();
    Stats.clicks--;
    if (!Game.checkTurnEnd()) {
      UiMode.uiMode = UIMODE_SELECT_ACTION;
    }
  }

  static actionPlayCard(gripCard) {
    if (Stats.clicks <= 0) {
      return;
    }
    // TODO - check if card is playable, then play it
    Stats.clicks--;
    Cards.install();
    Game.checkTurnEnd();
    return true;
  }
}

///////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  // Action buttons
  $("#action-credit").click(() => {
    if (Stats.clicks <= 0) {
      return;
    }
    Stats.credits++;
    Stats.clicks--;
    Game.checkTurnEnd();
  });

  $("#action-draw").click(() => {
    if (Stats.clicks <= 0 || Cards.stack.length == 0) {
      return;
    }
    Cards.draw(1);
    Stats.clicks--;
    Game.checkTurnEnd();
  });

  $("#action-move").click(() => {
    if (Stats.clicks <= 0) {
      return;
    }
    if (UiMode.uiMode == UIMODE_SELECT_ACTION) {
      UiMode.uiMode = UIMODE_MOVEMENT;
    } else if (UiMode.uiMode == UIMODE_MOVEMENT) {
      UiMode.uiMode = UIMODE_SELECT_ACTION;
    }
  });

  $("#action-investigate").click(() => {
    if (Stats.clicks <= 0 || UiMode.uiMode != UIMODE_SELECT_ACTION) {
      return;
    }
    Chaos.runModal(
      "mu",
      3, // TODO - set this to location's clue count
      true,
      "Jacking in...",
      `<p>If successful, you will discover ${
        1 /*TODO*/
      } clue at your current location.</p>`,
      function (result, token, value) {
        Modal.hide();
        Stats.clicks--;
        if (result) {
          Location.getCurrentLocation().removeClues(1);
          Stats.clues++;
        }
        UiMode.setFlag(
          "can-investigate",
          Location.getCurrentLocation().clues > 0
        );
      }
    );
  });

  $("#action-engage").click(() => {
    if (Enemy.mode == ENEMY_MODE_NONE) {
      Enemy.actionEngage(function (result, enemy) {
        Stats.clicks--;
        UiMode.uiMode = UIMODE_SELECT_ACTION;
        Game.checkTurnEnd();
      });
    } else if (Enemy.mode == ENEMY_MODE_ENGAGE) {
      Enemy.cancelAction();
      UiMode.uiMode = UIMODE_SELECT_ACTION;
    }
  });

  $("#action-fight").click(() => {
    if (Enemy.mode == ENEMY_MODE_NONE) {
      Enemy.actionFight(function (result, enemy) {
        Stats.clicks--;
        UiMode.uiMode = UIMODE_SELECT_ACTION;
        Game.checkTurnEnd();
      });
    } else if (Enemy.mode == ENEMY_MODE_FIGHT) {
      Enemy.cancelAction();
      UiMode.uiMode = UIMODE_SELECT_ACTION;
    }
  });

  $("#action-evade").click(() => {
    if (Enemy.mode == ENEMY_MODE_NONE) {
      Enemy.actionEvade(function (result, enemy) {
        Stats.clicks--;
        UiMode.uiMode = UIMODE_SELECT_ACTION;
        Game.checkTurnEnd();
      });
    } else if (Enemy.mode == ENEMY_MODE_EVADE) {
      Enemy.cancelAction();
      UiMode.uiMode = UIMODE_SELECT_ACTION;
    }
  });
});
