class Tooltip {
  static make(data, instant = false) {
    if (typeof data == "string") {
      return {
        content: data,
        delay: instant ? 0 : [500, 0],
        duration: [500, 100],
      };
    } else if (typeof data == "function") {
      return {
        onShow: data,
        delay: instant ? 0 : [500, 0],
        duration: [500, 100],
      };
    } else {
      data.delay = instant ? 0 : [500, 0];
      data.duration = [500, 100];
      return data;
    }
  }
}

///////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  tippy("#action-credit", Tooltip.make("Spend a click to gain a credit"));
  tippy("#action-draw", Tooltip.make("Spend a click to draw a card"));
  tippy(
    "#action-end-turn",
    Tooltip.make("Discard down to your handsize (8) then end your turn")
  );
  tippy(
    "#action-move",
    Tooltip.make("Spend a click to move to an adjacent location")
  );
  tippy(
    "#action-investigate",
    Tooltip.make(
      "Spend a click to jack into your current location: test your MU against the location's shroud; if successful, you will download 1 data"
    )
  );
  tippy(
    "#action-engage",
    Tooltip.make(
      "Spend a click to engage an enemy; while engaged, the enemy will attack you if you perform any action not interacting with an enemy and follow you if you move to another location"
    )
  );
  tippy(
    "#action-fight",
    Tooltip.make(
      "Spend a click to attack an enemy (the enemy will be engaged if it is not already): test your strength against the enemy's; if successful, do 1 damage"
    )
  );
  tippy(
    "#action-evade",
    Tooltip.make(
      "Spend a click to evade an enemy: test your link against the enemy's; if successful, disengage and exhaust the enemy"
    )
  );

  tippy(
    "#stat-influence",
    Tooltip.make(
      (instance) => instance.setContent(`Your influence (${Stats.influence})`),
      true
    )
  );
  tippy(
    "#stat-mu",
    Tooltip.make(
      (instance) => instance.setContent(`Your MU (${Stats.mu})`),
      true
    )
  );
  tippy(
    "#stat-strength",
    Tooltip.make(
      (instance) => instance.setContent(`Your strength (${Stats.strength})`),
      true
    )
  );
  tippy(
    "#stat-link",
    Tooltip.make(
      (instance) => instance.setContent(`Your link (${Stats.link})`),
      true
    )
  );
  tippy(
    "#chaos-bag-button-container",
    Tooltip.make("View the contents of the chaos bag")
  );

  tippy(
    "#click-count",
    Tooltip.make(
      "Your clicks; spend them to take actions or play cards from hand"
    )
  );

  tippy(
    "#act",
    Tooltip.make((instance) =>
      instance.setContent(
        `The current act; complete its requirement (${Act.cardData.textRequirement}) to advance (good)`
      )
    )
  );
  tippy(
    "#agenda",
    Tooltip.make((instance) => {
      if (Agenda.cardData == Agenda1) {
        return false;
      }
      instance.setContent(
        `The current agenda; each turn 1 doom is placed on this until it reaches its threshold (${
          Agenda.cardData.requirement
        }) and advances (${
          Agenda.cardData == Agenda4
            ? "this time it's good"
            : Agenda.cardData == Agenda3
            ? "very bad"
            : "bad"
        })`
      );
    })
  );
  tippy(
    "#runner-id",
    Tooltip.make(
      "Your identity card; this provides your base stats and a persistent ability or effect"
    )
  );

  tippy(
    "#stack",
    Tooltip.make(
      (instance) =>
        instance.setContent(
          `Your draw pile (${Cards.stack.length} card${
            Cards.stack.length == 1 ? "" : "s"
          })`
        ),
      true
    )
  );
  tippy(
    "#heap",
    Tooltip.make(
      (instance) =>
        instance.setContent(
          `Your discard pile (${Cards.heap.length} card${
            Cards.heap.length == 1 ? "" : "s"
          }) - when your deck is empty, shuffle this into it`
        ),
      true
    )
  );
});
