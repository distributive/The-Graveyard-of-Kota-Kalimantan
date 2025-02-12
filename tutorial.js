let tutorial_i = 0;
const TUTORIAL_MODE_NONE = tutorial_i++;
const TUTORIAL_MODE_CREDIT = tutorial_i++;
const TUTORIAL_MODE_DRAW = tutorial_i++;
const TUTORIAL_MODE_MOVE = tutorial_i++;
const TUTORIAL_MODE_INVESTIGATE = tutorial_i++;
const TUTORIAL_MODE_ENGAGE = tutorial_i++;
const TUTORIAL_MODE_FIGHT = tutorial_i++;
const TUTORIAL_MODE_EVADE = tutorial_i++;
const TUTORIAL_MODE_PLAY_EVENT = tutorial_i++;
const TUTORIAL_MODE_INSTALL_ASSET = tutorial_i++;
const TUTORIAL_MODE_USE_ASSET = tutorial_i++;

///////////////////////////////////////////////////////////////////////////////

const TUTORIAL_MODE_TO_CLASS = {};
TUTORIAL_MODE_TO_CLASS[TUTORIAL_MODE_NONE] = "";
TUTORIAL_MODE_TO_CLASS[TUTORIAL_MODE_CREDIT] = "force-credit";
TUTORIAL_MODE_TO_CLASS[TUTORIAL_MODE_DRAW] = "force-draw";
TUTORIAL_MODE_TO_CLASS[TUTORIAL_MODE_MOVE] = "force-move";
TUTORIAL_MODE_TO_CLASS[TUTORIAL_MODE_INVESTIGATE] = "force-investigate";
TUTORIAL_MODE_TO_CLASS[TUTORIAL_MODE_ENGAGE] = "force-engage";
TUTORIAL_MODE_TO_CLASS[TUTORIAL_MODE_FIGHT] = "force-fight";
TUTORIAL_MODE_TO_CLASS[TUTORIAL_MODE_EVADE] = "force-evade";
TUTORIAL_MODE_TO_CLASS[TUTORIAL_MODE_PLAY_EVENT] = "force-play-event";
TUTORIAL_MODE_TO_CLASS[TUTORIAL_MODE_INSTALL_ASSET] = "force-install-asset";
TUTORIAL_MODE_TO_CLASS[TUTORIAL_MODE_USE_ASSET] = "force-use-asset";

///////////////////////////////////////////////////////////////////////////////

/**
Tutorial outline

Note: When the tutorial is active, you start with 0 cards in hand. 
- First turn
  - force-move (advance on move)
  - force-credit (advance on gain credits)
  - force-draw (advance on draw)
- End of first turn
  - (Note: there is no agenda yet)
  - Explain upkeep
- Second turn
  - Play an event (Unsure Gamble - explain tests)
  - Install an asset (TBD - maybe add a single neutral asset to all decks)
  - Use the installed card (okay yeah we should do that)
- End of second turn
  - Explain readying
- Third turn
  - force-move (reveal a location that has clues)
  - force-investigate (explain shroud - this test guaranteed to fail)
  - force-investigate (this test guaranteed to succeed - 1 clue fulfils the act requirement)
- End of third turn
  - The act progresses and the agenda is revealed (explain doom and wincons)
  - Act2 summons a rat
  - During the enemy phase it moves to you and engages (explain engaging)
- Fourth turn
  - force-evade (explain exhaustion - this test guaranteed to succeed - explain retaliate (or rather, that it's not the default))
  - force-engage
  - force-fight
- End of tutorial
 */

///////////////////////////////////////////////////////////////////////////////

class Tutorial {
  static #triggers = {};
  static #mode = TUTORIAL_MODE_NONE;

  // To exit tutorial mode, set it to null
  static async setMode(mode) {
    this.#mode = mode ? mode : TUTORIAL_MODE_NONE;
    $("#tutorial-flags").removeClass();
    if (this.#mode != TUTORIAL_MODE_NONE) {
      $("#tutorial-flags").addClass(TUTORIAL_MODE_TO_CLASS[mode]);
    }
  }

  static async signal(trigger, data) {
    if (
      this.#stageIndex < this.#stages.length - 1 &&
      this.#stages[this.#stageIndex].trigger == trigger
    ) {
      this.#stageIndex++;
      const stage = this.#stages[this.#stageIndex];
      if (!stage.modals) {
        return;
      }
      for (const page of stage.modals) {
        await new Modal(null, page).display();
      }
      Modal.hide();
      // TODO: if this causes problems, add a pause here
    }
  }

