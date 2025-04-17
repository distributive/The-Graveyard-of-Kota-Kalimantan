///////////////////////////////////////////////////////////////////////////////
// ASSETS

CardIllHaveWorse = new AssetData("ill_have_worse", {
  title: "I'll Have Worse!",
  text: "Whenever you fail a test, you may do 1 damage to an enemy at your location.",
  flavour: `"You don't get the satisfaction of being the worst thing to ever happen to me."`,
  subtypes: ["unique", "trait"],
  unique: true,
  faction: FACTION_ANARCH,
  image: "img/card/asset/illHaveWorse.jpg",
  cost: 3,
  health: 2,
  skills: ["influence", "strength"],
  async onTestCompleted(source, data) {
    const { stat, results } = data;
    if (results.success || !Enemy.getEnemiesAtCurrentLocation().length) {
      return;
    }
    await UiMode.setMode(UIMODE_SELECT_ENEMY, {
      validTargets: Enemy.getEnemiesAtCurrentLocation(),
      canCancel: false,
      reason:
        "I'll Have Worse: Pick 1 enemy at your location to do 1 damage to.",
    });
    await UiMode.data.selectedEnemy.addDamage(1);
  },
});

CardNol = new AssetData("nol", {
  title: "N0L",
  text: "Once per turn → {click}, discard a card: Draw 2 cards.",
  flavour: "Your cards belong in the bin.",
  subtypes: ["unique"],
  unique: true,
  faction: FACTION_ANARCH,
  image: "img/card/asset/nol.jpg",
  cost: 1,
  health: 0,
  skills: ["mu"],
  canUse(source, data) {
    const untapped = !source.tapped;
    const cardsInHand = Cards.grip.length > 0;
    return {
      success: untapped && cardsInHand,
      reason: !untapped
        ? "This asset has been exhausted."
        : !cardsInHand
        ? "You do not have any cards in hand."
        : null,
    };
  },
  async onUse(source, data) {
    await source.setTapped(true);
    await Stats.addClicks(-1);
    await UiMode.setMode(UIMODE_SELECT_GRIP_CARD, {
      message: `n0l: Select 1 card to discard.`,
      minCards: 1,
      maxCards: 1,
      canCancel: false,
    });
    await Cards.discard(UiMode.data.selectedCards[0]);
    await Cards.draw(2);
  },
  async onTurnEnd(source, data) {
    source.setTapped(false);
  },
});

CardSifar = new AssetData("sifar", {
  title: "Sifar",
  text: "You get +3{strength} during your turn until you complete a {strength} test.\nWhenever you reveal a symbol during a {strength} test, suffer 1 damage.",
  flavour: `"Fashionable, affordable, big enough to carry everything I need."`,
  subtypes: ["unique", "item"],
  unique: true,
  faction: FACTION_ANARCH,
  image: "img/card/asset/sifar.jpg",
  cost: 5,
  health: 1,
  skills: ["mu", "strength"],
  async onCardInstalled(source, data) {
    if (source != data.card) return;
    if (!source.tapped) {
      Stats.strength += 3;
    }
  },
  async onAssetTrashed(source, data) {
    if (source != data.card) return;
    if (!source.tapped) {
      Stats.strength -= 3;
    }
  },
  async onTestCompleted(source, data) {
    if (data.stat == "strength") {
      if (!source.tapped) {
        source.setTapped(true);
      }
      if (typeof data.results.token != "number") {
        await Game.sufferDamage(1, "Sifar");
      }
    }
  },
  async onTurnStart(source, data) {
    if (source.tapped) {
      source.setTapped(false);
    }
  },
  async onTurnEnd(source, data) {
    if (source.tapped) {
      source.setTapped(false);
    }
  },
  async onTapped() {
    Stats.strength -= 3;
  },
  async onUntapped() {
    Stats.strength += 3;
  },
});

