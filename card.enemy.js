const EnemyRat = new EnemyData("rat", {
  title: "Rat",
  text: "Hunter.\nWhen this attacks, do 1 damage.",
  flavour: `"eep"`,
  subtypes: ["creature"],
  faction: FACTION_MEAT,
  image: "img/card/enemy/rat.png",
  strength: 1,
  health: 1,
  link: 3,
  isHunter: true,
  attackEffect: AUDIO_ATTACK_RAT,
  async attack() {
    await Game.sufferDamage(1, "Rat");
  },
});

const EnemyNetRat = new EnemyData("net_rat", {
  title: "R.A.T",
  text: "Hunter.\n{sub} Do 1 damage.",
  flavour: `"33P"`,
  subtypes: ["ice"],
  faction: FACTION_NET,
  image: "img/card/enemy/netRat.png",
  strength: 2,
  health: 2,
  link: 4,
  isHunter: true,
  attackEffect: AUDIO_ATTACK_RAT,
  async attack() {
    await Game.sufferDamage(1, "R.A.T");
  },
});

const EnemyBurkeBug = new EnemyData("burke_bug", {
  title: "Burke Bug",
  text: "Hunter.\n{sub} Do 1 damage.",
  flavour: "Freaking annoying.",
  subtypes: ["ice"],
  faction: FACTION_NET,
  image: "img/card/enemy/burkeBug.png",
  strength: 3,
  health: 3,
  link: 3,
  isHunter: true,
  attackEffect: AUDIO_ATTACK_BUG,
  async attack() {
    await Game.sufferDamage(1, "Burke Bug");
  },
});

const EnemyAnansi = new EnemyData("anansi", {
  title: "The Spider",
  text: "Whenever you evade this enemy, lose 2 data.\n{sub} Do 1 damage.\n{sub} Do 3 damage unless the Runner loses 2 data.",
  flavour: "Once caught in its web, some part of you is trapped forever.",
  subtypes: ["ice"],
  faction: FACTION_NET,
  image: "img/card/enemy/anansi.png",
  strength: 5,
  health: 4,
  link: 4,
  attackEffect: AUDIO_ATTACK_SPIDER,
  async attack() {
    await Game.sufferDamage(1, "The Spider");
    const alert = Alert.send(
      "The Spider: Suffer 3 damage or lose 2 data?",
      ALERT_INFO,
      false,
      true,
      [
        new Option("damage", "Suffer 3 damage"),
        new Option("clues", "Lose 2 data", Stats.clues < 2 ? "disabled" : null),
      ]
    );
    choice = await alert.waitForOption();
    alert.close();
    if (choice == "damage") {
      await Game.sufferDamage(3, "The Spider");
    } else {
      await Stats.addClues(-2);
    }
  },
  async onPlayerEvades(source, data) {
    if (data.enemy != source) {
      return;
    }
    if (!data.results || data.results.success) {
      await Stats.addClues(-2);
    }
  },
});

const EnemyArcher = new EnemyData("archer", {
  title: "Incoming Shot",
  text: "Whenever you fail to attack or evade this, it attacks.\nAfter this attacks or is evaded, defeat it.\n{sub} Do 2 damage.",
  flavour: `"Duck!"`,
  subtypes: ["ice"],
  faction: FACTION_NET,
  image: "img/card/enemy/archer.png",
  strength: 6,
  health: 1,
  link: 3,
  attackEffect: AUDIO_ATTACK_ARROW,
  async attack(source, data) {
    await Game.sufferDamage(2, "Incoming Shot");
    await source.setDamage(1000);
  },
  async onPlayerAttacks(source, data) {
    if (!data.results.success && data.enemy == source) {
      await source.attack();
    }
  },
  async onPlayerEvades(source, data) {
    if (data.enemy == source) {
      if (!data.results || data.results.success) {
        await source.setDamage(1000);
      } else {
        await source.attack();
      }
    }
  },
});

const EnemyHydra = new EnemyData("hydra", {
  title: "Head of a Beast",
  text: "At the end of the each turn, if this is damaged, heal it and summon a copy.\n{sub} The Runner loses 3{c}.\n{sub} If the Runner has no credits, do 3 damage.",
  flavour: `"One neck wrapped around my leg, another grabbed my waist. I was only able to escape by ripping my BMI out before it reached my arms."`,
  subtypes: ["ice"],
  faction: FACTION_NET,
  image: "img/card/enemy/hydra.png",
  strength: 4,
  health: 3,
  link: 3,
  async attack() {
    await Stats.addCredits(-3);
    if (Stats.credits <= 0) {
      await Game.sufferDamage(3, "Head of a Beast");
    }
  },
  async onTurnEnd(source, data) {
    if (source.damage > 0) {
      source.setDamage(0);
      await Enemy.spawn(EnemyHydra, source.location);
    }
  },
});

