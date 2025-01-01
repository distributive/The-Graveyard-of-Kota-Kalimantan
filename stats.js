class Stats {
  static #link = -1;
  static #mu = -1;
  static #influence = -1;
  static #strength = -1;
  static #clicks = -1;
  static #credits = -1;
  static #clues = -1;

  static getBase(stat) {
    return stat == "link"
      ? Stats.link
      : stat == "mu"
      ? Stats.mu
      : stat == "influence"
      ? Stats.influence
      : stat == "strength"
      ? Stats.strength
      : 0;
  }

  static getName(stat) {
    return stat == "link"
      ? "Link"
      : stat == "mu"
      ? "MU"
      : stat == "influence"
      ? "Influence"
      : stat == "strength"
      ? "Strength"
      : 0;
  }

  static get link() {
    return this.#link;
  }
  static get mu() {
    return this.#mu;
  }
  static get influence() {
    return this.#influence;
  }
  static get strength() {
    return this.#strength;
  }

  static set link(value) {
    $("#link-count").html(value);
    if (this.#link != value) {
      animate($("#link-count"));
    }
    this.#link = value;
  }
  static set mu(value) {
    $("#mu-count").html(value);
    if (this.#mu != value) {
      animate($("#mu-count"));
    }
    this.#mu = value;
  }
  static set influence(value) {
    $("#influence-count").html(value);
    if (this.#influence != value) {
      animate($("#influence-count"));
    }
    this.#influence = value;
  }
  static set strength(value) {
    $("#strength-count").html(value);
    if (this.#strength != value) {
      animate($("#strength-count"));
    }
    this.#strength = value;
  }

  static get credits() {
    return this.#credits;
  }
  static async addCredits(value) {
    await this.setCredits(this.#credits + value);
  }
  static async setCredits(value) {
    $("#credit-count").html(value);
    if (this.#credits != value) {
      animate($("#credit-count"));
    }

    // Update value
    const oldCredits = this.#credits;
    this.#credits = value;

    // Broadcast event
    if (value > oldCredits) {
      await Broadcast.signal("onGainCredits", {
        old: oldCredits,
        new: value,
        increase: value - oldCredits,
      });
    } else {
      await Broadcast.signal("onLoseCredits", {
        old: oldCredits,
        new: value,
        decrease: oldCredits - value,
      });
    }
  }

  static get clues() {
    return this.#clues;
  }
  static addClues(value) {
    this.setClues(this.#clues + value);
  }
  static setClues(value) {
    $("#clue-count").html(value);
    if (this.#clues != value) {
      animate($("#clue-count"));
    }
    this.#clues = value;
  }

  static get clicks() {
    return this.#clicks;
  }
  static async addClicks(value) {
    await this.setClicks(this.#clicks + value);
  }
  static async setClicks(value) {
    if (value != this.#clicks) {
      const inc = value > this.#clicks;
      const classes = `inline-icon click-tracker ${
        inc ? "bouncy" : "anti-bouncy"
      }`;
      $("#click-count").empty();
      for (let i = 0; i < value; i++) {
        $("#click-count").append(
          `<img src="img/game/${
            i < 3 ? "click" : "clickExtra"
          }.png" class="${classes}" title="click" />`
        );
        $("#click-count").append(" ");
      }
      for (let i = value; i < 3; i++) {
        $("#click-count").append(
          `<img src="img/game/clickSpent.png" class="${classes}" title="click" />`
        );
        $("#click-count").append(" ");
      }
      setTimeout(function () {
        if (inc) {
          animate($(".click-tracker"));
        } else {
          animate($(`.click-tracker:nth-child(${value + 1})`), 200);
        }
      }, 1); // Wait 1ms to ensure the animation doesn't start preloaded

      // Update value
      const oldClicks = this.#clicks;
      this.#clicks = value;

      // Broadcast event
      if (inc) {
        await Broadcast.signal("onGainClicks", {
          old: oldClicks,
          new: value,
          increase: value - oldClicks,
        });
      } else {
        await Broadcast.signal("onLoseClicks", {
          old: oldClicks,
          new: value,
          decrease: oldClicks - value,
        });
      }
    }
  }
}
