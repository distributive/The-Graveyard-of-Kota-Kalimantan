class Encounter {
  static #encounterCards = [CardTestTreachery]; // TEMP

  static async draw(cardData, removeFromDeck = true) {
    return; // TEMP
    const index = cardData
      ? this.#encounterCards.indexOf(cardData)
      : randomIndex(this.#encounterCards);
    if (!cardData) {
      cardData = this.#encounterCards[index];
    }
    if (removeFromDeck && index > 0) {
      this.#encounterCards.splice(index, 1);
    }

    await new Modal(null, {
      header: "Random Encounter",
      body: `You encounter ${cardData.title}.`,
      options: [new Option("continue", "Resolve encounter")],
      allowKeyboard: false,
      cardData: cardData,
      size: "lg",
    }).display();
    Modal.hide();
    await cardData.onEncounter();
    Modal.hide();
  }
}
