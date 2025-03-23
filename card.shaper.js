///////////////////////////////////////////////////////////////////////////////
// ASSETS

///////////////////////////////////////////////////////////////////////////////
// EVENTS

const CardSoda = new EventData("soda", {
  title: "Soda",
  text: "Draw 3 cards.",
  flavour: "This product has been recalled.",
  subtypes: ["refreshing"],
  faction: FACTION_SHAPER,
  image: "img/card/event/bgShaper.png",
  cost: 0,
  skills: ["mu"],
  onPlay: async (card) => {
    await Cards.draw(3);
  },
});
