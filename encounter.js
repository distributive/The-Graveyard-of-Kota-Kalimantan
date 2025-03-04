const TEST_ENCOUNTERS = [EnemyRat, TreacheryWhatWasThat];

const MEAT_ENCOUNTERS = [
  TreacheryClumsy,
  TreacheryFallingDebris,
  TreacheryFaultyHardware,
  TreacheryWhatWasThat,
  EnemyRat,
  EnemyRat,
];

const NET_ENCOUNTERS = [
  TreacherySomethingInTheDark,
  TreacherySomethingInTheDark,
  TreacheryRapidDecay,
  EnemyArcher,
  EnemyArchitect,
  EnemyDataRaven,
  EnemyHydra,
];

// TODO - implement changing the encounter deck
class Encounter {
  static #encounterCards = [];
  static #discardedCards = [];
  static skipEncounters = false;

  static async draw(cardData, removeFromDeck = true) {
    if (this.skipEncounters || Tutorial.active) {
      return;
    }

    // First time explainer
    const firstTime = await Tutorial.run("encounter");
    if (firstTime) {
      await wait(1000); // Allow the tutorial window to close before opening a new one
    }

    // If a card is provided, draw that and don't affect the encounter deck; otherwise, choose a random valid encounter
    if (!cardData) {
      const validEncounters = this.#encounterCards.filter(
        (card) => card.type != TYPE_TREACHERY || card.canEncounter()
      );
      if (validEncounters.length == 0) {
        this.resetDeck(); // We assume there will be cards that can always be encountered in the full deck, so this should always work
      }
      if (validEncounters.length > 0) {
        const index = this.#encounterCards.indexOf(validEncounters[0]);
        cardData = this.#encounterCards[index];
        if (removeFromDeck && index >= 0) {
          this.#encounterCards.splice(index, 1);
          this.#discardedCards.push(cardData);
        }
      }
    }

    // Juuuust in case, we have defaults
    if (!cardData) {
      cardData = Story.isInNetspace ? EnemyNetRat : EnemyRat;
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
      Modal.hide();
      const enemy = new Enemy(cardData);
      await enemy.setLocation(Location.getCurrentLocation());
    } else {
      // Cursed note: onEncounter has to close the modal itself if the encounter effect does not need one
      await cardData.onEncounter();
      Modal.hide();
    }
  }

  static setPool(pool) {
    this.#encounterCards = pool;
    this.#discardedCards = [];
    shuffle(this.#encounterCards);
  }

  static resetDeck() {
    this.#encounterCards = this.#encounterCards.concat(this.#discardedCards);
    this.#discardedCards = [];
    shuffle(this.#encounterCards);
  }

  static serialise() {
    return {
      deck: this.#encounterCards.map((card) => card.id),
      discarded: this.#discardedCards.map((card) => card.id),
    };
  }

  static deserialise(json) {
    this.#encounterCards = json.deck.map((id) => CardData.getCard(id));
    this.#discardedCards = json.discarded.map((id) => CardData.getCard(id));
  }
}
