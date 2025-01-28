const CardTestTreachery = new TreacheryData("test_treachery", {
  title: "Test Treachery",
  text: "Lose 1{c}. Discard 1 card.",
  subtypes: ["hex"],
  image: "img/card/treachery/bg.png",
  async onEncounter() {
    await Stats.addCredits(-1);
    if (Cards.grip.length > 0) {
      await UiMode.setMode(UIMODE_SELECT_GRIP_CARD, {
        message: `Test Treachery: Select 1 card to discard.`,
        minCards: 1,
        maxCards: 1,
        canCancel: false,
      });
      await Cards.discard(UiMode.data.selectedCards[0]);
    }
  },
});

///////////////////////////////////////////////////////////////////////////////
// Meat

const CardRat = new EnemyData("rat", {
  title: "Test Treachery",
  text: "Lose 1{c}. Discard 1 card.",
  subtypes: ["hex"],
  image: "img/card/treachery/bg.png",
  async onEncounter() {
    await Stats.addCredits(-1);
    if (Cards.grip.length > 0) {
      await UiMode.setMode(UIMODE_SELECT_GRIP_CARD, {
        message: `Test Treachery: Select 1 card to discard.`,
        minCards: 1,
        maxCards: 1,
        canCancel: false,
      });
      await Cards.discard(UiMode.data.selectedCards[0]);
    }
  },
});

///////////////////////////////////////////////////////////////////////////////
// Net
