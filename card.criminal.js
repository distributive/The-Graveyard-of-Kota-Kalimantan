///////////////////////////////////////////////////////////////////////////////
// ASSETS

CardDocklandsPass = new AssetData("docklands_pass", {
  title: "Elevator Depot Pass",
  text: "The first time each turn you successfully jack in at a location with data, download another data from the same location, or an adjacent location.",
  flavour: `"It fell off the back of a hopper."`,
  subtypes: ["item", "unique"],
  unique: true,
  faction: FACTION_CRIMINAL,
  image: "img/card/asset/docklandsPass.png",
  cost: 2,
  health: 0,
  skills: ["mu"],
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
    await Stats.addClues(1);
  },
});

CardPennyearner = new AssetData("pennyearner", {
  title: "Pennyearner",
  text: "The first time each turn you move, place 1{c} on this.\n{click}: <b>Jack in.</b> If successful, take all hosted credits.",
  subtypes: ["unique"],
  unique: true,
  faction: FACTION_CRIMINAL,
  image: "img/card/asset/pennyearner.png",
  cost: 3,
  health: 0,
  skills: ["mu", "link"],
  async onPlayerMoves(source, data) {
    if (Game.getTurnEvent("moved")) {
      return;
    }
    source.addPower(1);
  },
  canUse(source) {
    const success = source.power > 0;
    return {
      success: success,
      reason: success ? null : "Pennyearner has no hosted credits to take.",
    };
  },
  async onUse(source, data) {
    Stats.addClicks(-1);
    const { success } = await Game.actionInvestigate({ costsClick: false });
    if (success) {
      await Stats.addCredits(source.power);
      source.setPower(0);
    }
  },
});

CardAkauntan = new AssetData("akauntan", {
  title: "Akauntan",
  text: "The first time each turn you evade an enemy, do 1 damage to it and gain 1{c}.",
  subtypes: ["icebreaker"],
  unique: false,
  faction: FACTION_CRIMINAL,
  image: "img/card/asset/akauntan.png",
  cost: 3,
  health: 1,
  skills: ["strength", "link"],
  async onPlayerEvades(source, data) {
    if (data.results && !data.results.success) {
      return;
    }
    if (!Game.getTurnEvent("evaded")) {
      data.enemy.addDamage(1);
      await Stats.addCredits(1);
    }
  },
});

CardForgedDocuments = new AssetData("forged_documents", {
  title: "Forged Documents",
  text: "You get +2 {link}.\nWhen you fail a {link} skill test, trash this asset.",
  flavour: `"Haircut."`,
  subtypes: ["item"],
  unique: false,
  faction: FACTION_CRIMINAL,
  image: "img/card/asset/forgedDocuments.png",
  cost: 1,
  health: 1,
  skills: ["link"],
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
  text: "Uses 2 power counters.\n{click}, power counter: <b>Jack in.</b> During this skill test, add your {link} to your {mu}. If successful, download 1 additional data.<br>Limit 2 installed weapons.",
  subtypes: ["item", "weapon"],
  unique: false,
  faction: FACTION_CRIMINAL,
  image: "img/card/asset/crowbar.png",
  cost: 3,
  health: 1,
  skills: ["influence", "link"],
  smallText: true,
  async onCardInstalled(source, data) {
    if (source != data.card) return;
    source.setPower(2);
    const installedWeapons = Cards.installedCards.filter((card) =>
      card.cardData.subtypes.includes("weapon")
    );
    if (installedWeapons.length > 2) {
      await UiMode.setMode(UIMODE_SELECT_INSTALLED_CARD, {
        validTargets: installedWeapons,
        minCards: installedWeapons.length - 2,
        maxCards: installedWeapons.length - 2,
        reason: "You have exceeded the limit on installed weapons",
        effect: "to trash",
        canCancel: false,
      });
      for (const card of UiMode.data.selectedCards) {
        await Cards.trashInstalledCard(card);
      }
    }
  },
  canUse(source) {
    const power = source.power > 0;
    const clues = Location.getCurrentLocation().clues > 0;
    return {
      success: power && clues,
      reason: !power
        ? "Crowbar has no more hosted power counters to spend."
        : !clues
        ? "There is no data at your current location."
        : null,
    };
  },
  async onUse(source, data) {
    await Stats.addClicks(-1);
    source.addPower(-1);
    const statOverride = Location.getCurrentLocation().cardData.statOverride;
    const base =
      statOverride && statOverride != "mu" ? null : Stats.link + Stats.mu;
    await Game.actionInvestigate({
      clues: 2,
      costsClick: false,
      base: base,
    });
  },
});

