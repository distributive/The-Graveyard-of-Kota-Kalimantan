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

  static randomToken() {
    return this.#chaosTokens[
      Math.floor(Math.random() * this.#chaosTokens.length)
    ];
  }

  static performCheck(stat, target) {
    const base = Stats.getBase(stat);
    const token = this.randomToken();
    let value;
    if (token == "fail") {
      value = 0;
    } else if (token == "skull") {
      value = base; // TODO: damage
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
    };
  }

  static runModal(stat, target, canCancel, title, description, callback) {
    const base = Stats.getBase(stat);
    const chaosTokens = this.#chaosTokens;
    let intervalID;

    // First panel
    const runFirstPanel = function () {
      const header = title;
      const body = `
      <p>You are rolling ${Stats.getName(
        stat
      )} with a target of ${target}. Your base ${Stats.getName(
        stat
      )} value is ${base}.</p>
      ${description ? description : ""}
      <p>Your chaos pool contains:
      <br>
        <span class="ms-3">
          ${chaosTokens
            .map((token) =>
              token == "elder"
                ? `<img class="inline-token" src="img/game/tokenElder.png" />`
                : token == "fail"
                ? `<img class="inline-token" src="img/game/tokenFail.png" />`
                : token == "skull"
                ? `<img class="inline-token" src="img/game/tokenSkull.png" />`
                : token
            )
            .join(", ")}
        </span>
      </p>
      `;
      const options = [new Option("Continue", runSecondPanel)];
      if (canCancel) {
        options.push(new Option("Cancel", "close", "warning w-100"));
      }
      new Modal(null, header, body, options, canCancel).display();
    };

    // Second panel
    const runSecondPanel = function () {
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
      const options = [new Option("Pick a random token", runThirdPanel)];
      new Modal(null, header, body, options, false).display();

      intervalID = setInterval(function () {
        const randomToken = Chaos.randomToken();
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
      }, 150);
    };

    // Third panel
    const runThirdPanel = function () {
      clearInterval(intervalID);
      const { success, token, value } = Chaos.performCheck("mu", target);

      const analysis =
        token == "elder"
          ? "You rolled the elder sign, and automatically win!"
          : token == "skull"
          ? success
            ? `You rolled a skull! Your base MU (${base}) was unaffected and you succeeded!`
            : `You rolled a skull! Your base MU (${base}) is unaffected and you failed! You suffer 1 damage.`
          : token == "fail"
          ? "You rolled the auto-fail token. You automatically failed this test with a final value of 0."
          : token < 0
          ? `You rolled ${base} - ${Math.abs(
              token
            )}. Your final value is ${value}.`
          : `You rolled ${base} + ${token}. Your final value is ${value}.`;

      const header = success ? "Success!" : "Failure...";
      const body = `
      <div id="chaos-roll">
        <img id="chaos-roll-image" src="img/game/chaosToken.png" />
        <img id="chaos-roll-elder" src="img/game/tokenElder.png" />
        <img id="chaos-roll-fail" src="img/game/tokenFail.png" />
        <img id="chaos-roll-skull" src="img/game/tokenSkull.png" />
        <div id="chaos-roll-text">${token}</div>
        <img id="chaos-roll-fade-in" src="img/game/chaosToken.png" />
      </div>
      <p>${analysis}</p>
      `;
      const options = [
        new Option("Continue", function () {
          if (callback) {
            callback({ success: success, token: token, value: value });
          }
        }),
      ];
      new Modal(null, header, body, options, false).display();

      if (typeof token == "string") {
        $("#chaos-roll").addClass(token);
        $("#chaos-roll-text").html("");
      } else {
        $("#chaos-roll-text").html(token);
        if (token < 0) {
          $("#chaos-roll").addClass("negative");
        }
      }
    };

    runFirstPanel();
  }
}
