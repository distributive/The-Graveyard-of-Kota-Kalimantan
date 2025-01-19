///////////////////////////////////////////////////////////////////////////////
// ASSETS

///////////////////////////////////////////////////////////////////////////////
// EVENTS

const CardFruitJuice = new EventData("fruit_juice", {
  title: "Fruit Juice",
  text: "Draw 3 cards.",
  subtypes: ["familiar"],
  faction: FACTION_SHAPER,
  image: "img/card/event/bgShaper.png",
  cost: 0,
  onPlay: async (card) => {
    await Cards.draw(3);
  },
});
