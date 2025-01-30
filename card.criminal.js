///////////////////////////////////////////////////////////////////////////////
// ASSETS

CardDocklandsPass = new AssetData("docklands_pass", {
  title: "Docklands Pass",
  text: "The first time each turn you successfully jack in, download another data from the same location, or an adjacent location.",
  subtypes: ["item", "unique"],
  unique: true,
  faction: FACTION_CRIMINAL,
  image: "img/card/asset/bgCriminal.png",
  cost: 2,
  health: 0,
  async onInvestigation(source, data) {
    if (Game.getTurnEvent("investigateSuccess")) {
      return;
    }
    const { location, results, clues } = data;
    if (!results.success) {
      return;
    }
    let locations = location.neighbours;
    locations.push(location);
    locations = locations.filter((location) => location.clues > 0);
    if (locations.length == 0) {
      return;
    }
    await UiMode.setMode(UIMODE_SELECT_LOCATION, {
      validTargets: locations,
      canCancel: false,
      message: "Pick a location to download another data from.",
    });
    UiMode.data.selectedLocation.addClues(-1);
    Stats.addClues(1);
  },
});

CardPennyearner = new AssetData("pennyearner", {
  title: "Pennyearner",
  text: "Whenever you move, place 1{c} on this.\n{click}: <b>Jack in.</b> If successful, take all hosted credits.",
  subtypes: ["console", "unique"],
  unique: true,
  faction: FACTION_CRIMINAL,
  image: "img/card/asset/pennyearner.png",
  cost: 3,
  health: 0,
  async onPlayerMoves(source, data) {
    source.addPower(1);
  },
  canUse(source) {
    return source.power > 0;
  },
  async onUse(source, data) {
    const { success } = await Game.actionInvestigate({ costsClick: false });
    if (success) {
      await Stats.addCredits(source.power);
      source.setPower(0);
    }
  },
});

CardAkauntan = new AssetData("akauntan", {
  title: "Akauntan",
  text: "Whenever you evade an enemy, do 1 damage to it.\nThe first time each turn you evade an enemy, gain 2{c}.",
  subtypes: ["icebreaker"],
  unique: false,
  faction: FACTION_CRIMINAL,
  image: "img/card/asset/bgCriminal.png",
  cost: 3,
  health: 1,
  async onPlayerEvades(source, data) {
    const { enemy } = data;
    enemy.addDamage(1);
    if (!Game.getTurnEvent("evaded")) {
      await Stats.addCredits(2);
    }
  },
});

CardForgedDocuments = new AssetData("forged_documents", {
  title: "Forged Documents",
  text: "You get +2 {link}.\nWhen you fail a {link} skill test, trash this asset.",
  subtypes: ["item"],
  unique: false,
  faction: FACTION_CRIMINAL,
  image: "img/card/asset/forgedDocuments.png",
  cost: 0,
  health: 1,
  async onCardInstalled(source, data) {
    if (source != data.card) return;
    Stats.link += 2;
  },
  async onAssetTrashed(source, data) {
    if (source != data.card) return;
    Stats.link -= 2;
  },
  async onTestCompleted(source, data) {
    const { stat, results } = data;
    if (stat == "link" && !results.success) {
      await Cards.trashInstalledCard(source);
    }
  },
});

CardCrowbar = new AssetData("crowbar", {
  title: "Crowbar",
  text: "Uses 2 power counters.\n{click}, power counter: <b>Jack in.</b> During this skill test, add your {link} to your {mu}. If successful, download 1 additional data.",
  subtypes: ["item", "weapon"],
  unique: false,
  faction: FACTION_CRIMINAL,
  image: "img/card/asset/crowbar.png",
  cost: 2,
  health: 1,
  smallText: true,
  async onCardInstalled(source, data) {
    if (source != data.card) return;
    source.setPower(2);
  },
  canUse(source) {
    return source.power > 0 && Location.getCurrentLocation().clues > 0;
  },
  async onUse(source, data) {
    source.addPower(-1);
    await Game.actionInvestigate({
      clues: 2,
      costsClick: false,
      base: Stats.link + Stats.mu,
    });
    // if (source.power <= 0) {
    //   await Cards.trashInstalledCard(source);
    // }
  },
});

