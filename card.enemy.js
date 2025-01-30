const EnemyExample = new EnemyData("example", {
  title: "Example",
  text: "",
  subtypes: [],
  faction: FACTION_NET,
  image: "img/card/enemy/bgAlt.png",
  strength: 3,
  health: 2,
  link: 1,
});

const EnemyRat = new EnemyData("rat", {
  title: "Rat",
  text: "When this attacks, do 1 damage.",
  subtypes: ["creature"],
  faction: FACTION_MEAT,
  image: "img/card/enemy/rat.png",
  strength: 1,
  health: 1,
  link: 1,
  async attack() {
    await Game.sufferDamage(1);
  },
});

const EnemyNetRat = new EnemyData("net_rat", {
  title: "R.A.T",
  text: "{sub} Do 1 damage.",
  subtypes: ["ice"],
  faction: FACTION_NET,
  image: "img/card/enemy/netRat.png",
  strength: 1,
  health: 1,
  link: 1,
  async attack() {
    await Game.sufferDamage(1);
  },
});

const EnemyBurkeBug = new EnemyData("burke_bug", {
  title: "Burke Bug",
  text: "{sub} Do 1 damage.",
  subtypes: ["ice"],
  faction: FACTION_NET,
  image: "img/card/enemy/burkeBug.png",
  strength: 1,
  health: 1,
  link: 1,
  async attack() {
    await Game.sufferDamage(1);
  },
});
