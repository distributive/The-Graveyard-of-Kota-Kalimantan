let tutorial_i = 0;
const TUTORIAL_MODE_NONE = tutorial_i++;
const TUTORIAL_MODE_WAITING = tutorial_i++;
const TUTORIAL_MODE_END_TURN = tutorial_i++;
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
TUTORIAL_MODE_TO_CLASS[TUTORIAL_MODE_WAITING] = "waiting";
TUTORIAL_MODE_TO_CLASS[TUTORIAL_MODE_END_TURN] = "force-end-turn";
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
- End of tutorial (explain encounters)
 */

///////////////////////////////////////////////////////////////////////////////

class Tutorial {
  static #triggers = {};
  static #mode = TUTORIAL_MODE_NONE;
  static #active;
  static #hintTimeout;
  static #hintAlert;
  static #unlockedCatalyst = false;

  static get mode() {
    return this.#mode;
  }

  static set active(value) {
    this.#active = value;
  }
  static get active() {
    return this.#active;
  }

  static unlockCatalyst() {
    this.#unlockedCatalyst = true;
  }
  static get catalystIsUnlocked() {
    return this.#unlockedCatalyst;
  }

  static serialise() {
    return {
      index: this.#stageIndex,
      triggers: Object.keys(this.#triggers),
      active: this.#active,
      unlocked: this.#unlockedCatalyst,
    };
  }
  static deserialise(json) {
    this.#stageIndex = json.index;
    this.#triggers = {};
    json.triggers.forEach((trigger) => {
      this.#triggers[trigger] = true;
    });
    this.active = json.active;
    this.#unlockedCatalyst = json.unlocked;
    this.#mode = TUTORIAL_MODE_NONE; // Ensure it is not stuck in WAITING
  }

  // To exit tutorial mode, set it to null
  static setMode(mode) {
    this.#mode = mode ? mode : TUTORIAL_MODE_NONE;
    $("#tutorial-flags").removeClass();
    if (this.#mode != TUTORIAL_MODE_NONE) {
      $("#tutorial-flags").addClass(TUTORIAL_MODE_TO_CLASS[mode]);
    }
    GripCard.markPlayableCards();
    RigCard.markUsableCards();
  }

  static clearHintTimout() {
    if (this.#hintTimeout) {
      clearTimeout(this.#hintTimeout);
    }
  }

  static async signal(trigger, data) {
    if (
      this.#active &&
      this.mode != TUTORIAL_MODE_WAITING &&
      this.#stageIndex < this.#stages.length &&
      this.#stages[this.#stageIndex].trigger == trigger
    ) {
      await this.triggerCutscene(this.#stageIndex);
    }
  }

  static async triggerCutscene(index) {
    this.clearHintTimout();
    if (this.#hintAlert) {
      this.#hintAlert.close();
    }
    this.#stageIndex = index + 1;
    const stage = this.#stages[this.#stageIndex];
    if (stage.modals) {
      this.setMode(TUTORIAL_MODE_WAITING);
      await wait(1000); // TODO: time appropriately // NOTE: things break if this is too short (100 confirmed too short)
      for (const page of stage.modals) {
        await new Modal(null, page).display();
      }
      Modal.hide();
    }
    if (stage.hint && UiMode.mode != UIMODE_CORP_TURN) {
      this.#hintTimeout = setTimeout(function () {
        Tutorial.#hintAlert = Alert.send(stage.hint, ALERT_INFO, false, true);
      }, 3750);
    }
    // TODO: if this causes problems, add a pause here
    this.setMode(stage.mode);
    // Check if the tutorial is over
    if (this.#stageIndex >= this.#stages.length - 1) {
      this.#active = false;
      this.#unlockedCatalyst = true;
    }
  }

  static reset() {
    this.#triggers = {};
    this.#mode = TUTORIAL_MODE_NONE;
    this.clearHintTimout();
    if (this.#hintAlert) {
      this.#hintAlert.close();
    }
    this.#stageIndex = 0;
  }

  // Retriggers the previous tutorial cutscene - used when loading the game
  static async retriggerCutscene() {
    if (this.#active && this.#stageIndex > 0) {
      await this.triggerCutscene(this.#stageIndex - 1);
    }
  }

  static async run(trigger) {
    if (
      this.#triggers[trigger] ||
      !this.#tutorials[trigger] ||
      (this.#tutorials[trigger].requireTutorialActive && !Tutorial.active)
    ) {
      return false;
    }
    this.#triggers[trigger] = true;

    Menu.disableInGameMenuButton();

    const tutorial = this.#tutorials[trigger].cutscene.length
      ? this.#tutorials[trigger].cutscene
      : [this.#tutorials[trigger].cutscene];
    let index = 0;
    while (index < tutorial.length) {
      const page = tutorial[index];
      const option = await new Modal(null, page).display();
      if (Number.isInteger(option) && option >= 0) {
        index = option;
      } else {
        index++;
      }
    }
    Modal.hide();
    Menu.enableInGameMenuButton();
    return true;
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
      hint: "Use the move button to move to the neighbouring location.",
      modals: [
        {
          header: "Moving",
          body: "Let's get to work!<br><br>The warehouse isn't far from your apartment. And moving is easy! You just click the move button, and then select the location you want to move to.",
          options: [new Option("", "Close")],
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
      hint: "Use the credit button to gain a credit.",
      modals: [
        {
          header: "Gaining credits",
          body: "Before we go in, let's make sure we're prepared.<br><br>To do much you'll need credits (i.e. money) and cards (i.e. cards).<br><br>The simplest way to gain credits, is to spend a click to gain 1. Remember, you have 3 clicks to spend each turn.",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          image: "img/character/sahasraraHappy.png",
          slowRoll: true,
          size: "lg",
        },
      ],
    },
    // Teach drawing
    {
      mode: TUTORIAL_MODE_DRAW,
      trigger: "onCardsDrawn",
      hint: "Use the draw button to draw a card.",
      modals: [
        {
          header: "Drawing cards",
          body: "The simplest way to draw cards, is to spend a click to draw!",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          image: "img/character/sahasraraHappy.png",
          slowRoll: true,
          size: "lg",
        },
      ],
    },
    // End turn
    {
      mode: TUTORIAL_MODE_DRAW,
      trigger: "onTurnEnd",
      hint: "End your turn.",
    },
    // Explain upkeep
    {
      mode: TUTORIAL_MODE_PLAY_EVENT,
      trigger: "onTestCompleted",
      hint: "Play Unsure Gamble from your hand.",
      modals: [
        {
          header: "Upkeep",
          body: "Your first turn! Congratulations!<br><br>You may have noticed, but at the end of each turn, you draw a card and gain a credit automatically.<br><br>If you have more than 8 cards in hand at the end of your turn, you will have to discard back down to 8.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraHappy.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Playing events",
          body: "Now, let's make some more money!<br><br>See that legally-distinct gamble-themed card in your hand? You can click it to play it!",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraHappy.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Skill tests",
          body: "Unsure Gamble makes you perform a test. You succeed or fail tests by picking a random token out of the chaos bag.<br><br>Each test is performed against one of your four skills:<br>• Influence - The power of your presence<br>• MU - The quality of your rig<br>• Strength - Your physical and mental fortitude<br>• Link - Your connection to the net",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          cardData: CardUnsureGamble,
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Skill tests",
          body: "When you perform a test, it will specify a skill and a target number. You then pick a random token, apply its modifier to your base skill level, and if it is equal to the target or greater, you succeed!<br><br>Most tokens are just numbers, like +1 or -3, but there are also some special tokens in there to watch out for!",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          image: "img/character/sahasrara.png",
          slowRoll: true,
          size: "lg",
        },
      ],
    },
    // Teach assets
    {
      mode: TUTORIAL_MODE_INSTALL_ASSET,
      trigger: "onCardInstalled",
      hint: "Install the Warehouse Key from your hand.",
      modals: [
        {
          header: "Installing assets",
          body: "Now, let's get inside!<br><br>You have the key in hand. You can install it by clicking it.",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          image: "img/character/sahasraraHappy.png",
          slowRoll: true,
          size: "lg",
        },
      ],
    },
    // Teach using assets
    {
      mode: TUTORIAL_MODE_USE_ASSET,
      trigger: "onLoseClicks",
      hint: "Use the Warehouse Key by clicking on it.",
      modals: [
        {
          header: "Installing assets",
          body: "Some assets grant you new abilities while installed. The key lets you into the warehouse.<br><br>To use it, just click it!",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          image: "img/character/sahasraraHappy.png",
          slowRoll: true,
          size: "lg",
        },
      ],
    },
    // End turn
    {
      mode: TUTORIAL_MODE_USE_ASSET,
      trigger: "onTurnStart",
      hint: "End your turn.",
    },
    // Move to a new location (with clues)
    {
      mode: TUTORIAL_MODE_MOVE,
      trigger: "onPlayerMoves",
      hint: "Move to the neighbouring location.",
      modals: [
        {
          header: "Onwards and inwards...",
          body: "Let's go inside.",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
      ],
    },
    // Investigate (forced fail)
    {
      mode: TUTORIAL_MODE_INVESTIGATE,
      trigger: "onInvestigation",
      hint: "Use the 'jack in' button to attempt to download data from this location.",
      modals: [
        {
          header: "Downloading data",
          body: "Oh hey, an old terminal! We can use this to download data about this place.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraHappy.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Downloading data",
          body: "Each location has a shroud value (left) and an amount of data (right).<br><br>If a location has any data hosted on it, you may spend a click to 'jack in', and attempt to download it.<br><br>Attempting to download data initiates a skill test against your MU. If successful, you download 1 data from your current location.<br><br>Give it a go!",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          cardData: LocationTerminal,
          slowRoll: true,
          size: "lg",
        },
      ],
    },
    // Investigate (forced success)
    {
      mode: TUTORIAL_MODE_INVESTIGATE,
      trigger: "onInvestigation",
      hint: "Use the 'jack in' button to attempt to download data from this location.",
      modals: [
        {
          header: "Downloading data",
          body: "Oh.<br><br>It didn't work...",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraSad.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Downloading data",
          body: "Nevermind! We can always try again!",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
      ],
    },
    // Explain acts and advancing (the act will summon a rat)
    {
      mode: TUTORIAL_MODE_END_TURN,
      trigger: "onTurnStart",
      modals: [
        {
          header: "Downloading data",
          body: "There we go!",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraHappy.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Acts",
          body: "Now that we have a data, we can advance the act!<br><br>Each act has a requirement to advance. Once you achieve that requirement, it will progress to the next act!",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          cardData: Act1,
          slowRoll: true,
          size: "lg",
        },
      ],
    },
    // NOTE: the explainer for the agenda will be triggered asynchronously by Act1
    // Explain enemies, the hunter keyword, and engaging
    // Explain evasion, exhaustion, and readying (guaranteed success)
    {
      mode: TUTORIAL_MODE_EVADE,
      trigger: "onPlayerEvades",
      hint: "Use the evade button to attempt to evade the rat.",
      modals: [
        {
          header: "Enemies",
          body: "Unsurprising, this place has rats.<br><br>They're not going to be a major problem, but you should make sure to avoid them.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasrara.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Enemies",
          body: "Unfortunately, rats are hunters.<br><br>This means that during each corp phase, they will move towards you, taking any shortest path to reach you.<br><br>Whenever an enemy moves to your current location, it will engage you.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          cardData: EnemyRat,
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Enemies",
          body: "While engaged with an enemy, taking any action that does not directly interact with enemies will trigger an 'attack of opportunity', in which each engaged enemy will attack you.<br><br>When a rat attacks you, it will do 1 damage. Damage is dealt directly to you, and if you run out of health...<br><br>Well...",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Enemies",
          body: "Some assets you install will have health, just like you!<br><br>When you take damage, you will have the opportunity to place that damage on these assets instead of yourself.<br><br>Of course, if they run out of health, they get trashed!",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          cardData: CardIceCarver,
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Evading enemies",
          body: "We should get rid of this rat though.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Evading enemies",
          body: "Enemies have three stats:<br>• Strength (left)<br>• Health (middle)<br>• Link (right)<br><br>In order to fight and defeat enemies, you need to interact with their strength. In order to evade and exhaust them, you need to interact with their link.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          cardData: EnemyRat,
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Evading enemies",
          body: "When you attempt to evade an enemy, you perform a skill test of your link against its link. If successful, the enemy will disengage you, and become exhausted. Exhausted enemies are unable to move or attack for the remainder of the turn.<br><br>Give it a go!",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
      ],
    },
    // Explain the basic action to engage
    {
      mode: TUTORIAL_MODE_ENGAGE,
      trigger: "onPlayerEngages",
      hint: "Use the engage button to engage the rat.",
      modals: [
        {
          header: "Evading enemies",
          body: "Success!",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraHappy.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Engaging enemies",
          body: "Sometimes, you might want to engage an enemy. Whenever you attack an enemy, you automatically engage it, but you can also spend a click to engage them without attacking.<br><br>Try re-engaging the rat! It's exhausted so it most likely probably can't harm you maybe.",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          image: "img/character/sahasrara.png",
          slowRoll: true,
          size: "lg",
        },
      ],
    },
    // Explain fighting (guaranteed success)
    {
      mode: TUTORIAL_MODE_FIGHT,
      trigger: "onPlayerAttacks",
      hint: "Use the fight button to attempt to attack the rat.",
      modals: [
        {
          header: "Attacking enemies",
          body: "Now, lets make sure this rat won't bother us again.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Attacking enemies",
          body: "When you use the basic action to attack an enemy, you perform a skill test of your strength against its strength. If successful, you do 1 damage to the enemy.<br><br>When the enemy runs out of health, it is defeated!<br><br>Have a go!",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          image: "img/character/sahasrara.png",
          slowRoll: true,
          size: "lg",
        },
      ],
    },
    // End turn
    {
      mode: TUTORIAL_MODE_FIGHT,
      trigger: "onTurnEnd",
      hint: "End your turn.",
    },
    // Explain defeating enemies and end the tutorial
    {
      mode: TUTORIAL_MODE_NONE,
      trigger: "",
      modals: [
        {
          header: "Attacking enemies",
          body: "You sure did punch that rat in the face! Good job, champ.<br><br>Today is already filled with so much moral ambiguity.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraHappy.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Onwards",
          body: "That's pretty much everything you need to know!<br><br>I'll still be with you, but try exploring this place by yourself now.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasrara.png",
          slowRoll: true,
          size: "lg",
        },
      ],
    },
  ];

  // Async tutorials that are triggered by unscripted events
  static #tutorials = {
    // Intro cutscene
    intro: {
      cutscene: [
        {
          header: "Introductions",
          body: ``,
          options: [new Option("", "Next")],
          allowKeyboard: false,
          slowRoll: true,
          size: "lg",
        },
      ],
    },
    // Agenda explainer
    agenda: {
      requireTutorialActive: true,
      cutscene: [
        {
          header: "Agendas",
          body: "There is now an agenda.<br><br>Agendas are acts' evil twins: advancing these makes things harder for you.<br><br>At the end of each turn, 1 doom is placed on the current agenda. When it reaches its limit, it will advance.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          cardData: Agenda2,
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Agendas",
          body: "Advance too much, and you might not make it out of here.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Agendas",
          body: "I'm sure you'll be fine though!",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraHappy.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Agendas",
          body: "...good luck!",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          image: "img/character/sahasraraHappy.png",
          slowRoll: true,
          size: "lg",
        },
      ],
    },
    // Encounter explainer
    encounter: {
      requireTutorialActive: true,
      cutscene: [
        {
          header: "Random encounters",
          body: "Now that we're in the thick of it, you're going to start having random encounters.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Random encounters",
          body: "After each turn, you'll draw a random card from the encounter deck. Who knows what they could do...",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          image: "img/character/sahasrara.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Random encounters",
          body: "Me! I do!",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraHappy.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Random encounters",
          body: "Best of luck!",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          image: "img/character/sahasraraHappy.png",
          slowRoll: true,
          size: "lg",
        },
      ],
    },
    // Committing cards
    commit: {
      requireTutorialActive: true,
      cutscene: [
        {
          header: "Committing cards",
          body: "Whenever you perform a test, you may first 'commit' cards from your hand.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasrara.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Committing cards",
          body: "Cards in your hand may have skill symbols on their side. These correspond to the skill tests you may commit them to.<br><br>Whenever you make a skill test, you may select any number of valid cards to discard, and each card discarded will increase your test strength by 1. This will allow you to succeed at tests you might not otherwise be able to.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          cardData: CardUnsureGamble,
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Committing cards",
          body: "Just remember: if you ever draw the autofail token, you will fail the test regardless of how many cards you've committed.",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
      ],
    },
  };
}