CardShiv = new AssetData("shiv", {
  title: "Shiv",
  text: "Uses 2 power counters.\n{click}, power counter: <b>Fight.</b> During this fight, add your {link} to your {strength}. If successful, do 1 additional damage.",
  subtypes: ["item", "weapon"],
  unique: false,
  faction: FACTION_CRIMINAL,
  image: "img/card/asset/shiv.png",
  cost: 3,
  health: 2,
  smallText: true,
  preventAttacks: true,
  async onCardInstalled(source, data) {
    if (source != data.card) return;
    source.setPower(2);
  },
  canUse(source) {
    return source.power > 0 && Enemy.getEnemiesAtCurrentLocation().length > 0;
  },
  async onUse(source, data) {
    source.addPower(-1);
    await Enemy.actionFight({
      damage: 2,
      canCancel: false,
      costsClick: false,
      base: Stats.link + Stats.strength,
    });
    // if (source.power <= 0) {
    //   await Cards.trashInstalledCard(source);
    // }
  },
});

CardSpike = new AssetData("spike", {
  title: "Spike",
  text: "Uses 2 power counters.\n{click}, power counter: Move up to 2 locations. Enemies at those locations do not engage you.",
  subtypes: ["item", "weapon"],
  unique: false,
  faction: FACTION_CRIMINAL,
  image: "img/card/asset/spike.png",
  cost: 3,
  health: 2,
  async onCardInstalled(source, data) {
    if (source != data.card) return;
    source.setPower(2);
  },
  canUse(source) {
    return source.power > 0;
  },
  async onUse(source, data) {
    source.addPower(-1);
    await UiMode.setMode(UIMODE_SELECT_LOCATION, {
      message: "Pick a location to move to. (1/2)",
    });
    await Game.actionMoveTo(UiMode.data.selectedLocation, {
      costsClick: false,
      enemiesCanEngage: false,
    });
    await UiMode.setMode(UIMODE_SELECT_LOCATION, {
      message: "Pick a location to move to. (2/2)",
    });
    await Game.actionMoveTo(UiMode.data.selectedLocation, {
      costsClick: false,
      enemiesCanEngage: false,
    });
    // if (source.power <= 0) {
    //   await Cards.trashInstalledCard(source);
    // }
  },
});

///////////////////////////////////////////////////////////////////////////////
// EVENTS

CardBackflip = new EventData("backflip", {
  title: "Backflip",
  text: "<b>Evade.</b> If successful, download a data from this location.",
  subtypes: ["talent"],
  faction: FACTION_CRIMINAL,
  image: "img/card/event/bgCriminal.png",
  cost: 2,
  canPlay(source) {
    return (
      Location.getCurrentLocation().clues > 0 &&
      Enemy.getEngagedEnemies().length > 0
    );
  },
  async onPlay(source, data) {
    const { results } = await Enemy.actionEvade({
      canCancel: false,
      costsClick: false,
    });
    if (results.success) {
      Location.getCurrentLocation().addClues(-1);
      await Stats.addClues(1);
    }
  },
});

CardDifficultJohn = new EventData("difficult_john", {
  title: "Difficult John",
  text: "Gain 6{c}. Lose 3{c}.",
  subtypes: ["trick"],
  faction: FACTION_CRIMINAL,
  image: "img/card/event/bgCriminal.png",
  cost: 0,
  async onPlay() {
    await Stats.addCredits(6);
    await Stats.addCredits(-3);
  },
});

CardJackOfAll = new EventData("jack_of_all_trades", {
  title: "Jack of All Trades",
  text: "Gain 2{c}. Draw 1 card. Move.",
  subtypes: ["talent"],
  faction: FACTION_CRIMINAL,
  image: "img/card/event/jackOfAll.png",
  cost: 1,
  async onPlay(source, data) {
    await Stats.addCredits(2);
    await Cards.draw(1);
    await UiMode.setMode(UIMODE_SELECT_LOCATION, {
      message: "Pick a location to move to.",
    });
    Game.actionMoveTo(UiMode.data.selectedLocation, {
      costsClick: false,
      enemiesCanEngage: false,
    });
  },
});

