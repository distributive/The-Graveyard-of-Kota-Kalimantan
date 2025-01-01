class Game {
  static initGameState() {
    // TODO read ID for stats
    Stats.influence = 3;
    Stats.mu = 3;
    Stats.strength = 3;
    Stats.link = 3;

    // TODO read decklist for given ID
    let xs = [];
    for (let i = 0; i < 22; i++) {
      xs.push(CardSureGamble);
      xs.push(CardUnderTheHood);
    }
    Cards.addToStack(xs);

    Cards.draw(5);

    Stats.setCredits(0);
    for (let i = 1; i <= 5; i++) {
      setTimeout(() => {
        Stats.setCredits(i);
      }, i * 100);
    }

    Stats.setClues(0);

    Agenda.setDoom(0);

    Location.focusMapOffsetCurrentLocation();
  }

  static startTurn() {
    UiMode.setMode(UIMODE_SELECT_ACTION);
    Stats.setClicks(3);
    animateTurnBanner("runner");
  }
  static endTurn() {
    UiMode.setMode(UIMODE_CORP_TURN);
    Stats.setClicks(0);
    Agenda.addDoom(1);
    animateTurnBanner("corp");

    // TEMP //
    setTimeout(() => {
      this.startTurn();
    }, 2000);
  }

  static checkTurnEnd() {
    if (Stats.clicks <= 0) {
      UiMode.setMode(UIMODE_END_TURN);
      return true;
    }
    return false;
  }

  static actionMoveTo(location) {
    location.setCurrentLocation();
    Stats.addClicks(-1);
    if (!Game.checkTurnEnd()) {
      UiMode.setMode(UIMODE_SELECT_ACTION);
    }
  }

  static async actionPlayCard(gripCard) {
    const cardData = gripCard.cardData;
    const cost = cardData.calculateCost(gripCard);
    if (
      Stats.clicks <= 0 ||
      (cardData.type != TYPE_ASSET && cardData.type != TYPE_EVENT) ||
      cost > Stats.credits ||
      !cardData.canPlay(gripCard)
    ) {
      return false;
    }
    Stats.addClicks(-1);
    Stats.addCredits(-cost);
    if (cardData.type == TYPE_ASSET) {
      const rigCard = Cards.install(cardData.id);
      await cardData.onPlay(rigCard);
      await Broadcast.signal("onCardInstalled", { card: rigCard });
    } else {
      await cardData.onPlay(gripCard);
      await Broadcast.signal("onCardPlayed", { card: gripCard });
    }
    Game.checkTurnEnd();
    return true;
  }

  // If location isn't set, use the current location
  static async actionInvestigate(clues, location, callback) {
    if (!location) {
      location = Location.getCurrentLocation();
    }
    location.cardData.onThisInvestigationAttempt({ location: location });
    await Broadcast.signal("onInvestigationAttempt", { location: location });
    Chaos.runModal(
      "mu",
      location.cardData.shroud,
      true,
      "Jacking in...",
      `<p>If successful, you will download ${clues} data from ${
        location == Location.getCurrentLocation()
          ? "your current location"
          : "the target location"
      }.</p>`,
      async function (results) {
        const { success } = results;
        Modal.hide();
        if (success) {
          Location.getCurrentLocation().removeClues(clues);
          Stats.addClues(1);
        }
        UiMode.setFlag(
          "can-investigate",
          Location.getCurrentLocation().clues > 0
        );
        location.cardData.onThisInvestigationAttempt({
          location: location,
          clues: clues,
        });
        await Broadcast.signal("onInvestigation", {
          location: location,
          results: results,
          clues: clues,
        });
        callback(results);
      }
    );
  }
}

///////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  // Action buttons
  $("#action-end-turn").click(() => {
    Game.endTurn();
  });

  $("#action-credit").click(() => {
    if (Stats.clicks <= 0) {
      return;
    }
    Stats.addCredits(1);
    Stats.addClicks(-1);
    Game.checkTurnEnd();
  });

  $("#action-draw").click(() => {
    if (Stats.clicks <= 0 || !Cards.canDraw()) {
      return;
    }
    Cards.draw(1);
    Stats.addClicks(-1);
    Game.checkTurnEnd();
  });

  $("#action-move").click(() => {
    if (Stats.clicks <= 0) {
      return;
    }
    if (UiMode.uiMode == UIMODE_SELECT_ACTION) {
      UiMode.setMode(UIMODE_MOVEMENT);
    } else if (UiMode.uiMode == UIMODE_MOVEMENT) {
      UiMode.setMode(UIMODE_SELECT_ACTION);
    }
  });

  $("#action-investigate").click(() => {
    if (Stats.clicks <= 0 || UiMode.uiMode != UIMODE_SELECT_ACTION) {
      return;
    }
    Game.actionInvestigate(1, null, function (results) {
      Stats.addClicks(-1);
    });
  });

  $("#action-engage").click(() => {
    if (Enemy.mode == ENEMY_MODE_NONE) {
      Enemy.actionEngage(function (results, enemy) {
        Stats.addClicks(-1);
        UiMode.setMode(UIMODE_SELECT_ACTION);
        Game.checkTurnEnd();
      });
    } else if (Enemy.mode == ENEMY_MODE_ENGAGE) {
      Enemy.cancelAction();
      UiMode.setMode(UIMODE_SELECT_ACTION);
    }
  });

  $("#action-fight").click(() => {
    if (Enemy.mode == ENEMY_MODE_NONE) {
      Enemy.actionFight(1, function (results, enemy) {
        Stats.addClicks(-1);
        UiMode.setMode(UIMODE_SELECT_ACTION);
        Game.checkTurnEnd();
      });
    } else if (Enemy.mode == ENEMY_MODE_FIGHT) {
      Enemy.cancelAction();
      UiMode.setMode(UIMODE_SELECT_ACTION);
    }
  });

  $("#action-evade").click(() => {
    if (Enemy.mode == ENEMY_MODE_NONE) {
      Enemy.actionEvade(function (results, enemy) {
        Stats.addClicks(-1);
        UiMode.setMode(UIMODE_SELECT_ACTION);
        Game.checkTurnEnd();
      });
    } else if (Enemy.mode == ENEMY_MODE_EVADE) {
      Enemy.cancelAction();
      UiMode.setMode(UIMODE_SELECT_ACTION);
    }
  });
});
