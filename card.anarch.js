///////////////////////////////////////////////////////////////////////////////
// ASSETS

CardIllHaveWorse = new AssetData("ill_have_worse", {
  title: "I'll Have Worse!",
  text: "The first time each turn you fail a test, you may do 1 damage to an enemy at your location.",
  flavour: `"You don't get the satisfaction of being the worst thing to ever happen to me."`,
  subtypes: ["unique", "trait"],
  unique: true,
  faction: FACTION_ANARCH,
  image: "img/card/asset/illHaveWorse.png",
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
  subtypes: ["unique"],
  unique: true,
  faction: FACTION_ANARCH,
  image: "img/card/asset/nol.png",
  cost: 1,
  health: 0,
  skills: ["mu"],
  canUse(source, data) {
    return !source.tapped && Cards.grip.length > 0;
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
  subtypes: ["unique", "item"],
  unique: true,
  faction: FACTION_ANARCH,
  image: "img/card/asset/sifar.png",
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
  image: "img/card/asset/iceCarver.png",
  cost: 1,
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
  text: "Whenever you fight, if you succeed the test by 3 or more, do 1 additional damage to that enemy.",
  subtypes: ["icebreaker"],
  unique: false,
  faction: FACTION_ANARCH,
  image: "img/card/asset/meniru.png",
  cost: 3,
  health: 1,
  skills: ["strength", "link"],
  onPlayerAttacks(source, data) {
    const { enemy, results, damage } = data;
    const { success, token, value, target } = results;
    if (success && value >= target + 3) {
      enemy.addDamage(1);
    }
  },
});

CardTormentNexus = new AssetData("torment_nexus", {
  title: "Torment Nexus",
  text: "When you install this, do 1 damage to it. When your turn ends, heal 1 damage from it.\nWhen this is trashed, download 1 data from your current location.",
  flavour: `"You can't deny it <b>is</b> convenient."`,
  subtypes: ["omen"],
  unique: true,
  faction: FACTION_ANARCH,
  image: "img/card/asset/tormentNexus.png",
  cost: 4,
  health: 2,
  skills: ["influence"],
  // smallText: true,
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
  text: "Once per turn → {click}, 2{c}: Move. Gain {click}.",
  flavour: "Fast.",
  subtypes: ["fast"],
  unique: true,
  faction: FACTION_ANARCH,
  image: "img/card/asset/bgAnarch.png",
  cost: 2,
  canUse(source, data) {
    return !source.tapped && Stats.clicks >= 1 && Stats.credits >= 2;
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
  },
  async onTurnEnd(source, data) {
    source.setTapped(false);
  },
});

///////////////////////////////////////////////////////////////////////////////
// EVENTS

CardBackAway = new EventData("back_away", {
  title: "Back Away",
  text: "This costs 2{c} less for each enemy engaged with you.\nEvade all enemies and move to an adjacent location.",
  subtypes: ["tactic", "evade"],
  faction: FACTION_ANARCH,
  image: "img/card/event/backAway.png",
  cost: 8,
  skills: ["link"],
  preventAttacks: true,
  calculateCost(source, data) {
    return this.cost - Enemy.getEngagedEnemies().length * 2;
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
  image: "img/card/event/bgAnarch.png",
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
  image: "img/card/event/downloadTheSigns.png",
  cost: 2,
  skills: ["mu", "strength"],
  canPlay(source, data) {
    return Location.getCurrentLocation().clues > 0;
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
  text: "If you have already downloaded data this turn, download another data from your location.",
  flavour: `"Nobody will hold me back."`,
  subtypes: ["tactic"],
  faction: FACTION_ANARCH,
  image: "img/card/event/bgAnarch.png",
  cost: 3,
  skills: ["influence", "mu"],
  canPlay(source, data) {
    return (
      Game.getTurnEvent("investigateSuccess") &&
      Location.getCurrentLocation().clues > 0
    );
  },
  async onPlay(source, data) {
    await Location.getCurrentLocation().addClues(-1);
    await Stats.addClues(1);
  },
});

CardLastDitch = new EventData("last_ditch", {
  title: "Last Ditch",
  text: "This costs 2{c} more for each other card in your hand.\n<b>Fight.</b> You gain +1 {strength} for this fight. If successful, instead attack each engaged enemy.",
  subtypes: ["tactic", "attack"],
  faction: FACTION_ANARCH,
  image: "img/card/event/bgAnarch.png",
  cost: 0,
  skills: ["strength"],
  preventAttacks: true,
  calculateCost(source) {
    return this.cost + Cards.grip.length * 2 - 2;
  },
  canPlay(source) {
    return Enemy.getEnemiesAtCurrentLocation().length > 0;
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
      base: Stats.getBase("strength") + 1,
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
  image: "img/card/event/projectile.png",
  cost: 1,
  skills: ["strength", "mu"],
  smallText: true,
  preventAttacks: true,
  canPlay(source, data) {
    const [canEngage, canFight, canEvade] = Enemy.canEngageFightEvade();
    return canFight && Cards.installedCards.length > 0;
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
  image: "img/card/event/repurpose.png",
  cost: 0,
  canPlay(source, data) {
    return Cards.installedCards.length > 0;
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
