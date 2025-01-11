///////////////////////////////////////////////////////////////////////////////
// ASSETS

CardIllHaveWorse = new AssetData("ill_have_worse", {
  title: "I'll Have Worse!",
  text: "The first time each turn you would fail a test, you may trash a random card from your hand and suffer 1 damage to attempt that test again, testing against {strength} instead.",
  subtypes: ["unique"],
  unique: true,
  faction: FACTION_ANARCH,
  image: "img/card/asset/bgAnarch.png",
  cost: 3,
  health: 2,
  async onTestCompleted(source, data) {
    const { stat, results } = data;
    // TODO
  },
});

CardNol = new AssetData("nol", {
  title: "n0l",
  text: "Once per turn → {click}: Discard a random card. If you do, draw 1 card and gain 2{c}.",
  subtypes: ["unique"],
  unique: true,
  faction: FACTION_ANARCH,
  image: "img/card/asset/bgAnarch.png",
  cost: 1,
  health: 0,
  canUse(source, data) {
    return (
      !source.triggeredThisTurn && Stats.clicks > 0 && Cards.grip.length > 0
    );
  },
  async onUse(source, data) {
    source.triggeredThisTurn = true;
    await Stats.addClicks(-1);
    await Cards.discardRandom(1);
    await Cards.draw(1);
    await Stats.addCredits(2);
  },
  async onTurnEnd(source, data) {
    source.triggeredThisTurn = false;
  },
});

CardSifar = new AssetData("sifar", {
  title: "Sifar",
  text: "Once per turn → During a {strength} test, you may trash a random card from your hand to reduce the test value to 0. If you roll {elder}, {skull}, or {fail}, suffer 2 damage.",
  subtypes: ["console", "unique"],
  unique: true,
  faction: FACTION_ANARCH,
  image: "img/card/asset/bgAnarch.png",
  cost: 5,
  health: 0,
  // TODO
});

CardIceCarver = new AssetData("ice_carver", {
  title: "Ice Carver",
  text: "You get +1{strength}.",
  subtypes: ["familiar"],
  unique: false,
  faction: FACTION_ANARCH,
  image: "img/card/asset/bgAnarch.png",
  cost: 1,
  health: 1,
  async onCardInstalled(source, data) {
    const { card } = data;
    if (source != card) return;
    Stats.strength++;
  },
  async onAssetTrashed(source, data) {
    const { card } = data;
    if (source != card) return;
    Stats.strength--;
  },
});

CardMeniru = new AssetData("meniru", {
  title: "Meniru",
  text: "Whenever you fight, if you succeed the test by 3 or more, do 1 additional damage to that enemy.",
  subtypes: ["icebreaker"],
  unique: false,
  faction: FACTION_ANARCH,
  image: "img/card/asset/bgAnarch.png",
  cost: 3,
  health: 1,
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
  text: "When you install this, place 1 damage on it. At the end of your turn, remove 1 damage from this.",
  subtypes: [],
  unique: false,
  faction: FACTION_ANARCH,
  image: "img/card/asset/bgAnarch.png",
  cost: 2,
  health: 2,
  async onCardInstalled(source, data) {
    const { card } = data;
    if (source != card) return;
    source.addDamage(1);
  },
  async onTurnEnd(source, data) {
    const { card } = data;
    if (source != card) return;
    source.addDamage(-1);
  },
});

///////////////////////////////////////////////////////////////////////////////
// EVENTS

CardBackAway = new EventData("back_away", {
  title: "Back Away",
  text: "This costs 2{c} less for each enemy engaged with you.\nMove to an adjacent location. Engaged enemies do not attack.",
  subtypes: [""],
  faction: FACTION_ANARCH,
  image: "img/card/event/bgAnarch.png",
  cost: 8,
  calculateCost(source, data) {
    return this.cost - Enemy.getEngagedEnemies() * 2;
  },
  onPlay: async (card) => {
    // TODO - move location selection to ui mode
  },
});

CardBackupPlan = new EventData("backup_plan", {
  title: "Backup Plan",
  text: "Attack. If unsuccessful, before the enemy attacks, suffer 1 damage and evade the enemy. (It does not get to attack you.)",
  subtypes: [""],
  faction: FACTION_ANARCH,
  image: "img/card/event/bgAnarch.png",
  cost: 2,
  onPlay: async (card) => {
    await Enemy.actionFight(false, false);
  },
});

CardDownloadTheSigns = new EventData("download_the_signs", {
  title: "Download the Signs",
  text: "Jack in. Add your {strength} to your {mu} for this test. If successful, download an additional data from this location.",
  subtypes: [""],
  faction: FACTION_ANARCH,
  image: "img/card/event/bgAnarch.png",
  cost: 2,
});

CardGritAndDetermination = new EventData("grit_and_determination", {
  title: "Grit and Determination",
  text: "If you have already downloaded data this turn, download another data from your location.",
  subtypes: [""],
  faction: FACTION_ANARCH,
  image: "img/card/event/bgAnarch.png",
  cost: 3,
});

CardLastDitch = new EventData("last_ditch", {
  title: "Last Ditch",
  text: "If you have already downloaded data this turn, download another data from your location.",
  subtypes: [""],
  faction: FACTION_ANARCH,
  image: "img/card/event/bgAnarch.png",
  cost: 0,
});

CardMakeAnEntrance = new EventData("make_an_entrance", {
  title: "Make an Entrance",
  text: "Engage every enemy at your location.",
  subtypes: [""],
  faction: FACTION_ANARCH,
  image: "img/card/event/bgAnarch.png",
  cost: 0,
});

CardProjectile = new EventData("projectile", {
  title: "Projectile",
  text: "Trash an installed card then fight. Add the install cost of the trashed card to your {strength}.",
  subtypes: [""],
  faction: FACTION_ANARCH,
  image: "img/card/event/bgAnarch.png",
  cost: 1,
});

CardRepurpose = new EventData("repurpose", {
  title: "Repurpose",
  text: "Trash an installed card. Gain 3{c} and draw 3 cards.",
  subtypes: [""],
  faction: FACTION_ANARCH,
  image: "img/card/event/bgAnarch.png",
  cost: 0,
});

CardRepurpose = new EventData("take_inspiration", {
  title: "Take Inspiration",
  text: "Play only if you have failed a test this turn. Gain 2{c} and draw 2 cards.",
  subtypes: [""],
  faction: FACTION_ANARCH,
  image: "img/card/event/bgAnarch.png",
  cost: 0,
});
