class Act {
  static #cardData;

  static get cardData() {
    return this.#cardData;
  }

  static setCard(cardId, doAnimate = true) {
    this.#cardData = CardData.getCard(cardId);
    $("#act").data("card-id", cardId);
    if (doAnimate) {
      Cards.flip($("#act .card-image"), this.#cardData.image);
    } else {
      $("#act .card-image").attr("src", this.#cardData.image);
    }
  }

  static async advance() {
    await this.#cardData.advance();
    Broadcast.signal("onActAdvanced", {});
  }
}

///////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  // Act.setCard("the_catalyst", false);
});
