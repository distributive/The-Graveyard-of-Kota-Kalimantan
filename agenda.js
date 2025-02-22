class Agenda {
  static #cardData = Agenda1; // Set directly to avoid animating (Agenda1 is blank and invisible)
  static #doom;

  static get cardData() {
    return this.#cardData;
  }

  static get doom() {
    return this.#doom;
  }

  static setCard(cardData, doAnimate = true) {
    this.#cardData = cardData;
    $("#agenda").data("card-id", cardData.id);
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
    await Broadcast.signal("onAgendaAdvanced", {});
  }

  static serialise() {
    return {
      cardId: this.#cardData.id,
      doom: this.#doom,
    };
  }

  static deserialise(json) {
    this.setCard(CardData.getCard(json.cardId), false);
    this.setDoom(json.doom);
  }
}

///////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  // Set initial card data
  $("#agenda").data("card-id", Agenda.cardData.id);
});
