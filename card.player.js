const CardTheCatalyst = new EventData("the_catalyst", {
  title: "The Catalyst",
  text: "Start the game with a random deck of cards containing no duplicates.",
  subtypes: ["natural"],
  faction: FACTION_NEUTRAL,
  image: "img/card/identity/theCatalyst.png",
  influence: 4,
  mu: 4,
  strength: 4,
  link: 4,
});

const CardTopan = new EventData("topan", {
  title: "Topan: Vigilante Enforcer",
  text: "Once per turn → {click}: Install a card from your hand, paying 2{c} less, then discard a random card.",
  subtypes: ["natural"],
  faction: FACTION_ANARCH,
  image: "img/card/identity/topan.png",
  influence: 4,
  mu: 3,
  strength: 4,
  link: 3,
});

const CardBaz = new EventData("baz", {
  title: "Baz: Mob Boss",
  text: "The first time each turn an enemy is summoned, you may install a card.",
  subtypes: ["cyborg"],
  faction: FACTION_CRIMINAL,
  image: "img/card/identity/baz.png",
  influence: 4,
  mu: 3,
  strength: 3,
  link: 4,
});

const CardDewi = new EventData("dewi", {
  title: "Dewi: Puppeteer",
  text: "When you move, and when your turn ends, flip this identity.",
  subtypes: ["natural"],
  faction: FACTION_SHAPER,
  image: "img/card/identity/dewi.png",
  influence: 5,
  mu: 2,
  strength: 5,
  link: 2,
});
const CardDewiBack = new EventData("dewi_back", {
  title: "Dewi: Puppet",
  text: "When you move, and when your turn ends, flip this identity.",
  subtypes: ["natural"],
  faction: FACTION_SHAPER,
  image: "img/card/identity/dewi_back.png",
  influence: 2,
  mu: 5,
  strength: 2,
  link: 5,
});

// Dev cards

const CardSelfDamage = new EventData("self_damage", {
  title: "Self Damage",
  text: "Suffer 1 damage.",
  subtypes: ["dev", "test"],
  faction: FACTION_ANARCH,
  image: "img/card/event/bgAnarch.png",
  cost: 0,
  onPlay: async (card) => {
    await Game.sufferDamage(1);
  },
});

const CardUnderTheHood = new AssetData("under_the_hood", {
  title: "Under the Hood",
  text: "This asset does nothing.",
  subtypes: ["dev", "test"],
  faction: FACTION_NEUTRAL,
  image: "img/card/asset/bgNeutral.png",
  cost: 2,
  health: 2,
});
