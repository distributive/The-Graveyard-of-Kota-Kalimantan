const CardOffSureFund = new EventData("off_shore_fund", {
  title: "Off-Shore Fund",
  text: "Gain 9{c}.",
  subtypes: ["familiar", "gambit"],
  faction: FACTION_NEUTRAL,
  image: "img/card/event/bgNeutral.png",
  cost: 5,
  onPlay: async (card) => {
    await Stats.addCredits(9);
  },
});
