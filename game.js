class Game {
  static initGameState() {
    // TODO read ID for stats
    Stats.influence = 3;
    Stats.mu = 3;
    Stats.strength = 3;
    Stats.link = 3;

    // TODO read decklist for given ID
    let xs = [];
    for (let i = 0; i < 11; i++) {
      xs.push(CardOffSureFund);
      xs.push(CardUnderTheHood);
      xs.push(CardFruitJuice);
      xs.push(CardSelfDamage);
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
  }

  static async startTurn() {
    UiMode.setMode(UIMODE_SELECT_ACTION);
    animateTurnBanner("runner");
    await Broadcast.signal("onTurnStart");
    await Stats.setClicks(3);
  }
  static async endTurn() {
    UiMode.setMode(UIMODE_CORP_TURN);
    animateTurnBanner("corp");
    await Stats.setClicks(0);
    await Agenda.addDoom(1);
    await Broadcast.signal("onTurnEnd");

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

  static async actionMoveTo(location, allowAttackOfOpportunity = true) {
    await Stats.addClicks(-1);
    if (allowAttackOfOpportunity) {
      await Enemy.attackOfOpportunity();
    }
    const oldLocation = Location.getCurrentLocation();
    location.setCurrentLocation();
    await Enemy.moveEngagedEnemies();
    await Broadcast.signal("onPlayerMoves", {
      fromLocation: oldLocation,
      toLocation: location,
    });
    if (!Game.checkTurnEnd()) {
      UiMode.setMode(UIMODE_SELECT_ACTION);
    }
  }

  static async actionPlayCard(gripCard) {
    // Determine if the card can be played
    const cardData = gripCard.cardData;
    const cost = cardData.calculateCost(gripCard);
    if (Stats.clicks <= 0) {
      return { success: false, reason: "clicks" };
    }
    if (cardData.type != TYPE_ASSET && cardData.type != TYPE_EVENT) {
      return { success: false, reason: "type" };
    }
    if (Stats.credits < cardData.cost) {
      return { success: false, reason: "credits" };
    }
    if (!gripCard.playable) {
      return { success: false, reason: "unplayable" };
    }

    // Play/install the card
    await Stats.addClicks(-1);
    await Stats.addCredits(-cost);
    await Enemy.attackOfOpportunity();
    if (cardData.type == TYPE_ASSET) {
      const rigCard = Cards.install(cardData.id);
      await cardData.onPlay(rigCard);
      await Broadcast.signal("onCardInstalled", { card: rigCard });
    } else {
      await cardData.onPlay(gripCard);
      await Broadcast.signal("onCardPlayed", { card: gripCard });
      Cards.addToHeap(gripCard.cardData.id);
    }
    if (!Game.checkTurnEnd()) {
      UiMode.setMode(UIMODE_SELECT_ACTION); // TODO - is it true that this will always be the correct mode to return to?
    }
    return { success: true };
  }

  // If location isn't set, use the current location
  static async actionInvestigate(clues, location) {
    if (!location) {
      location = Location.getCurrentLocation();
    }
    await Clicks.addClicks(-1);
    await Enemy.attackOfOpportunity();
    await Broadcast.signal("onInvestigationAttempt", { location: location });
    const results = await Chaos.runModal(
      "mu",
      location.cardData.shroud,
      false,
      "Jacking in...",
      `<p>If successful, you will download ${clues} data from ${
        location == Location.getCurrentLocation()
          ? "your current location"
          : "the target location"
      }.</p>`
    );

    const { success } = results;
    if (success) {
      Location.getCurrentLocation().removeClues(clues);
      Stats.addClues(1);
    }
    UiMode.setFlag("can-investigate", Location.getCurrentLocation().clues > 0);
    await Broadcast.signal("onInvestigation", {
      location: location,
      results: results,
      clues: clues,
    });

    return results;
  }

  static async sufferDamage(damage, callback) {
    if (RigCard.getDamageableCards().length > 0) {
      await UiMode.setMode(UIMODE_ASSIGN_DAMAGE, {
        damage: damage,
      });
      const destroyedCardIds = UiMode.data.destroyedCardIds;
    } else {
      Identity.addDamage(damage);
    }
  }
}

///////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  // Action buttons
  $("#action-end-turn").click(async () => {
    if (Cards.grip.length > 8) {
      const difference = Cards.grip.length - 8;
      await UiMode.setMode(UIMODE_SELECT_GRIP_CARD, {
        message: `Select ${difference} ${
          difference == 1 ? "card" : "cards"
        } to discard to handsize.`,
        minCards: difference,
        maxCards: difference,
        canCancel: false,
      });
      UiMode.data.selectedCards.forEach((gripCard) => {
        Cards.discard(gripCard);
      });
    }
    Game.endTurn();
  });

  $("#action-credit").click(() => {
    if (Stats.clicks <= 0) {
      return;
    }
    Stats.addCredits(1);
    Stats.addClicks(-1);
    if (!Game.checkTurnEnd()) {
      UiMode.setMode(UIMODE_SELECT_ACTION);
    }
  });

  $("#action-draw").click(async () => {
    if (Stats.clicks <= 0 || !Cards.canDraw()) {
      return;
    }
    await Enemy.attackOfOpportunity();
    await Stats.addClicks(-1);
    Cards.draw(1);
    if (!Game.checkTurnEnd()) {
      UiMode.setMode(UIMODE_SELECT_ACTION);
    }
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

  $("#action-investigate").click(async () => {
    if (Stats.clicks <= 0 || UiMode.uiMode != UIMODE_SELECT_ACTION) {
      return;
    }
    await Game.actionInvestigate(1);
  });

  $("#action-engage").click(async () => {
    if (Enemy.mode == ENEMY_MODE_NONE) {
      const { success, enemy } = await Enemy.actionEngage();
    } else if (Enemy.mode == ENEMY_MODE_ENGAGE) {
      Enemy.cancelAction();
    }
    UiMode.setMode(UIMODE_SELECT_ACTION);
    Game.checkTurnEnd();
  });

  $("#action-fight").click(async () => {
    if (Enemy.mode == ENEMY_MODE_NONE) {
      const { results, enemy } = await Enemy.actionFight(1);
    } else if (Enemy.mode == ENEMY_MODE_FIGHT) {
      Enemy.cancelAction();
    }
    UiMode.setMode(UIMODE_SELECT_ACTION);
    Game.checkTurnEnd();
  });

  $("#action-evade").click(async () => {
    if (Enemy.mode == ENEMY_MODE_NONE) {
      const { results, enemy } = await Enemy.actionEvade();
    } else if (Enemy.mode == ENEMY_MODE_EVADE) {
      Enemy.cancelAction();
    }
    UiMode.setMode(UIMODE_SELECT_ACTION);
    Game.checkTurnEnd();
  });
});
