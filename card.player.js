const CardTheCatalyst = new IdentityData("the_catalyst", {
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

const CardTopan = new IdentityData("topan", {
  title: "Topan: Vigilante Enforcer",
  text: "Once per turn → {click}: Install a card from your hand, paying 2{c} less. Then, discard a card from your hand.",
  subtypes: ["natural"],
  faction: FACTION_ANARCH,
  image: "img/card/identity/topan.png",
  influence: 4,
  mu: 3,
  strength: 4,
  link: 3,
  canUse(source) {
    return (
      !source.tapped &&
      Cards.grip.some(
        (card) =>
          card.cardData.type == TYPE_ASSET &&
          Math.max(0, card.cardData.calculateCost(card) - 2) <= Stats.credits
      )
    );
  },
  async onUse(source) {
    source.tapped = true;
    await Stats.addClicks(-1);

    await UiMode.setMode(UIMODE_SELECT_GRIP_CARD, {
      message: `Topan: Select 1 card to install.`,
      minCards: 1,
      maxCards: 1,
      canCancel: false,
      validTargets: Cards.grip.filter(
        (card) =>
          card.cardData.type == TYPE_ASSET &&
          Math.max(0, card.cardData.calculateCost(card) - 2) <= Stats.credits
      ),
    });
    const rigCard = Cards.install(UiMode.data.selectedCards[0].cardData);
    await Stats.addCredits(
      -Math.max(0, UiMode.data.selectedCards[0].cardData.cost - 2)
    );
    Cards.removeGripCard(UiMode.data.selectedCards[0]);

    if (Cards.grip.length == 0) {
      return;
    }

    await UiMode.setMode(UIMODE_SELECT_GRIP_CARD, {
      message: `Topan: Select 1 card to discard.`,
      minCards: 1,
      maxCards: 1,
      canCancel: false,
    });
    await Cards.discard(UiMode.data.selectedCards[0]);
  },
  async onTurnEnd(source) {
    source.tapped = false;
  },
});

const CardBaz = new IdentityData("baz", {
  title: "Baz: Mob Boss",
  text: "The first time each turn an enemy is summoned, you may install a card.",
  subtypes: ["cyborg"],
  faction: FACTION_CRIMINAL,
  image: "img/card/identity/baz.png",
  influence: 4,
  mu: 3,
  strength: 2,
  link: 5,
});

const CardDewi = new IdentityData("dewi", {
  title: "Dewi: Puppeteer",
  text: "When you move, and when your turn ends, flip this identity.",
  subtypes: ["natural"],
  faction: FACTION_SHAPER,
  image: "img/card/identity/dewi.png",
  influence: 5,
  mu: 2,
  strength: 5,
  link: 2,
  async flip() {
    Stats.influence -= 3;
    Stats.mu += 3;
    Stats.strength -= 3;
    Stats.link += 3;
    Identity.setCard(CardDewiBack);
  },
  async onPlayerMoves(data, source) {
    this.flip();
  },
  async onTurnEnd(data, source) {
    this.flip();
  },
});
const CardDewiBack = new IdentityData("dewi_back", {
  title: "Dewi: Puppet",
  text: "When you move, and when your turn ends, flip this identity.",
  subtypes: ["natural"],
  faction: FACTION_SHAPER,
  image: "img/card/identity/dewi_back.png",
  influence: 2,
  mu: 5,
  strength: 2,
  link: 5,
  async flip() {
    Stats.influence += 3;
    Stats.mu -= 3;
    Stats.strength += 3;
    Stats.link -= 3;
    Identity.setCard(CardDewi);
  },
  async onPlayerMoves(data, source) {
    this.flip();
  },
  async onTurnEnd(data, source) {
    this.flip();
  },
});
