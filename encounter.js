const TEST_ENCOUNTERS = [TreacheryRapidDecay];

const MEAT_ENCOUNTERS = [
  TreacheryClumsy,
  TreacheryFallingDebris,
  TreacheryFaultyHardware,
  TreacheryWhatWasThat,
  EnemyRat,
  EnemyRat,
  EnemyRat,
];

const NET_ENCOUNTERS = [
  TreacherySomethingInTheDark,
  EnemyNetRat,
  EnemyNetRat,
  EnemyArcher,
  EnemyArchitect,
  EnemyDataRaven,
  EnemyHydra,
];

class Encounter {
  static #encounterCards = TEST_ENCOUNTERS; //MEAT_ENCOUNTERS; // TEMP
  static skipEncounters = false;

  static async draw(cardData, removeFromDeck = true) {
    if (this.skipEncounters) {
      return;
    }

    // If a card is provided, draw that and don't affect the encounter deck; otherwise, choose a random valid encounter
    if (!cardData) {
      const validEncounters = this.#encounterCards.filter(
        (card) => card.type != TYPE_TREACHERY || card.canEncounter()
      );
      if (validEncounters.length == 0) {
        this.resetDeck(); // We assume there will be cards that can always be encountered in the full deck, so this should always work
      }
      let index = randomIndex(validEncounters);
      index = this.#encounterCards.indexOf(validEncounters[index]);
      cardData = this.#encounterCards[index];
      if (removeFromDeck && index > 0) {
        this.#encounterCards.splice(index, 1);
      }
    }

    // Juuuust in case, we have defaults
    if (!cardData) {
      cardData = Act.cardData == Act1 ? EnemyRat : EnemyNetRat;
    }

    await new Modal(null, {
      header: "Random Encounter",
      body: `You encounter ${cardData.title}.`,
      options: [new Option("continue", "Resolve encounter")],
      allowKeyboard: false,
      cardData: cardData,
      size: "lg",
    }).display();
    if (cardData.type == TYPE_ENEMY) {
      new Enemy(cardData, Location.getCurrentLocation());
    } else {
      // Cursed note: onEncounter has to close the modal itself if the encounter effect does not need one
      await cardData.onEncounter();
    }
    Modal.hide();
  }
}