CardIceCarver = new AssetData("ice_carver", {
  title: "Ice Carver",
  text: "You get +1{strength}.",
  subtypes: ["familiar", "virtual"],
  unique: false,
  faction: FACTION_ANARCH,
  image: "img/card/asset/iceCarver.jpg",
  cost: 2,
  health: 1,
  skills: ["strength"],
  async onCardInstalled(source, data) {
    if (source != data.card) return;
    Stats.strength++;
  },
  async onAssetTrashed(source, data) {
    if (source != data.card) return;
    Stats.strength--;
  },
});

CardMeniru = new AssetData("meniru", {
  title: "Meniru",
  text: "Whenever you fight, if you succeed the test by 3 or more, do 1 additional damage to all targets.",
  subtypes: ["icebreaker"],
  unique: false,
  faction: FACTION_ANARCH,
  image: "img/card/asset/meniru.jpg",
  cost: 3,
  health: 1,
  skills: ["strength", "link"],
  onPlayerAttacks(source, data) {
    const { enemy, results, damage } = data;
    const { success, token, value, target } = results;
    if (success && (value >= target + 3 || token == "elder")) {
      enemy.addDamage(1);
    }
  },
});

CardTormentNexus = new AssetData("torment_nexus", {
  title: "Torment Nexus",
  text: "When you install this, do 1 damage to it. When your turn ends, heal 1 damage from it.\nWhen this is trashed, download 1 data from your current location.",
  flavour: `"You can't deny it <b>is</b> convenient."`,
  subtypes: ["unique", "omen"],
  unique: true,
  faction: FACTION_ANARCH,
  image: "img/card/asset/tormentNexus.jpg",
  cost: 3,
  health: 2,
  skills: ["influence", "link"],
  async onCardInstalled(source, data) {
    if (source != data.card) return;
    source.addDamage(1);
  },
  async onTurnEnd(source, data) {
    source.addDamage(-1);
  },
  async onAssetTrashed(source, data) {
    if (source != data.card) return;
    if (Location.getCurrentLocation().clues > 0) {
      Location.getCurrentLocation().addClues(-1);
      await Stats.addClues(1);
      Alert.send("Torment Nexus: You downloaded 1 data!");
    }
  },
});

CardFast = new AssetData("fast", {
  title: "Fast",
  text: "Once per turn → 2{c}, {click}: Move. Gain {click}.",
  flavour: "Red cards go faster.",
  subtypes: ["unique", "trait"],
  unique: true,
  faction: FACTION_ANARCH,
  image: "img/card/asset/fast.jpg",
  cost: 2,
  smallText: true,
  canUse(source, data) {
    const untapped = !source.tapped;
    const clicks = Stats.clicks >= 1;
    const credits = Stats.credits >= 2;
    return {
      success: untapped && clicks && credits,
      reason: !untapped
        ? "This asset has been exhausted."
        : !clicks
        ? "You do not have any remaining clicks."
        : !credits
        ? "You do not have enough credits to use this ability."
        : null,
    };
  },
  async onUse(source, data) {
    await source.setTapped(true);
    await Stats.addClicks(-1);
    await Stats.addCredits(-2);
    await UiMode.setMode(UIMODE_SELECT_LOCATION, {
      canCancel: false,
    });
    Game.actionMoveTo(UiMode.data.selectedLocation, {
      costsClick: false,
    });
    await Stats.addClicks(1);
  },
  async onTurnEnd(source, data) {
    source.setTapped(false);
  },
});

///////////////////////////////////////////////////////////////////////////////
// EVENTS

