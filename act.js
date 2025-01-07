class Act {
  static #cardData;

  static get cardData() {
    return this.#cardData;
  }

  static setCard(cardId, doAnimate = true) {
    this.#cardData = CardData.getCard(cardId);
    if (doAnimate) {
      Cards.flip($("#act .card-image"), this.#cardData.image);
    } else {
      $("#act .card-image").attr("src", this.#cardData.image);
    }
  }

  static advance() {
    // TODO - implement advancing
  }
}
