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

  static async setDoom(value, doAnimate = true) {
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
    const doomIncreasing = this.#doom < value;
    this.#doom = value;
    if (doomIncreasing) {
      await Broadcast.signal("onDoomPlaced", {
        doom: value,
        card: this,
        cardData: this.cardData,
      });
    }
    return this;
  }
  static async addDoom(value, doAnimate = true) {
    await this.setDoom(this.#doom + value, doAnimate);
  }

  static async advance() {
    await this.setDoom(0);
    await this.#cardData.advance();
    await Broadcast.signal("onAgendaAdvanced", {});
  }

  static serialise() {
    return {
      cardId: this.#cardData.id,
      doom: this.#doom,
    };
  }

  static async deserialise(json) {
    this.setCard(CardData.getCard(json.cardId), false);
    await this.setDoom(json.doom);
  }
}

///////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  // Set initial card data
  $("#agenda").data("card-id", Agenda.cardData.id);
});
