class Chaos {
  static #chaosTokens = [
    1,
    1,
    0,
    0,
    0,
    -1,
    -1,
    -1,
    -2,
    -2,
    "skull",
    "skull",
    "skull",
    "fail",
    "elder",
  ];
  static #seed = 0;

  // SERIALISATION
  static serialise() {
    return {
      seed: this.#seed,
      tokens: this.#chaosTokens,
    };
  }
  static deserialise(json) {
    this.#seed = json.seed;
    this.#chaosTokens = json.tokens;
  }

  // SEEDING
  static randomiseSeed() {
    this.#seed = randomInt(0, 65536);
  }

  // UTIL
  static randomToken() {
    const token = randomElementSeeded(this.#chaosTokens, this.#seed);
    this.randomiseSeed();
    return token;
  }
  static trueRandomToken() {
    return randomElement(this.#chaosTokens);
  }
  static randomSuccessToken(minimum) {
    const successfulTokens = this.#chaosTokens.filter(
      (token) =>
        token == "elder" ||
        (minimum <= 0 && token == "skull" && !Tutorial.active) ||
        (typeof token == "number" && token >= minimum)
    );
    const token = randomElementSeeded(successfulTokens, this.#seed);
    this.randomiseSeed();
    return token;
  }
  static randomFailToken(minimum) {
    const failingTokens = this.#chaosTokens.filter(
      (token) =>
        token == "fail" ||
        (minimum > 0 && token == "skull" && !Tutorial.active) ||
        (typeof token == "number" && token < minimum)
    );
    const token = randomElementSeeded(failingTokens, this.#seed);
    this.randomiseSeed();
    return token;
  }

  static performCheck(stat, base, target, forceOutcome) {
    if (base == null) {
      base = Stats.getBase(stat);
    }
    const token =
      forceOutcome == "success"
        ? this.randomSuccessToken(target - base)
        : forceOutcome == "fail"
        ? this.randomFailToken(target - base)
        : this.randomToken();
    let value;
    if (token == "fail") {
      value = 0;
    } else if (token == "skull") {
      value = base;
    } else if (token == "elder") {
      value = target;
    } else {
      value = base + token;
    }
    const success = token != "fail" && value >= target;
    return {
      success: success,
      token: token,
      value: value,
      target: target,
    };
  }

  // FRONTEND
  static async runModal(data) {
    let { stat, base, target, canCancel, title, description, forceOutcome } =
      data;
    if (base == null) {
      base = Stats.getBase(stat);
    }
    if (description && description.length && description[0] != "<") {
      description = `<p>${description}</p>`;
    }
    const chaosTokens = this.#chaosTokens;
    let intervalID;
    let response; // The option ID selected in each modal

    // First panel
    {
      const header = title;
      const body = `
      <p>You are rolling ${Stats.getName(
        stat
      )} with a target of ${target}. Your base ${Stats.getSymbol(
        stat
      )} value is ${base}.</p>
      ${description ? description : ""}
      <p>You may commit ${Stats.getSymbol(
        stat
      )} cards to increase your base ${Stats.getName(stat)}.</p>
      <p>The chaos pool contains:
      <br>
        <span class="ms-3">
          ${this.stringifyTokens()}
        </span>
      </p>
      `;
      const options = [
        new Option("continue", "Continue"),
        new Option(
          "commit",
          "Commit Cards",
          Tutorial.active ? "disabled" : null
        ),
      ];
      if (canCancel) {
        options.push(new Option("cancel", "Cancel", "warning w-100"));
      }
      response = await new Modal({
        header: header,
        body: body,
        options: options,
        allowKeyboard: canCancel,
      }).display();
    }

    if (response == "cancel") {
      return;
    } else if (response == "commit") {
      const didRun = await Tutorial.run("commit");
      if (!didRun) {
        Modal.hide();
      }
      const validTargets = Cards.grip.filter(
        (card) =>
          !card.inPlay &&
          card.cardData.skills &&
          card.cardData.skills.includes(stat)
      );
      await UiMode.setMode(UIMODE_SELECT_GRIP_CARD, {
        message: `Select any number of cards to commit to this test. Each card committed with be discarded and grant you +1 ${Stats.getSymbol(
          stat
        )} to this skill test (your base ${Stats.getName(stat)} is ${base}).`,
        minCards: 0,
        maxCards: Cards.grip.length,
        canCancel: true,
        validTargets: validTargets,
      });
      if (UiMode.data.selectedCards) {
        base += UiMode.data.selectedCards.length;
        for (const card of UiMode.data.selectedCards) {
          await Cards.discard(card);
        }
      }
    }

    // Second panel
    {
      const header = title;
      const body = `
      <div id="chaos-roll" class="d-flex">
        <img id="chaos-roll-image" src="img/game/chaosToken.png" />
        <div id="chaos-roll-text">1</div>
        <img id="chaos-roll-elder" src="img/game/tokenElder.png" />
        <img id="chaos-roll-fail" src="img/game/tokenFail.png" />
        <img id="chaos-roll-skull" src="img/game/tokenSkull.png" />
      </div>
      `;
      const options = [new Option("continue", "Pick a random token")];

      intervalID = setInterval(function () {
        const randomToken = Chaos.trueRandomToken();
        $("#chaos-roll")
          .css("--x-offset", `${Math.random() * 2 - 1}px`)
          .css("--y-offset", `${Math.random() * 2 - 1}px`)
          .css("--rotate", `${Math.random() * 2 - 1}deg`)
          .removeClass();
        if (typeof randomToken == "string") {
          $("#chaos-roll").addClass(randomToken);
          $("#chaos-roll-text").html("");
        } else {
          $("#chaos-roll-text").html(randomToken);
          if (randomToken < 0) {
            $("#chaos-roll").addClass("negative");
          }
        }
        Audio.playEffect(randomElement(AUDIO_ROLLS));
      }, 150);

      await new Modal({
        header: header,
        body: body,
        options: options,
        allowKeyboard: false,
      }).display();
    }

    const results = Chaos.performCheck(stat, base, target, forceOutcome);
    const { success, token, value } = results;

    // Third panel
    {
      clearInterval(intervalID);

      const analysis =
        token == "elder"
          ? "You rolled the elder sign, and automatically win!"
          : token == "skull"
          ? success
            ? `You rolled a skull! Your base ${Stats.getName(
                stat
              )} (${base}) was unaffected and you succeeded!`
            : `You rolled a skull! Your base ${Stats.getName(
                stat
              )} (${base}) is unaffected and you failed! You suffer 1 damage.`
          : token == "fail"
          ? "You rolled the auto-fail token. You automatically failed this test with a final value of 0."
          : token < 0
          ? `You rolled ${base} - ${Math.abs(
              token
            )}. Your final value is ${value}.`
          : `You rolled ${base} + ${token}. Your final value is ${value}.`;

      const rollClass =
        typeof token == "string" ? token : token < 0 ? "negative" : "";
      const rollText = typeof token == "string" ? "" : token;

      const header = success ? "Success!" : "Failure...";
      const body = `
      <div id="chaos-roll" class="${rollClass}">
        <img id="chaos-roll-image" src="img/game/chaosToken.png" />
        <img id="chaos-roll-elder" src="img/game/tokenElder.png" />
        <img id="chaos-roll-fail" src="img/game/tokenFail.png" />
        <img id="chaos-roll-skull" src="img/game/tokenSkull.png" />
        <div id="chaos-roll-text">${rollText}</div>
        <img id="chaos-roll-fade-in" src="img/game/chaosToken.png" />
      </div>
      <p>${analysis}</p>
      `;
      const options = [new Option("continue", "Continue")];

      if (success) {
        Audio.playEffect(AUDIO_SUCCESS);
      } else {
        Audio.playEffect(AUDIO_FAIL);
      }

      await new Modal({
        header: header,
        body: body,
        options: options,
        allowKeyboard: false,
      }).display();
      Modal.hide();
    }

    await Broadcast.signal("onTestCompleted", { stat: stat, results: results });
    Game.logTurnEvent(success ? "testSuccess" : "testFail");

    if (token == "skull" && !success) {
      await Game.sufferDamage(1, "You failed a test with a skull token");
    }

    return results;
  }

  static stringifyTokens() {
    return this.#chaosTokens
      .map((token) =>
        token == "elder"
          ? `<img class="inline-token" src="img/game/tokenElder.png" />`
          : token == "fail"
          ? `<img class="inline-token" src="img/game/tokenFail.png" />`
          : token == "skull"
          ? `<img class="inline-token" src="img/game/tokenSkull.png" />`
          : token >= 0
          ? `+${token}`
          : token
      )
      .join(", ");
  }
}