const EnemyArchitect = new EnemyData("architect", {
  title: "The Designer",
  text: "Hunter.\nAt the end of your turn, if this is engaged with you, draw an encounter card.",
  flavour: "Were these pathways built or discovered.",
  subtypes: ["ice"],
  faction: FACTION_NET,
  image: "img/card/enemy/architect.png",
  strength: 0,
  health: 10,
  link: 4,
  isHunter: true,
  attackEffect: AUDIO_ATTACK_DESIGNER,
  async attack() {},
  async onTurnEnd(source, data) {
    if (source.engaged) {
      await Encounter.draw();
    }
  },
});

const EnemySurveyor = new EnemyData("surveyor", {
  title: "The Watcher",
  text: "Hunter.\nThis has +2 {strength} and +2 {link} for each enemy engaged with you.\n{sub} Do 1 damage.\n{sub} Do 1 damage.",
  subtypes: ["ice", "observer"],
  faction: FACTION_NET,
  image: "img/card/enemy/surveyor.png",
  strength: 0,
  health: 4,
  link: 0,
  calculateStrength(source) {
    return Enemy.getEngagedEnemies(source.location).length * 2;
  },
  calculateLink(source) {
    return Enemy.getEngagedEnemies(source.location).length * 2;
  },
  isHunter: true,
  attackEffect: AUDIO_ATTACK_SPIDER,
  async attack() {
    await Game.sufferDamage(2, "The Watcher");
  },
  // This is the only enemy with variable stats, so we're cheating a little and implementing the visualisation of them here
  async onEnemySpawns(source, data) {
    source.updateStats();
  },
  async onEnemyMoves(source, data) {
    source.updateStats();
  },
  async onEnemyDies(source, data) {
    source.updateStats();
  },
  async onPlayerEngages(source, data) {
    source.updateStats();
  },
  async onPlayerEvades(source, data) {
    source.updateStats();
  },
});

const EnemyDataRaven = new EnemyData("data_raven", {
  title: "The Bird",
  text: "Hunter.\n{sub} Do 4 damage unless the Runner pays 3{c}.",
  flavour: "If you hear it's caw, it's too late.",
  subtypes: ["ice"],
  faction: FACTION_NET,
  image: "img/card/enemy/dataRaven.png",
  strength: 4,
  health: 2,
  link: 2,
  isHunter: true,
  attackEffect: AUDIO_ATTACK_BIRD,
  async attack() {
    if (Stats.credits >= 3) {
      const options = [
        new Option("credit", "Spend 3 credits"),
        new Option("damage", "Suffer 4 damage"),
      ];
      const alert = Alert.send(
        "The Bird: Spend 3 credits to prevent 4 damage?",
        ALERT_INFO,
        false,
        true,
        options
      );
      const choice = await alert.waitForOption();
      alert.close();
      if (choice == "credit") {
        await Stats.addCredits(-3);
        return;
      }
    }
    await Game.sufferDamage(4, "The Bird");
  },
});

const EnemyHantu = new EnemyData("hantu", {
  title: "Hantu",
  text: "Hunter.\nWhen this enemy is defeated, escape the simulation (win).\n{sub} Do 1 damage.\n{sub} Discard 2 random cards. Do 1 damage for each card that cannot be discarded.",
  flavour: "UNWRITTEN",
  subtypes: ["ice", "elite"],
  faction: FACTION_NET,
  image: "img/card/enemy/hantu.png",
  illustrator: "Illustrator: Júlio Rocha",
  strength: 5,
  health: 12,
  link: 4,
  isHunter: true,
  smallText: true,
  attackEffect: AUDIO_ATTACK_BOSS,
  deathEffect: AUDIO_DEATH_BOSS,
  async attack() {
    await Game.sufferDamage(1, "Hantu");
    const extraDamage = Math.max(0, 2 - Cards.grip.length);
    await Cards.discardRandom(2);
    if (extraDamage > 0) {
      await Game.sufferDamage(extraDamage, "Hantu");
    }
  },
  async onEnemyDies(source, data) {
    if (source != data.enemy) return;
    Ending.show(ENDING_GOOD);
  },
  async onTurnEnd(source, data) {
    if (Stats.clues > 0) {
      await Stats.addClues(-1);
      await source.addDamage(1);
    }
  },
});