CardShiv = new AssetData("shiv", {
  title: "Shiv",
  text: "Uses 2 power counters.\n{click}, power counter: <b>Fight.</b> During this fight, add your {link} to your {strength}. If successful, do 1 additional damage.<br>Limit 2 installed weapons.",
  subtypes: ["item", "weapon", "attack"],
  unique: false,
  faction: FACTION_CRIMINAL,
  image: "img/card/asset/shiv.png",
  cost: 3,
  health: 2,
  skills: ["influence", "strength"],
  smallText: true,
  preventAttacks: true,
  async onCardInstalled(source, data) {
    if (source != data.card) return;
    source.setPower(2);
    const installedWeapons = Cards.installedCards.filter((card) =>
      card.cardData.subtypes.includes("weapon")
    );
    if (installedWeapons.length > 2) {
      await UiMode.setMode(UIMODE_SELECT_INSTALLED_CARD, {
        validTargets: installedWeapons,
        minCards: installedWeapons.length - 2,
        maxCards: installedWeapons.length - 2,
        reason: "You have exceeded the limit on installed weapons",
        effect: "to trash",
        canCancel: false,
      });
      for (const card of UiMode.data.selectedCards) {
        await Cards.trashInstalledCard(card);
      }
    }
  },
  canUse(source) {
    const power = source.power > 0;
    const enemies = Enemy.getEnemiesAtCurrentLocation().length > 0;
    return {
      success: power && enemies,
      reason: !power
        ? "Shiv has no more hosted power counters to spend."
        : !enemies
        ? "There are no enemies at this location."
        : null,
    };
  },
  async onUse(source, data) {
    await Stats.addClicks(-1);
    source.addPower(-1);
    await Enemy.actionFight({
      damage: 2,
      canCancel: false,
      costsClick: false,
      base: Stats.link + Stats.strength,
    });
  },
});

CardSpike = new AssetData("spike", {
  title: "Spike",
  text: "Uses 2 power counters.\n{click}, power counter: Move twice. Enemies at those locations do not engage you.<br>Limit 2 installed weapons.",
  subtypes: ["item", "weapon", "stealth"],
  unique: false,
  faction: FACTION_CRIMINAL,
  image: "img/card/asset/spike.png",
  cost: 3,
  health: 2,
  skills: ["influence", "mu"],
  smallText: true,
  async onCardInstalled(source, data) {
    if (source != data.card) return;
    source.setPower(2);
    const installedWeapons = Cards.installedCards.filter((card) =>
      card.cardData.subtypes.includes("weapon")
    );
    if (installedWeapons.length > 2) {
      await UiMode.setMode(UIMODE_SELECT_INSTALLED_CARD, {
        validTargets: installedWeapons,
        minCards: installedWeapons.length - 2,
        maxCards: installedWeapons.length - 2,
        reason: "You have exceeded the limit on installed weapons",
        effect: "to trash",
        canCancel: false,
      });
      for (const card of UiMode.data.selectedCards) {
        await Cards.trashInstalledCard(card);
      }
    }
  },
  canUse(source) {
    const power = source.power > 0;
    return {
      success: power,
      reason: power
        ? null
        : "Spike has no more hosted power counters to spend.",
    };
  },
  async onUse(source, data) {
    await Stats.addClicks(-1);
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
  },
});

///////////////////////////////////////////////////////////////////////////////
// EVENTS