CardBackAway = new EventData("back_away", {
  title: "Back Away",
  text: "This costs 2{c} more for each enemy engaged with you.\nEvade all enemies and move to an adjacent location.",
  flavour: `"As you were."`,
  subtypes: ["tactic", "evade"],
  faction: FACTION_ANARCH,
  image: "img/card/event/backAway.jpg",
  cost: 0,
  skills: ["link"],
  preventAttacks: true,
  calculateCost(source, data) {
    return this.cost + Enemy.getEngagedEnemies().length * 2;
  },
  canPlay(source, data) {
    const success = Enemy.getEngagedEnemies().length > 0;
    return {
      success: success,
      reason: success ? null : "You are not engaged with an enemy.",
    };
  },
  onPlay: async (card) => {
    for (const enemy of Enemy.getEngagedEnemies()) {
      enemy.evade();
    }
    await UiMode.setMode(UIMODE_SELECT_LOCATION, {
      canCancel: false,
    });
    Game.actionMoveTo(UiMode.data.selectedLocation, {
      costsClick: false,
    });
  },
});

CardKickItDown = new EventData("kick_it_down", {
  title: "Kick It Down!",
  text: "Move to an adjacent location then do 3 damage, randomly split among enemies at that location.",
  subtypes: ["tactic"],
  faction: FACTION_ANARCH,
  image: "img/card/event/kickItDown.jpg",
  illustrator: "Illustrator: Lish",
  cost: 2,
  skills: ["strength"],
  onPlay: async (card) => {
    await UiMode.setMode(UIMODE_SELECT_LOCATION, { canCancel: false });
    const enemies = Enemy.getEnemiesAtLocation(UiMode.data.selectedLocation);
    Game.actionMoveTo(UiMode.data.selectedLocation, {
      costsClick: false,
    });
    if (enemies.length) {
      await randomElement(enemies).addDamage(1);
    }
    if (enemies.length) {
      await randomElement(enemies).addDamage(1);
    }
    if (enemies.length) {
      await randomElement(enemies).addDamage(1);
    }
  },
});

CardDownloadTheSigns = new EventData("download_the_signs", {
  title: "Download the Signs",
  text: "<b>Jack in.</b> Add your {strength} to your {mu} for this test. If successful, download an additional data from this location.",
  subtypes: ["hack"],
  faction: FACTION_ANARCH,
  image: "img/card/event/downloadTheSigns.jpg",
  cost: 2,
  skills: ["mu", "strength"],
  canPlay(source, data) {
    const success = Location.getCurrentLocation().clues > 0;
    return {
      success: success,
      reason: success ? null : "There is no data at your current location.",
    };
  },
  async onPlay(source, data) {
    const statOverride = Location.getCurrentLocation().cardData.statOverride;
    const base =
      statOverride && statOverride != "mu" ? null : Stats.strength + Stats.mu;
    await Game.actionInvestigate({
      clues: 2,
      costsClick: false,
      base: base,
    });
  },
});

CardGritAndDetermination = new EventData("grit_and_determination", {
  title: "Grit & Determination",
  text: "If you have already downloaded data this turn, download another data from your current location.",
  flavour: `"Nobody will hold me back."`,
  subtypes: ["tactic"],
  faction: FACTION_ANARCH,
  image: "img/card/event/gritAndDetermination.jpg",
  cost: 0,
  skills: ["influence", "mu"],
  canPlay(source, data) {
    const activated = Game.getTurnEvent("downloaded");
    const validLocation = Location.getCurrentLocation().clues > 0;
    return {
      success: activated && validLocation,
      reason: !activated
        ? "You have not downloaded data this turn."
        : !validLocation
        ? "There is no data at your current location."
        : null,
    };
  },
  async onPlay(source, data) {
    await Location.getCurrentLocation().addClues(-1);
    await Stats.addClues(1);
  },
});