  static async run(trigger) {
    if (this.#triggers[trigger] || !this.#tutorials[trigger]) {
      return;
    }
    this.#triggers[trigger] = true;

    const tutorial = this.#tutorials[trigger].length
      ? this.#tutorials[trigger]
      : [this.#tutorials[trigger]];
    for (const page of tutorial) {
      await new Modal(null, page).display();
    }
    Modal.hide();
  }

  // Each tutorial stage defines a tutorial mode, a list of data collections to
  // be passed to new modals, and a trigger to wait for to progress to the next
  // stage
  static #stageIndex = 0;
  static #stages = [
    // Wait for the game to begin
    {
      mode: TUTORIAL_MODE_NONE,
      trigger: "onTurnStart",
      modals: [],
    },
    // Teach moving
    {
      mode: TUTORIAL_MODE_MOVE,
      trigger: "onPlayerMoves",
      modals: [
        {
          header: "Moving",
          body: "This is the first page. Leedle leedle leedle leedle leedle leedle leedle leedle leedle leedle leedle.",
          options: [new Option("next", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraHappy.png",
          slowRoll: true,
          size: "lg",
        },
      ],
    },
    // Teach credits
    {
      mode: TUTORIAL_MODE_CREDIT,
      trigger: "onGainCredits",
    },
    // Teach drawing
    {
      mode: TUTORIAL_MODE_DRAW,
      trigger: "onCardsDrawn",
    },
    // Explain upkeep
    {
      mode: TUTORIAL_MODE_NONE,
      trigger: "onTurnStart",
    },
    // Teach events + skill tests (Unsure Gamble should be the only event in hand)
    {
      mode: TUTORIAL_MODE_PLAY_EVENT,
      trigger: "onCardPlayed",
    },
    // Teach assets
    {
      mode: TUTORIAL_MODE_INSTALL_ASSET,
      trigger: "onCardInstalled",
    },
    // Teach using assets
    {
      mode: TUTORIAL_MODE_USE_ASSET,
      trigger: "onPlayerMoves", // TODO: trigger off whatever effect the asset has or add a new trigger for asset use
    },
    // Explain readying
    {
      mode: TUTORIAL_MODE_NONE,
      trigger: "onTurnStart",
    },
    // Move to a new location (with clues)
    {
      mode: TUTORIAL_MODE_MOVE,
      trigger: "onPlayerMoves",
    },
    // Investigate (forced fail)
    {
      mode: TUTORIAL_MODE_INVESTIGATE,
      trigger: "onInvestigation",
    },
    // Investigate (forced success)
    {
      mode: TUTORIAL_MODE_INVESTIGATE,
      trigger: "onTurnEnd",
    },
    // Explain advancing and agendas (the act will summon a rat)
    {
      mode: TUTORIAL_MODE_NONE,
      trigger: "onEnemyMoves",
    },
    // Explain enemies, the hunter keyword, and engaging
    {
      mode: TUTORIAL_MODE_NONE,
      trigger: "onTurnStart",
    },
    // Explain evasion (guaranteed success)
    {
      mode: TUTORIAL_MODE_EVADE,
      trigger: "onPlayerEvades",
    },
    // Explain the basic action to engage
    {
      mode: TUTORIAL_MODE_ENGAGE,
      trigger: "onPlayerEngages",
    },
    // Explain fighting (guaranteed success)
    {
      mode: TUTORIAL_MODE_FIGHT,
      trigger: "onPlayerFights",
    },
    // Explain defeating enemies and end the tutorial
    {
      mode: TUTORIAL_MODE_NONE,
      trigger: "-------",
    },
  ];

  // Each tutorial is represented as a data collection (or list of data collections) to be passed to a new modal
  // TODO: obsolete?
  static #tutorials = {
    example: {
      header: "",
      body: "",
      options: [],
      allowKeyboard: false,
      image: null,
      slowRoll: false,
      size: "md",
    },
    //
    test: {
      header: "Test Tutorial",
      body: "This is a test tutorial modal. Please read this text.",
      options: [new Option("next", "Close")],
      allowKeyboard: false,
      image: null,
      slowRoll: false,
      size: "md",
    },
    testList: [
      {
        header: "Test List A",
        body: "This is the first page.",
        options: [new Option("next", "Next")],
        allowKeyboard: false,
        image: null,
        slowRoll: false,
        size: "md",
      },
      {
        header: "Test List B",
        body: "This is the second page.",
        options: [new Option("close", "Close")],
        allowKeyboard: false,
        image: null,
        slowRoll: false,
        size: "md",
      },
    ],
  };
}
