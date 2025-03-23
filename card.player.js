const CardTheCatalyst = new IdentityData("the_catalyst", {
  title: "The Catalyst",
  text: "Start the game with a random deck of cards containing no duplicates.",
  flavour: `It's me! The Catalyst! From Gateway!"`,
  subtypes: ["natural"],
  faction: FACTION_NEUTRAL,
  image: "img/card/identity/theCatalyst.png",
  influence: 4,
  mu: 4,
  strength: 4,
  link: 4,
  health: 7,
});

const CardTopan = new IdentityData("topan", {
  title: "Topan: Vigilante Enforcer",
  text: "Once per turn → {click}: Install a card from your hand, paying 2{c} less. Then, discard a card from your hand.",
  flavour: `"Wherever you are; I will find you."`,
  subtypes: ["natural"],
  faction: FACTION_ANARCH,
  image: "img/card/identity/topan.png",
  influence: 4,
  mu: 3,
  strength: 4,
  link: 3,
  health: 8,
  canUse(source) {
    return (
      !Tutorial.active && // Inactive during the tutorial
      !source.tapped &&
      Cards.grip.some(
        (card) =>
          card.cardData.type == TYPE_ASSET &&
          Math.max(0, card.cardData.calculateCost(card) - 2) <= Stats.credits &&
          (!card.cardData.unique ||
            Cards.installedCards.every((c) => c.cardData != card.cardData))
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
          Math.max(0, card.cardData.calculateCost(card) - 2) <= Stats.credits &&
          (!card.cardData.unique ||
            Cards.installedCards.every((c) => c.cardData != card.cardData))
      ),
    });
    await Cards.install(UiMode.data.selectedCards[0].cardData);
    await Stats.addCredits(
      -Math.max(0, UiMode.data.selectedCards[0].cardData.cost - 2) // TODO: this will break if there is ever an asset with variable cost
    );
    Cards.removeGripCard(UiMode.data.selectedCards[0], true);

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
  title: "Baz: Crime Boss",
  text: "The first time each turn an enemy engages you, you may install a card.",
  flavour: '"Don\'t get in my way."',
  subtypes: ["cyborg"],
  faction: FACTION_CRIMINAL,
  image: "img/card/identity/baz.png",
  influence: 4,
  mu: 2,
  strength: 2,
  link: 5,
  health: 9,
  async onPlayerEngages() {
    // Inactive in the tutorial
    if (Tutorial.active) {
      return;
    }

    const validTargets = Cards.grip.filter(
      (card) =>
        card.cardData.type == TYPE_ASSET &&
        card.cardData.calculateCost(card) <= Stats.credits &&
        (!card.cardData.unique ||
          Cards.installedCards.every((c) => c.cardData != card.cardData))
    );

    if (validTargets.length == 0) {
      return;
    }

    await UiMode.setMode(UIMODE_SELECT_GRIP_CARD, {
      message: `Baz: Select 1 card to install (optional).`,
      minCards: 0,
      maxCards: 1,
      canCancel: true,
      validTargets: validTargets,
    });

    if (UiMode.data.selectedCards && UiMode.data.selectedCards.length > 0) {
      await Cards.install(UiMode.data.selectedCards[0].cardData);

      await Stats.addCredits(
        -UiMode.data.selectedCards[0].cardData.cost // TODO: this will break if there is ever an asset with variable cost
      );
      Cards.removeGripCard(UiMode.data.selectedCards[0], true);
    }
  },
});
