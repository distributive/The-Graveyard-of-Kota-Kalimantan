class Agenda {
  static #cardData;
  static #doom;

  static get cardData() {
    return this.#cardData;
  }

  static get doom() {
    return this.#doom;
  }

  static setCard(cardId, doAnimate = true) {
    this.#cardData = CardData.getCard(cardId);
    $("#agenda").data("card-id", cardId);
    Cards.flip($("#agenda .card-image-container"), this.#cardData, doAnimate);
  }

  static setDoom(value, doAnimate = true) {
    const jDoom = $("#agenda .doom");
    if (value == 0) {
      jDoom.hide();
    } else {
      jDoom.show();
    }
    jDoom.html(value);
    if (value != this.#doom && doAnimate) {
      animate(jDoom, 500);
    }
    this.#doom = value;
    return this;
  }
  static async addDoom(value, doAnimate = true) {
    this.setDoom(this.#doom + value, doAnimate);
  }

  static async advance() {
    await this.#cardData.advance();
    await this.setDoom(0);
    Broadcast.signal("onAgendaAdvanced", {});
  }
}

///////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  // Agenda.setCard("the_catalyst", false);
});
