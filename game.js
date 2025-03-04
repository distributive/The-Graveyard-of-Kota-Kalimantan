class Game {
  static serialise() {
    return this.#turnEvents;
  }
  static deserialise(json) {
    this.#turnEvents = json ? json : {};
  }

  static async initGameState(
    identity = CardTheCatalyst,
    tutorialActive = false
  ) {
    Broadcast.disable();

    Tutorial.active = !!tutorialActive;
    Story.setNetspace(false);

    // Wipe existing game state (if any)
    Location.deleteState();
    Enemy.deleteState();
    Cards.deleteState();

    Identity.setCard(identity, false);
    Stats.influence = identity.influence;
    Stats.mu = identity.mu;
    Stats.strength = identity.strength;
    Stats.link = identity.link;

    // TODO unhardcode the decks
    const xs = [];
    if (identity.faction == FACTION_ANARCH) {
      for (let i = 0; i < 2; i++) {
        xs.push(CardUnsureGamble);
        xs.push(CardIllHaveWorse);
        xs.push(CardNol);
        xs.push(CardSifar);
        xs.push(CardIceCarver);
        xs.push(CardMeniru);
        xs.push(CardTormentNexus);
        xs.push(CardBackAway);
        xs.push(CardKickItDown);
        xs.push(CardDownloadTheSigns);
        xs.push(CardGritAndDetermination);
        xs.push(CardLastDitch);
        xs.push(CardRepurpose);
        xs.push(CardTakeInspiration);
      }
      xs.push(CardProjectile);
      xs.push(CardSoda);
    } else if (identity.faction == FACTION_CRIMINAL) {
      for (let i = 0; i < 2; i++) {
        xs.push(CardUnsureGamble);
        xs.push(CardDocklandsPass);
        xs.push(CardPennyearner);
        xs.push(CardAkauntan);
        xs.push(CardForgedDocuments);
        xs.push(CardCrowbar);
        xs.push(CardShiv);
        xs.push(CardSpike);
        xs.push(CardBackflip);
        xs.push(CardDifficultJohn);
        xs.push(CardJackOfAll);
        xs.push(CardEmpDevice);
        xs.push(CardInsideJob);
        xs.push(CardTreadLightly);
      }
      xs.push(CardPush);
      xs.push(CardSoda);
    } else {
      const cardPool = CardData.getAllCards().filter(
        (cardData) =>
          (cardData.type == TYPE_ASSET || cardData.type == TYPE_EVENT) &&
          cardData.faction != FACTION_ENCOUNTER &&
          !cardData.uncollectable
      );
      for (let i = 0; i < 30 && cardPool.length; i++) {
        const index = randomIndex(cardPool);
        xs.push(cardPool[index]);
        cardPool.splice(index, 1);
      }
    }
    Cards.addToStack(xs, true);

    if (!Tutorial.active) {
      await Cards.draw(5);
    } else {
      // Place Unsure Gamble and Warehouse Key on top of the deck for the tutorial
      // This means the deck run an extra copy, but the maths works out nice for the tutorial
      Cards.addToStack([CardWarehouseKey, CardUnsureGamble]);
    }

    Stats.setCredits(5);

    if (Tutorial.active) {
      const home =
        identity == CardTopan
          ? LocationHideout
          : identity == CardBaz
          ? LocationPenthouse
          : LocationApartment;
      const l0 = new Location(home, 0, 0).setCurrentLocation(true);
      const l1 = new Location(LocationWarehouse, 1, 0);
      l0.addNeighbour(l1);
    } else {
      const l_ = new Location(LocationCorridor, 1, 0).setCurrentLocation();
      const l0 = new Location(LocationUnknownMeat, 2, 1);
      const l1 = new Location(LocationUnknownMeat, 3, 1);
      const l2 = new Location(LocationUnknownMeat, 4, 1);
      const l3 = new Location(LocationUnknownMeat, 5, 1);
      const l4 = new Location(LocationUnknownMeat, 6, 1);
      const l5 = new Location(LocationUnknownMeat, 2, 0);
      const l6 = new Location(LocationUnknownMeat, 4, 0);
      const l7 = new Location(LocationUnknownMeat, 6, 0);
      const l8 = new Location(LocationUnknownMeat, 2, -1);
      const l9 = new Location(LocationUnknownMeat, 3, -1);
      const lA = new Location(LocationUnknownMeat, 4, -1);
      const lB = new Location(LocationUnknownMeat, 5, -1);
      const lC = new Location(LocationUnknownMeat, 6, -1);
      // Connect neighbours
      l_.addNeighbour(l5);
      l5.addNeighbour(l0);
      l5.addNeighbour(l8);
      l0.addNeighbour(l1);
      l1.addNeighbour(l2);
      l2.addNeighbour(l3);
      l3.addNeighbour(l4);
      l6.addNeighbour(l2);
      l6.addNeighbour(lA);
      l7.addNeighbour(l4);
      l7.addNeighbour(lC);
      l8.addNeighbour(l9);
      l9.addNeighbour(lA);
      lA.addNeighbour(lB);
      lB.addNeighbour(lC);
      // Calculate distances
      Location.recalculatePlayerDistance();
    }

    // Agenda 1 starts hidden in the tutorial
    if (Tutorial.active) {
      Agenda.setCard(Agenda1, false);
    } else {
      Agenda.setCard(Agenda2, false);
    }

    Act.setCard(Act1, false);

    await Stats.setClues(0);
    await Agenda.setDoom(0);
    Identity.setDamage(0);

    Story.reset();

    if (Tutorial.active) {
      Tutorial.reset();
    } else {
      Tutorial.setMode(null);
    }

    Encounter.setPool(MEAT_ENCOUNTERS);

    Broadcast.enable();

    Game.startTurn();
  }

  // For logging events that happened this turn for card conditions
  static #turnEvents = {};
  static logTurnEvent(event) {
    this.#turnEvents[event] = true;
  }
  static getTurnEvent(event) {
    return this.#turnEvents[event] ? true : false;
  }

  static async startTurn() {
    await Stats.setClicks(3);
    await UiMode.setMode(UIMODE_SELECT_ACTION);
    animateTurnBanner("runner");
    await Broadcast.signal("onTurnStart");
  }
  static async endTurn() {
    this.#turnEvents = {};
    UiMode.setMode(UIMODE_CORP_TURN);

    await Stats.setClicks(0);
    await Stats.addCredits(1);
    await Cards.draw(1);
    await Broadcast.signal("onTurnEnd");

    await wait(500); // TODO: time all these properly

    animateTurnBanner("corp");

    await wait(1000);

    if (Agenda.cardData && Agenda.cardData != Agenda1) {
      await Agenda.addDoom(1);
    }

    await wait(500);

    await Enemy.engagedEnemiesAttack();
    await Enemy.moveHunters();
    await RigCard.readyAll();
    await Enemy.readyAll();

    await wait(500);
    await Encounter.draw();

    this.startTurn();
  }

  // TODO - make async
  static checkTurnEnd() {
    if (Stats.clicks <= 0) {
      UiMode.setMode(UIMODE_END_TURN);
      return true;
    }
    return false;
  }

  static async actionMoveTo(location, data) {
    const { costsClick, enemiesCanEngage = true } = data;

    if (costsClick) {
      await Stats.addClicks(-1);
    }

    const oldLocation = Location.getCurrentLocation();
    location.setCurrentLocation();

    if (location.cardData.enterSfx) {
      Audio.playEffect(location.cardData.enterSfx);
    } else if (location.cardData.faction == FACTION_NET) {
      Audio.playEffect(AUDIO_MOVE_NETSPACE);
    } else {
      Audio.playEffect(AUDIO_MOVE_MEATSPACE);
    }

    if (enemiesCanEngage) {
      for (const enemy of Enemy.getEnemiesAtCurrentLocation()) {
        await enemy.engage();
      }
    }
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
    if (
      cardData.type == TYPE_ASSET &&
      cardData.unique &&
      RigCard.isCardDataInstalled(cardData)
    ) {
      return { success: false, reason: "unique" };
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
    if (cardData.type == TYPE_ASSET || !cardData.preventAttacks) {
      await Enemy.attackOfOpportunity();
    }
    await UiMode.setMode(UIMODE_WAITING); // Prevent other actions being taken during resolution
    if (cardData.type == TYPE_ASSET) {
      const rigCard = await Cards.install(cardData);
    } else {
      await cardData.onPlay(gripCard);
      await Broadcast.signal("onCardPlayed", { card: gripCard }); // TODO - move to Cards
      Cards.addToHeap(gripCard.cardData);
      Audio.playEffect(AUDIO_PLAY);
    }
    return { success: true };
  }

  static async actionUseCard(rigCard) {
    if (rigCard.tapped) {
      return;
    }
    await rigCard.cardData.onUse(rigCard);
    if (!Game.checkTurnEnd()) {
      UiMode.setMode(UIMODE_SELECT_ACTION);
    }
  }

  // If location isn't set, use the current location
  static async actionInvestigate(data) {
    let {
      clues = 1,
      location = Location.getCurrentLocation(),
      costsClick = true,
      stat = "mu",
      base,
      target = location.cardData.shroud,
    } = data;
    if (clues > location.clues) {
      clues = location.clues;
    }
    // Run test
    if (costsClick) {
      await Stats.addClicks(-1);
    }
    await Enemy.attackOfOpportunity();
    await Broadcast.signal("onInvestigationAttempt", { location: location });
    const forceOutcome = !Tutorial.active
      ? null
      : Stats.clicks > 0
      ? "fail"
      : "success";
    const results = await Chaos.runModal({
      stat: stat,
      base: base,
      target: target,
      title: "Jacking in...",
      description: `<p>If successful, you will download ${clues} data from ${
        location == Location.getCurrentLocation()
          ? "your current location"
          : "the target location"
      }.</p>`,
      forceOutcome: forceOutcome,
    });

    const { success } = results;
    if (success) {
      location.addClues(-clues);
      Stats.addClues(clues);
    }
    await Broadcast.signal("onInvestigation", {
      location: location,
      results: results,
      clues: clues,
    });
    Game.logTurnEvent(success ? "investigateSuccess" : "investigateFail");

    return results;
  }

  static async sufferDamage(damage) {
    if (RigCard.getDamageableCards().length > 0) {
      await UiMode.setMode(UIMODE_ASSIGN_DAMAGE, {
        damage: damage,
      });
      const destroyedCardIds = UiMode.data.destroyedCardIds;
    } else {
      Identity.addDamage(damage);
    }
  }

  static resetMoveButton() {
    $("#action-move")
      .off("click")
      .click(async () => {
        if (Stats.clicks <= 0) {
          return;
        }
        if (UiMode.uiMode == UIMODE_SELECT_ACTION) {
          await UiMode.setMode(UIMODE_SELECT_LOCATION, {
            message: "Pick a location to move to.",
            canCancel: true,
          });
          if (UiMode.data.success) {
            const toLocation = UiMode.data.selectedLocation;
            await Enemy.attackOfOpportunity();
            Game.actionMoveTo(toLocation, {
              costsClick: true,
            });
          }
          if (!Game.checkTurnEnd()) {
            UiMode.setMode(UIMODE_SELECT_ACTION);
          }
        }
      });
  }

  static resetEngageButton() {
    $("#action-engage")
      .off("click")
      .click(async () => {
        if (UiMode.uiMode == UIMODE_SELECT_ACTION) {
          await Enemy.actionEngage();
          if (!Game.checkTurnEnd()) {
            UiMode.setMode(UIMODE_SELECT_ACTION);
          }
        }
      });
  }

  static resetFightButton() {
    $("#action-fight")
      .off("click")
      .click(async () => {
        if (UiMode.uiMode == UIMODE_SELECT_ACTION) {
          await Enemy.actionFight({
            damage: 1,
            canCancel: true,
            costsClick: true,
          });
          if (!Game.checkTurnEnd()) {
            UiMode.setMode(UIMODE_SELECT_ACTION);
          }
        }
      });
  }

  static resetEvadeButton() {
    $("#action-evade")
      .off("click")
      .click(async () => {
        if (UiMode.uiMode == UIMODE_SELECT_ACTION) {
          await Enemy.actionEvade({
            canCancel: true,
            costsClicks: true,
          });
          if (!Game.checkTurnEnd()) {
            UiMode.setMode(UIMODE_SELECT_ACTION);
          }
        }
      });
  }
}

///////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  // Action buttons
  $("#action-end-turn").click(async () => {
    if (
      UiMode.mode == UIMODE_CORP_TURN ||
      UiMode.mode == UIMODE_SELECT_GRIP_CARD
    ) {
      return;
    }
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

  $("#action-credit").click(async () => {
    if (Stats.clicks <= 0) {
      return;
    }
    Stats.addClicks(-1);
    await Enemy.attackOfOpportunity();
    Stats.addCredits(1);
    Audio.playEffect(AUDIO_CREDIT);
    if (!Game.checkTurnEnd()) {
      UiMode.setMode(UIMODE_SELECT_ACTION);
    }
  });

  $("#action-draw").click(async () => {
    if (Stats.clicks <= 0 || !Cards.canDraw()) {
      return;
    }
    await Stats.addClicks(-1);
    await Enemy.attackOfOpportunity();
    await Cards.draw(1);
    if (!Game.checkTurnEnd()) {
      UiMode.setMode(UIMODE_SELECT_ACTION);
    }
  });

  Game.resetMoveButton();

  $("#action-investigate").click(async () => {
    if (Stats.clicks <= 0 || UiMode.uiMode != UIMODE_SELECT_ACTION) {
      return;
    }
    const stat = Location.getCurrentLocation().cardData.statOverride; // If null, investigate defaults to MU
    await Game.actionInvestigate({ clues: 1, stat: stat });
    if (!Game.checkTurnEnd()) {
      UiMode.setMode(UIMODE_SELECT_ACTION);
    }
  });

  Game.resetEngageButton();
  Game.resetFightButton();
  Game.resetEvadeButton();
});
