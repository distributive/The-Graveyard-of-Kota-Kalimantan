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
    Cards.flip(
      $("#runner-id .card-image-container"),
      cardData,
      doAnimate,
      fast
    );
  }

  static setDamage(value, doAnimate = true) {
    if (value < 0) {
      value = 0;
    }
    if (doAnimate && value > this.#damage) {
      animate($("#pain"), 500);
      Audio.playEffect(AUDIO_PAIN);
    }
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

  static async setDoom(value, doAnimate = true) {
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
    if (this.#doom < value) {
      await Broadcast.signal("onDoomPlaced", {
        doom: value,
        card: this,
        cardData: this.cardData,
      });
    }
    this.#doom = value;
    return this;
  }
  static async addDoom(value, doAnimate = true) {
    await this.setDoom(this.#doom + value, doAnimate);
  }

  // Does nothing if the ID is unusable
  static markUsable() {
    const cardData = this.cardData;
    const instance = this;
    if (this.cardData.canUse(this)) {
      $("#runner-id")
        .addClass("selectable")
        .off("click")
        .click(async function () {
          await cardData.onUse(instance);
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

  static get tapped() {
    return $("#runner-id").hasClass("tapped");
  }
  static set tapped(value) {
    if (value) {
      $("#runner-id").addClass("tapped");
    } else {
      $("#runner-id").removeClass("tapped");
    }
  }

  static serialise() {
    return {
      id: this.#cardData.id,
      damage: this.#damage,
      doom: this.#doom,
      tapped: this.tapped,
    };
  }

  static deserialise(json) {
    this.setCard(CardData.getCard(json.id), false);
    this.setDamage(json.damage, false);
    this.setDoom(json.doom);
    this.tapped = json.tapped;
  }
}
