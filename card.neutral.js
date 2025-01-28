CardUnsureGamble = new EventData("unsureGamble", {
  title: "Unsure Gamble",
  text: "Test 0{influence}. If successful, gain 4{c}",
  subtypes: ["familiar", "gambit"],
  faction: FACTION_NEUTRAL,
  image: "img/card/event/offShoreFund.png",
  cost: 0,
  onPlay: async (card) => {
    const results = await Chaos.runModal({
      stat: "influence",
      target: 0,
      canCancel: false,
      title: "Unsure Gamble!",
      description: "If successful, you will gain 4 credits.",
      forceOutcome: "success", // Teehee
    });
    if (results.success) {
      await Stats.addCredits(4);
    }
  },
});