CardEmpDevice = new EventData("emp_device", {
  title: "EMP Device",
  text: "Evade all enemies. Move all evaded enemies to random adjacent locations.",
  subtypes: ["tactic"],
  faction: FACTION_CRIMINAL,
  image: "img/card/event/bgCriminal.png",
  cost: 5,
  preventAttacks: true,
  canPlay(source) {
    return Enemy.getEngagedEnemies().length > 0;
  },
  async onPlay(source, data) {
    const locations = Location.getCurrentLocation().neighbours;
    for (const enemy of Enemy.getEngagedEnemies()) {
      await enemy.evade();
      await enemy.moveTo(randomElement(locations));
    }
  },
});

CardInfiltrate = new EventData("infiltrate", {
  title: "Infiltrate",
  text: "Look at a facedown adjacent location. Move to an adjacent location.",
  subtypes: ["tactic"],
  faction: FACTION_CRIMINAL,
  image: "img/card/event/bgCriminal.png",
  cost: 0,
  // TODO
});

CardInsideJob = new EventData("inside_job", {
  title: "Inside Job",
  text: "<b>Jack in.</b> If successful, discover a clue at an adjacent location.",
  subtypes: ["tactic"],
  faction: FACTION_CRIMINAL,
  image: "img/card/event/bgCriminal.png",
  cost: 2,
  canPlay(source) {
    const locations = Location.getCurrentLocation().neighbours;
    return locations.some((location) => location.clues > 0);
  },
  async onPlay(source, data) {
    const locations = Location.getCurrentLocation().neighbours.filter(
      (location) => location.clues > 0
    );
    await UiMode.setMode(UIMODE_SELECT_LOCATION, {
      validTargets: locations,
      message: "Pick an adjacent location to download 1 data from.",
    });
    await Game.actionInvestigate({
      clues: 1,
      location: UiMode.data.selectedLocation,
      target: Location.getCurrentLocation().cardData.shroud,
      costsClick: false,
    });
  },
});

CardPush = new EventData("push", {
  title: "Push",
  text: "Spend up to 4{c}. <b>Fight.</b> During this fight, gain +1{strength} for each credit spent. If successful, evade all enemies.",
  subtypes: ["tactic"],
  faction: FACTION_CRIMINAL,
  image: "img/card/event/bgCriminal.png",
  cost: 0,
  preventAttacks: true,
  canPlay(source) {
    return Enemy.getEnemiesAtCurrentLocation().length > 0;
  },
  async onPlay(source, data) {
    let creditsSpent = 0;
    if (Stats.credits > 0) {
      const options = [];
      for (let i = 0; i <= 4 && i <= Stats.credits; i++) {
        options.push(new Option(i, `${i}`));
      }
      const alert = Alert.send(
        "How many credits will you spend?",
        ALERT_INFO,
        false,
        true,
        options
      );
      creditsSpent = await alert.waitForOption();
      alert.close();
      Stats.addCredits(-creditsSpent);
    }
    const { results } = await Enemy.actionFight({
      damage: 1,
      canCancel: false,
      costsClick: false,
      base: Stats.getBase("strength") + creditsSpent,
    });
    if (results.success) {
      for (const enemy of Enemy.getEngagedEnemies()) {
        await enemy.evade();
      }
    }
  },
});

CardTreadLightly = new EventData("tread_lightly", {
  title: "Tread Lightly",
  text: "Move up to 2 locations. Enemies at those locations do not engage you.",
  subtypes: ["talent"],
  faction: FACTION_CRIMINAL,
  image: "img/card/event/bgCriminal.png",
  cost: 1,
  async onPlay() {
    await UiMode.setMode(UIMODE_SELECT_LOCATION, {
      message: "Pick a location to move to. (1/2)",
    });
    await Game.actionMoveTo(UiMode.data.selectedLocation, {
      costsClick: false,
      enemiesCanEngage: false,
    });
    await UiMode.setMode(UIMODE_SELECT_LOCATION, {
      message: "Pick a location to move to. (2/2)",
    });
    await Game.actionMoveTo(UiMode.data.selectedLocation, {
      costsClick: false,
      enemiesCanEngage: false,
    });
  },
});
