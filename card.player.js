const CardOffSureFund = new EventData("off_shore_fund");
CardOffSureFund.title = "Off-Shore Fund";
CardOffSureFund.text = "Gain 9{c}.";
CardOffSureFund.subtypes = ["familiar", "gambit"];
CardOffSureFund.faction = FACTION_NEUTRAL;
CardOffSureFund.image = "img/card/offShoreFund.png";
CardOffSureFund.cost = 5;
CardOffSureFund.onPlay = async (card) => {
  await Stats.addCredits(9);
};

const CardFruitJuice = new EventData("fruit_juice");
CardFruitJuice.title = "Fruit Juice";
CardFruitJuice.text = "Draw 3 cards.";
CardFruitJuice.subtypes = ["familiar"];
CardFruitJuice.faction = FACTION_SHAPER;
CardFruitJuice.image = "img/card/fruitJuice.png";
CardFruitJuice.cost = 0;
CardFruitJuice.onPlay = async (card) => {
  await Cards.draw(3);
};

// Dev cards

const CardSelfDamage = new EventData("self_damage");
CardSelfDamage.title = "Self Damage";
CardSelfDamage.text = "Suffer 1 damage.";
CardSelfDamage.subtypes = ["dev", "test"];
CardSelfDamage.faction = FACTION_ANARCH;
CardSelfDamage.image = "img/card/selfDamage.png";
CardSelfDamage.cost = 0;
CardSelfDamage.onPlay = async (card) => {
  await Game.sufferDamage(1);
};

const CardUnderTheHood = new AssetData("under_the_hood");
CardUnderTheHood.title = "Under the Hood";
CardUnderTheHood.text = "This asset does nothing.";
CardUnderTheHood.subtypes = ["dev", "test"];
CardUnderTheHood.faction = FACTION_NEUTRAL;
CardUnderTheHood.image = "img/card/assetPlaceholder.png";
CardUnderTheHood.cost = 2;
CardUnderTheHood.health = 2;
