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
  image: "img/card/event/soda.png",
  illustrator: "Illustrator: Lish",
  cost: 0,
  skills: ["mu"],
  onPlay: async (card) => {
    await Cards.draw(3);
  },
});