CardBackflip = new EventData("backflip", {
  title: "Parry",
  text: "<b>Evade.</b> If successful, download a data from this location.",
  flavour: `"I've still got it."`,
  subtypes: ["talent", "evade"],
  faction: FACTION_CRIMINAL,
  image: "img/card/event/parry.png",
  cost: 2,
  preventAttacks: true,
  skills: ["mu", "link"],
  canPlay(source) {
    const clues = Location.getCurrentLocation().clues > 0;
    const engaged = Enemy.getEngagedEnemies().length > 0;
    return {
      success: clues && engaged,
      reason: !engaged
        ? "You are not engaged with an enemy."
        : !clues
        ? "There is no data at your current location."
        : null,
    };
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

CardZhanZhuang = new EventData("zhan_zhuang", {
  title: "Zhan zhuang",
  text: "Gain 2{c}. Draw 1 card.",
  flavour:
    "Baz clears his head and focuses. He's done this before, he can do it again.",
  subtypes: ["talent"],
  faction: FACTION_CRIMINAL,
  image: "img/card/event/zhanZhuang.png",
  cost: 0,
  skills: ["influence"],
  async onPlay() {
    await Stats.addCredits(2);
    await Cards.draw(1);
  },
});

CardJackOfAll = new EventData("jack_of_all_trades", {
  title: "Jack of All Trades",
  text: "Gain 2{c}. Draw 1 card. Move.",
  flavour: `"But make no mistake: I am the king."`,
  subtypes: ["talent"],
  faction: FACTION_CRIMINAL,
  image: "img/card/event/jackOfAll.png",
  cost: 1,
  skills: ["influence", "mu", "strength", "link"],
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
  title: '"EMP" Device',
  text: "Evade all enemies. Do 1 damage to all enemies at your location, then move each to a random adjacent location.",
  flavour: `<b>"Something</b> happens when it goes off. Want to find out what?"`,
  subtypes: ["tactic", "evade"],
  faction: FACTION_CRIMINAL,
  image: "img/card/event/empDevice.png",
  cost: 4,
  skills: ["strength"],
  preventAttacks: true,
  canPlay(source) {
    const success = Enemy.getEngagedEnemies().length > 0;
    return {
      success: success,
      reason: success ? null : "There are no enemies at your current location.",
    };
  },
  async onPlay(source, data) {
    const locations = Location.getCurrentLocation().neighbours;
    for (const enemy of Enemy.getEngagedEnemies()) {
      await enemy.evade();
    }
    for (const enemy of Enemy.getEnemiesAtCurrentLocation()) {
      await enemy.addDamage(1);
      await enemy.moveTo(randomElement(locations));
    }
  },
});

CardInsideJob = new EventData("inside_job", {
  title: "Inside Job",
  text: "<b>Jack in.</b> If successful, instead download 1 data at an adjacent location.",
  subtypes: ["tactic"],
  faction: FACTION_CRIMINAL,
  image: "img/card/event/bgCriminal.png",
  illustrator: "Illustrator: PiCat",
  cost: 2,
  skills: ["mu"],
  canPlay(source) {
    const locations = Location.getCurrentLocation().neighbours;
    const success = locations.some((location) => location.clues > 0);
    return {
      success: success,
      reason: success
        ? null
        : "There is no data at any neighbouring locations.",
    };
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
  subtypes: ["tactic", "attack"],
  faction: FACTION_CRIMINAL,
  image: "img/card/event/push.png",
  cost: 0,
  skills: ["strength"],
  preventAttacks: true,
  canPlay(source) {
    const success = Enemy.getEnemiesAtCurrentLocation().length > 0;
    return {
      success: success,
      reason: success ? null : "There are no enemies at your current location.",
    };
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
  text: "Move twice. Enemies at those locations do not engage you.",
  subtypes: ["talent", "stealth"],
  faction: FACTION_CRIMINAL,
  image: "img/card/event/bgCriminal.png",
  illustrator: "Illustrator: Lish",
  cost: 1,
  skills: ["link"],
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
