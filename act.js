class Act {
  static #cardData = Act1;

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
    await Broadcast.signal("onActAdvanced", {});
  }
}

///////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  // Set initial card data
  $("#act").data("card-id", Act.cardData.id);
});
