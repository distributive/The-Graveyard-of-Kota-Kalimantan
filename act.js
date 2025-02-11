class Act {
  static #cardData;

  static get cardData() {
    return this.#cardData;
  }

  static setCard(cardData, doAnimate = true) {
    this.#cardData = cardData;
    $("#act").data("card-id", cardData.id);
    Cards.flip($("#act .card-image-container"), this.#cardData, doAnimate);
  }

  static async advance() {
    await this.#cardData.advance();
    Broadcast.signal("onActAdvanced", {});
  }
}

///////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  // Act.setCard(CardTheCatalyst, false);
});
