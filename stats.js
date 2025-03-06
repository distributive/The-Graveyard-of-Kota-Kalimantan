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

  static getSymbol(stat) {
    return `<img src="img/game/${stat}.png" class="inline-icon" />`;
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
    value = Math.max(0, value);

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
  static async addClues(value) {
    await this.setClues(this.#clues + value);
  }
  static async setClues(value) {
    value = Math.max(0, value);

    $("#clue-count").html(value);
    if (this.#clues != value) {
      animate($("#clue-count"));
    }

    // Update value
    const oldClues = this.#clues;
    this.#clues = value;

    // Broadcast event
    if (value > oldClues) {
      await Broadcast.signal("onGainClues", {
        old: oldClues,
        new: value,
        increase: value - oldClues,
      });
    } else {
      await Broadcast.signal("onLoseClues", {
        old: oldClues,
        new: value,
        decrease: oldClues - value,
      });
    }
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
          }.png" class="${classes}" />`
        );
        $("#click-count").append(" ");
      }
      for (let i = value; i < 3; i++) {
        $("#click-count").append(
          `<img src="img/game/clickSpent.png" class="${classes}" />`
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

  static serialise() {
    return {
      link: this.link,
      mu: this.mu,
      inf: this.influence,
      str: this.strength,
      clicks: this.clicks,
      credits: this.credits,
      clues: this.clues,
    };
  }

  static async deserialise(json) {
    this.link = json.link;
    this.mu = json.mu;
    this.influence = json.inf;
    this.strength = json.str;
    await this.setClicks(json.clicks);
    await this.setCredits(json.credits);
    this.setClues(json.clues);
  }
}

///////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  $("#chaos-bag-button").on("click", async function () {
    const body = `
      <p>
        Whenever you resolve a test, you pick a random token from the chaos pool. You then add the value of that token to the base value of that test (equal to your base stat in the relevant skill). If your final skill value is at least the value of the test, it succeeds.
      </p>
      <p>
        For example, if you test 4 <img class="inline-token" src="img/game/influence.png" />, and your base influence value is 3, you must pick a token with a value of at least 1 to succeed.
      </p>
      <p>
        Whenever you resolve a test, you may first commit cards from hand with the relevant skill icon along their side. Each card committed this way is discarded and adds 1 to your base skill value.
      </p>
      <p>
        Your chaos pool contains:
        <br>
        <span class="ms-3">
          ${Chaos.stringifyTokens()}
        </span>
      </p>
      <p class="mb-0">
        Special tokens:
      </p>
      <ul>
        <li><img class="inline-token" src="img/game/tokenElder.png" /> - Autowin: If you roll this token, automatically succeed the test.</li>
        <li><img class="inline-token" src="img/game/tokenFail.png" /> - Autofail: If you roll this token, automatically fail the test.</li>
        <li><img class="inline-token" src="img/game/tokenSkull.png" /> - Skull: +0. If you fail the test, suffer 1 damage.</li>
      </ul>
    `;
    const modal = new Modal(null, {
      header: "Chaos bag",
      body: body,
      options: [new Option("", "Close")],
      allowKeyboard: true,
      size: "lg",
    });
    await modal.display();
    Modal.hide();
  });
});