CardAllOut = new EventData("all_out", {
  title: "All Out",
  text: "This costs 2{c} more for each other card in your hand.\n<b>Fight.</b> You gain +3 {strength} for this fight. If successful, instead attack each engaged enemy.",
  flavour: `"Don't get in my way."`,
  subtypes: ["tactic", "attack"],
  faction: FACTION_ANARCH,
  image: "img/card/event/allOut.jpg",
  illustrator: "Illustrator: PiCat",
  cost: 0,
  skills: ["strength"],
  preventAttacks: true,
  calculateCost(source) {
    return this.cost + (Cards.grip.length - 1) * 2;
  },
  canPlay(source) {
    const success = Enemy.getEnemiesAtCurrentLocation().length > 0;
    return {
      success: success,
      reason: success ? null : "There are no enemies at your current location.",
    };
  },
  // This recreates the fight process from core principles to ensure it combos as intended
  async onPlay(source, data) {
    // Get targetted enemy
    await UiMode.setMode(UIMODE_SELECT_ENEMY, {
      validTargets: Enemy.getEnemiesAtCurrentLocation(),
      canCancel: false,
      reason: "Last Ditch: Pick an enemy to fight.",
    });
    const enemy = UiMode.data.selectedEnemy;
    // Trigger events
    await Broadcast.signal("onPlayerAttackAttempt", {
      enemy: enemy,
      damage: 1,
    });
    // Run modal
    const results = await Chaos.runModal({
      stat: "strength",
      base: Stats.getBase("strength") + 3,
      target: enemy.strength,
      title: "Fight!",
      description: `<p>If successful, you will do 1 damage to each engaged enemy (${
        Enemy.getEngagedEnemies().length
      }).</p>`,
    });
    Modal.hide();
    // Resolve effects
    if (results.success) {
      for (const enemy of Enemy.getEngagedEnemies()) {
        await Broadcast.signal("onPlayerAttacks", {
          enemy: enemy,
          results: results,
          damage: 1,
        });
        await enemy.addDamage(1);
      }
    }
  },
});

CardProjectile = new EventData("projectile", {
  title: "Projectile",
  text: "As an additional cost to play this, trash an installed card.\n<b>Fight.</b> During this fight, add the cost of that card to your {strength}.\nIf successful, do 2 additional damage.",
  subtypes: ["tactic", "attack"],
  faction: FACTION_ANARCH,
  image: "img/card/event/projectile.jpg",
  cost: 0,
  skills: ["strength", "mu", "link"],
  preventAttacks: true,
  canPlay(source, data) {
    const [canEngage, canFight, canEvade] = Enemy.canEngageFightEvade();
    const validInstallable = Cards.installedCards.length > 0;
    return {
      success: canFight && validInstallable,
      reason: !canFight
        ? "There is no enemy at your current location."
        : !validInstallable
        ? "You do not have any installed cards."
        : null,
    };
  },
  async onPlay(source, data) {
    if (Cards.installedCards.length == 0) {
      Alert.send(
        "Repurpose: There is no longer a valid installed target.",
        ALERT_WARNING
      );
      return;
    }
    await UiMode.setMode(UIMODE_SELECT_INSTALLED_CARD, {
      minCards: 1,
      maxCards: 1,
      canCancel: false,
    });
    const cost = UiMode.data.selectedCards[0].cost;
    await Cards.trashInstalledCard(UiMode.data.selectedCards[0]);
    await Enemy.actionFight({
      damage: 3,
      canCancel: false,
      costsClick: false,
      base: Stats.getBase("strength") + cost,
    });
  },
});

CardRepurpose = new EventData("repurpose", {
  title: "Repurpose",
  text: "As an additional cost to play this, trash an installed card.\nGain 2{c} and draw 2 cards.",
  subtypes: ["talent"],
  faction: FACTION_ANARCH,
  image: "img/card/event/repurpose.jpg",
  cost: 0,
  canPlay(source, data) {
    const success = Cards.installedCards.length > 0;
    return {
      success: success,
      reason: success ? null : "You do not have any installed cards.",
    };
  },
  async onPlay(source, data) {
    if (Cards.installedCards.length == 0) {
      Alert.send(
        "Repurpose: There is no longer a valid installed target.",
        ALERT_WARNING
      );
      return;
    }
    await UiMode.setMode(UIMODE_SELECT_INSTALLED_CARD, {
      minCards: 1,
      maxCards: 1,
      canCancel: false,
    });
    await Cards.trashInstalledCard(UiMode.data.selectedCards[0]);
    await Stats.addCredits(2);
    await Cards.draw(2);
  },
});
