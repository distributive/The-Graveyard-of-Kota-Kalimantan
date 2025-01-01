const CardSureGamble = new EventData("sure_gamble");
CardSureGamble.title = "Sure Gamble";
CardSureGamble.text = "Gain 9{c}.";
CardSureGamble.subtypes = ["tactic", "gambit"];
CardSureGamble.faction = FACTION_NEUTRAL;
CardSureGamble.image = "img/card/eventPlaceholder.png";
CardSureGamble.cost = 5;
CardSureGamble.onPlay = (card) => {
  Stats.addCredits(9);
};

const CardUnderTheHood = new AssetData("under_the_hood");
CardUnderTheHood.title = "Under the Hood";
CardUnderTheHood.text = "This asset does nothing.";
CardUnderTheHood.subtypes = ["dev", "test"];
CardUnderTheHood.faction = FACTION_NEUTRAL;
CardUnderTheHood.image = "img/card/assetPlaceholder.png";
CardUnderTheHood.cost = 2;
CardUnderTheHood.health = 2;
