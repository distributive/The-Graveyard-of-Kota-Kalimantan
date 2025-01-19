class Identity {
  static #cardData;
  static #damage = 0;
  static #doom = 0;

  static get cardData() {
    return this.#cardData;
  }
  static get health() {
    return this.cardData.health;
  }
  static get damage() {
    return this.#damage;
  }
  static get doom() {
    return this.#doom;
  }

  static setCard(cardData, doAnimate = true, fast = true) {
    this.#cardData = cardData;
    $("#runner-id").data("card-id", cardData.id);
    if (doAnimate) {
      Cards.flip($("#runner-id .card-image"), cardData.image, fast);
    } else {
      $("#runner-id .card-image").attr("src", cardData.image, fast);
    }
  }

  static setDamage(value, doAnimate = true) {
    const jDamage = $("#runner-id .damage");
    if (value == 0) {
      jDamage.hide();
    } else {
      jDamage.show();
    }
    jDamage.html(value);
    if (value != this.#damage && doAnimate) {
      animate(jDamage, 500);
    }
    this.#damage = value;
    return this;
  }
  static addDamage(value, doAnimate = true) {
    this.setDamage(this.#damage + value, doAnimate);
  }

  static setDoom(value, doAnimate = true) {
    const jDoom = $("#runner-id .doom");
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
  static addDoom(value, doAnimate = true) {
    this.setDoom(this.#doom + value, doAnimate);
  }

  // Does nothing if the ID is unusable
  static markUsable() {
    const cardData = this.cardData;
    if (this.cardData.canUse(this)) {
      $("#runner-id")
        .addClass("selectable")
        .off("click")
        .click(async function () {
          await cardData.onUse(this);
          if (!Game.checkTurnEnd()) {
            UiMode.setMode(UIMODE_SELECT_ACTION);
          }
        });
    } else {
      $("#runner-id").removeClass("selectable").off("click");
    }
  }

  static markUnusable() {
    $("#runner-id").removeClass("selectable").off("click");
  }
}

///////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  Identity.setDamage(Identity.damage);
  Identity.setDoom(Identity.doom);
});
