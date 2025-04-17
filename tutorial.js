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

const ARCHIVE_1_A = `
<p>From the diaries of Barnaby Barnes, Urbextraordinaire</p>
<div class="font-scifi px-3">
  <p>Friends, countrymen, third-tier subscribers and above. You gotta check this one out. I got a tip-off from one <em>RAMSt0k3r</em> about an old-school net graveyard in <em>[inaudible]</em>, dating all the way back to the <em>[inaudible]</em>th century. If even a fraction of what I’ve heard about these places is true, you’re in for a treat.</p>
</div>
`;

const ARCHIVE_1_B = `
<div class="font-scifi px-3">
  <p>Now I know you’re probably screaming at your PAD right now. Don’t do it, it’s a trap, nobody gets out of those things alive! Well, unless you’re a turbodiamond-tier sub I can’t hear you. But listen, it’s a <em>net</em> graveyard. If I don’t wanna get monster mashed I can just not jack in.</p>
  <p>…brought my portable skulljack just in case though. All the juicy stuff’s gonna be hidden behind the firewalls. I’m all about the juicy.</p>
  <p>It almost beggars belief to think this was so close to my apartment all this time. That a facility like this lay untouched for so long, right under the nose of the Urbextraordinaire! Back soon, with much more to share.</p>
  <p>Love ya.</p>
</div>
`;

const ARCHIVE_2_A = `
<div class="font-scifi px-3">
  <p>This place is wild. Okay so I know that facilities like this were designed to repel intruders, right? I know their designers used a whole heap of psychological tricks to make you feel like you’re being followed. But knowing all that isn’t helping. Once I’m out we’re all gonna have a blast unpacking the design of this place. Like, all the corners are…wrong? I keep catching other shadows next to mine, just for a second, like there’s something sneaking up on me. Nice trick of light, very cool.</p>
  <p>Oh, yeah, so my tech is refusing to behave tonight. There was a, uh, shimmer or something in the entrance area. I didn’t think much of it then but I think it’s some kind of dampening field. Tragically, this means tonight’s proceedings will be VOD-only. I’ll make it up to you, promise. It also means my automapper isn’t working. That’s right, we’re going old-school tonight! I’ll be fine without it, I’ve only been down here for…</p>
  <p>Hm. I took a left, then I took a left, then I took a left, then I took a left, then I took a left, then I took a left, then I took a left, then I <em><b>WHAT THE FUCK IS THAT–</b></em></p>
</div>
`;

const ARCHIVE_2_B = `
<div class="font-scifi px-3">
  <p>Hahahaha. Sorry about that. Think a bird just flew past me or something? Oh my god, the vibe down here man. We all know the stories about HB’s Mad Science division, meme-demons, the hell realms under the net. This is the kind of place that makes them all feel true.</p>
  <p>Oh, and there’s a fuckton of rats. That’s kind of a comfort at this point though? Like, London’s still London, even down here. I’m gonna keep going. More soon.</p>
</div>
`;

const ARCHIVE_3_A = `
<div class="font-scifi px-3">
  <p>I think we make them real. The more scared I get the more real they get, and I don’t mean that in an it’s all in your head kind of way because a werewolf tore a gash in my actual fucking arm and now I’m bleeding my own actual blood on the actual floor.</p>
  <p>I got away, I blocked off the room so I could record this, but there’s a trail of bloodcrumbs leading right to me. I’m cooked.</p>
  <p>My subscribers aren’t gonna get to hear this. So this is an exclusive bit of content for the next visitor to the net graveyard. Let’s figure out how this works. Let’s get you out.</p>
  <p>If it takes your fear then the question is: how? How does a physical space turn your psychological impulses into something that can hurt you? Sure you’re generating adrenaline or whatever but it’s not like that’s enough power to fire up the monster printer.</p>
  <p>Unless we’re…</p>
</div>
`;

const ARCHIVE_3_B = `
<div class="font-scifi px-3">
  <p><em>Oh.</em></p>
</div>
`;

const ARCHIVE_3_C = `
<div class="font-scifi px-3">
  <p>Hey, you. Do me a favour. Look up.</p>
</div>
`;

const ARCHIVE_3_D = `
<p>You look up, and instead of a ceiling you are met with a deep black night sky.</p>
<p>The stars.</p>
<p>Gods, have you ever really seen the stars before? Not just stars but constellations, lines joining them up into a complex tapestry. The stars hold the answers. If you stare long enough you’ll know everything. Above it all hangs the moon, luminous and perfectly full. Its light emanates, getting brighter and brighter, overwhelming your senses, filling you up.</p>
`;

const ARCHIVE_3_E = `
<div class="font-scifi px-3">
  <p>I could be dancing with Kim at the club right now. But no, the urbextraordinaire just couldn’t wait to visit a haunted house, alone. It’s been…two hours? It’s been six months. It’s been a hundred <em>fucking</em> years <em><b>COME TAKE ME ALREADY JUST END IT COME TAKE ME–</b></em></p>
</div>
`;

///////////////////////////////////////////////////////////////////////////////

const HANTU_A = `
<p>You scramble up a slope made of light, trying to get any amount of distance between yourself and the beasts pursuing you. From this vantage point you can truly take in the net graveyard for the first time. Its walls are manned by vicious-looking turrets. Feral dogs roam the overgrown thickets further out, howling, hungry.</p>
<p>You spot pitfalls, translucent patches that give way to writhing masses of snakes below. One is very close to the path you took. You got lucky.</p>
`;

const HANTU_B = `
You hear a rhythmic pounding, a thwack thwack thwack getting closer and closer. Then you spot the path being carved in the forest at the edge of the graveyard. Two giant woodsmen, wielding axes each larger than you, chop chop chopping a route straight towards you for-
`;

const HANTU_C = `
Her.
`;

const HANTU_D = `
<p>You catch a glimpse of the hantu, racing through the newly created space at an unimaginable speed. Her white dress is flecked with red. Her dark hair is matted. She is hollow, a pulsating glitch of impossible shape and colour where her back should be. She breaks free of the forest, lets out a deafening wail.</p>
<p>You know, deep in your bones, that she is on the hunt, and that the graveyard holds only one prey.</p>
<p>You.</p> 
`;

const HANTU_E = `
What a story this will make once you’re out. You intend to live long enough to tell it. Will you run, or fight? 
`;

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
  static #active; // Is the tutorial currently happening
  static #enabled; // Is/was the tutorial enabled for this run
  static #hintTimeout;
  static #hintAlert;

  static get mode() {
    return this.#mode;
  }

  static set active(value) {
    this.#active = value;
  }
  static get active() {
    return this.#active;
  }

  static set enabled(value) {
    this.#enabled = value;
  }
  static get enabled() {
    return this.#enabled;
  }

  static unlockCatalyst() {
    Serialisation.saveSetting("catalyst-unlocked", true);
  }
  static get catalystIsUnlocked() {
    return Serialisation.loadSetting("catalyst-unlocked") ? true : false;
  }

  static serialise() {
    return {
      index: this.#stageIndex,
      triggers: Object.keys(this.#triggers),
      active: this.#active,
      enabled: this.#enabled,
    };
  }
  static deserialise(json) {
    this.#stageIndex = json.index;
    this.#triggers = {};
    json.triggers.forEach((trigger) => {
      this.#triggers[trigger] = true;
    });
    this.active = json.active ? true : false;
    this.enabled = json.enabled ? true : false;
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
        await new Modal(page).display();
      }
      Modal.hide();
    }
    if (stage.hint && UiMode.mode != UIMODE_CORP_TURN) {
      this.#hintTimeout = setTimeout(function () {
        if (!Modal.isModalVisible) {
          Tutorial.#hintAlert = Alert.send(stage.hint, ALERT_INFO, false, true);
        }
      }, 3750);
    }
    // TODO: if this causes problems, add a pause here
    this.setMode(stage.mode);
    // Check if the tutorial is over
    if (this.#stageIndex >= this.#stages.length - 1) {
      this.#active = false;
      this.unlockCatalyst();
    }
  }

  static reset() {
    this.#triggers = {};
    this.setMode(null);
    this.clearHintTimout();
    if (this.#hintAlert) {
      this.#hintAlert.close();
    }
    this.#stageIndex = 0;
  }

  // Retriggers the previous tutorial cutscene - used when loading the game
  // If the trigger it was waiting for was turn start, retriggering it will softlock the game due to the timing of saves
  static async retriggerCutscene() {
    if (this.#active) {
      await this.triggerCutscene(Math.max(0, this.#stageIndex - 1));
    }
  }

  static async run(trigger, closeModal = true) {
    if (
      this.#triggers[trigger] ||
      !this.#tutorials[trigger] ||
      (this.#tutorials[trigger].requireTutorialEnabled && !Tutorial.enabled) ||
      (this.#tutorials[trigger].disableInNetspace && Story.isInNetspace)
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
      const option = await new Modal(page).display();
      if (Number.isInteger(option) && option >= 0) {
        index = option;
      } else {
        index++;
      }
    }
    if (closeModal) {
      Modal.hide();
    }
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
          body: "Let's get to work!<br><br>This place isn't far from your apartment. And moving is easy! You just click the move button, and then select the location you want to move to.",
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
          body: "Before we go in, let's make sure we're prepared.<br><br>To do much you'll need credits (i.e. money) and cards (i.e. cards).<br><br>The simplest way to gain credits, is to spend a click to gain one. Remember, you have 3 clicks to spend each turn.",
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
          body: "The simplest way to draw cards, is to spend a click to draw! Don't you agree?",
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
          header: "Keeping up",
          body: "Your first turn! Congratulations!<br><br>You may have noticed, but at the end of each turn, you draw a card and gain a credit automatically.<br><br>If you have more than 8 cards in hand at the end of your turn, you will have to discard back down to 8. Uh oh.",
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
      trigger: "onTurnEnd",
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
          body: "Each location has a shroud value (left) and an amount of data (right).<br><br>When a location is revealed, data equal to its data value is placed on it in a lovely cerulean blue.<br><br>If a location has any data hosted on it, you may spend a click to 'jack in', and attempt to download it.<br><br>This is you entering netspace to try and access hidden information.",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          cardData: LocationTerminal,
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Downloading data",
          body: "Attempting to download data initiates a skill test against your MU. To succeed, you must roll a final value that is at least the shroud value of your current location. If successful, you download 1 data from it.<br><br>Give it a go!",
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
          voices: AUDIO_VOICES_SAD,
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
      trigger: "onActAdvanced",
      hint: "End your turn.",
      modals: [
        {
          header: "Downloading data",
          body: "There we go!<br><br>You can view the chaos bag at any time with the button next to your stats.",
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
    {
      mode: TUTORIAL_MODE_EVADE,
      trigger: "onPlayerEvades",
      modals: [
        {
          header: "Agendas",
          body: "There is now an agenda.<br><br>Agendas are acts' evil twins: advancing these makes things harder for you.<br><br>At the end of each turn, 1 doom is placed on the current agenda. When it reaches its limit, it will advance.<br><br>Advance too much, and you might not make it out of here.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          cardData: Agenda2,
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Agendas",
          body: "I'm sure you'll be fine though!",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Agendas",
          body: "...good luck!",
          options: [new Option("", "Continue")],
          allowKeyboard: false,
          image: "img/character/sahasraraHappy.png",
          slowRoll: true,
          size: "lg",
        },
        // Explain enemies, the hunter keyword, and engaging
        // Explain evasion, exhaustion, and readying (guaranteed success)
        {
          header: "Enemies",
          body: "Unsurprisingly, this place has rats.<br><br>They're not going to be a major problem, but you should try to avoid them.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          cardData: Act2,
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Enemies",
          body: "Unfortunately, rats are hunters.<br><br>This means that during each corp phase, they will move towards you, taking any shortest path.<br><br>Whenever an enemy moves to your current location, it will engage you.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          cardData: EnemyRat,
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Enemies",
          body: "While engaged with an enemy, taking any action that does not directly interact with enemies will trigger an <em>'attack</em> <em>of</em> <em>opportunity'</em>, in which each engaged enemy will attack you.<br><br>When a rat attacks you, it will do 1 damage. Damage is dealt directly to you, and if you run out of health...<br><br><em>Well...</em>",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Enemies",
          body: "Some assets you install will have health, just like you!<br><br>When you take damage, you will have the opportunity to place that damage on these assets instead of yourself.<br><br>Of course, if <em>they</em> run out of health, they get trashed!",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          cardData: CardIceCarver,
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Evading enemies",
          body: "We should get rid of this rat then.",
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
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasrara.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Engaging enemies",
          body: "Just remember, if you're engaged with an enemy that isn't exhausted, taking any action that doesn't interact with an enemy will trigger an attack of opportunity, and if you move, all engaged enemies will follow you.<br><br>Actions that trigger attacks are highlighted in eye-piercing red for your convenience.",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
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
          body: "Now, let's make sure this rat won't bother us again.",
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
          body: "That's pretty much everything you need to know!<br><br>I'll still be with you, but try exploring this place by yourself now.<br><br>Remember: you want to download more data to advance the next act!",
          options: [new Option("", "Close")],
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
    // Encounter explainer
    encounter: {
      requireTutorialEnabled: true,
      disableInNetspace: true,
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
          options: [new Option("", "Next")],
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
      requireTutorialEnabled: true,
      disableInNetspace: true,
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
          body: "Cards in your hand may have symbols on their side.<br><br>Whenever you make a skill test, you may select any number of cards with the corresponding symbol to discard, where each card discarded will increase your test strength by 1. This will allow you to succeed tests you otherwise might not be able to.",
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
    // Act2 -> Act3 (broadcast terminals revealed)
    exitAct2: {
      cutscene: [
        {
          header: "???",
          body: `<b><em>ke-</em></b> <b><em>ke-</em></b> <b><em>ke-</em></b> <b><em>ke-</em></b> <b><em>ke-</em></b> <b><em>ke-</em></b>`,
          options: [new Option("", "Next")],
          allowKeyboard: false,
          slowRoll: true,
          rollSpeed: 600,
          voices: [AUDIO_VOICE_BIRD_2],
          size: "md",
        },
        {
          header: "???",
          body: "Woah! Was that a bird? This place must have been abandoned for some time.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasrara.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Archives found",
          body: "<p>Anyway, I’ve used your data to piece together a schematic of the, uh, net graveyard. There should be four archive terminals nearby.</p><p>Maybe they’ll help us learn where to find this goth girl our client’s looking for, eh?</p>",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
      ],
    },
    // First broadcast
    firstBroadcast: {
      cutscene: [
        {
          header: "First archive",
          body: ARCHIVE_1_A,
          options: [new Option("", "Next")],
          allowKeyboard: false,
          size: "md",
        },
        {
          header: "First archive",
          body: ARCHIVE_1_B,
          options: [new Option("", "Next")],
          allowKeyboard: false,
          size: "md",
        },
        {
          header: "First archive",
          body: "What a wanker. Let’s move on?",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
      ],
    },
    // Second broadcast
    secondBroadcast: {
      cutscene: [
        {
          header: "Second archive",
          body: "From the diaries of Barnaby Barnes, Urbextraordinaire–",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          size: "md",
        },
        {
          header: "Second archive",
          body: "Oh no, not you again.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Second archive",
          body: ARCHIVE_2_A,
          options: [new Option("", "Next")],
          allowKeyboard: false,
          size: "md",
        },
        {
          header: "Second archive",
          body: ARCHIVE_2_B,
          options: [new Option("", "Next")],
          allowKeyboard: false,
          size: "md",
        },
        {
          header: "Second archive",
          body: "<p>London’s still…?</p><p>Must be an old-timey idiom from this guy’s era.</p>",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Second archive",
          body: "<p>Let’s keep moving.</p><p>I’ll…make sure I still know where the exit is.</p>",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          image: "img/character/sahasrara.png",
          slowRoll: true,
          size: "lg",
        },
      ],
    },
    // Act3 -> Act4 (broadcast successful, enter netspace)
    exitAct3: {
      cutscene: [
        {
          header: "Third archive",
          body: "From the diaries of-",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          size: "md",
        },
        {
          header: "Third archive",
          body: "I’m hitting fast-forward.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Third archive",
          body: ARCHIVE_3_A,
          options: [new Option("", "Next")],
          allowKeyboard: false,
          size: "md",
        },
        {
          header: "Third archive",
          body: ARCHIVE_3_B,
          options: [new Option("", "Next")],
          allowKeyboard: false,
          size: "md",
        },
        {
          header: "Third archive",
          body: ARCHIVE_3_C,
          options: [new Option("", "Next")],
          allowKeyboard: false,
          size: "md",
        },
        {
          header: "The abyss above",
          body: ARCHIVE_3_D,
          options: [new Option("", "Next")],
          allowKeyboard: false,
          size: "lg",
        },
        {
          header: "Third archive",
          body: ARCHIVE_3_E,
          options: [new Option("", "Next")],
          allowKeyboard: false,
          size: "md",
        },
        {
          header: "Third archive",
          body: "End of transmission.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          size: "sm",
        },
      ],
    },
    // Agenda2 -> Agenda3 (broadcast failed, enter netspace)
    exitAgenda2: {
      cutscene: [
        {
          header: "Out of time out of mind",
          body: "I think.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Out of time out of mind",
          body: "I think we must have missed something. Something that might have helped us catch on to the true nature of this place.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Out of time out of mind",
          body: "Look up.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "The abyss above",
          body: ARCHIVE_3_D,
          options: [new Option("", "Next")],
          allowKeyboard: false,
          size: "lg",
        },
      ],
    },
    // Agenda2 -> Agenda3 (broadcast never started, enter netspace)
    exitAgenda2NoBroadcast: {
      cutscene: [
        {
          header: "Out of time out of mind",
          body: "I think.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Out of time out of mind",
          body: "I think we must have missed something. Something that might have helped us catch on to the true nature of this place.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "Out of time out of mind",
          body: "Look up.",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraPensive.png",
          slowRoll: true,
          size: "lg",
        },
        {
          header: "The abyss above",
          body: ARCHIVE_3_D,
          options: [new Option("", "Next")],
          allowKeyboard: false,
          size: "lg",
        },
      ],
    },
    // Enter netspace
    enterNetspace: {
      cutscene: [
        {
          header: "Uh oh...",
          body: "Ha",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraSad.png",
          slowRoll: true,
          voices: [AUDIO_VOICE_SAD_1],
          size: "lg",
        },
        {
          header: "Uh oh...",
          body: "Ha ha...",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraSad.png",
          slowRoll: true,
          rollSpeed: 150,
          voices: AUDIO_VOICES_DYING_A,
          size: "lg",
        },
        {
          header: "Uh oh...",
          body: "I don't think we're where we think we are...",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraSad.png",
          slowRoll: true,
          rollSpeed: 150,
          voices: AUDIO_VOICES_DYING_A,
          size: "lg",
        },
        {
          header: "Uh oh...",
          body: "I don't think we've been in the real world for a while now...",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraDecay1.png",
          slowRoll: true,
          rollSpeed: 200,
          voices: AUDIO_VOICES_DYING_B,
          size: "lg",
        },
        {
          header: "Uh oh...",
          body: "I'm sorry...",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraDecay1.png",
          slowRoll: true,
          rollSpeed: 750,
          voices: AUDIO_VOICES_DYING_B,
          size: "lg",
        },
        {
          header: "Uh oh...",
          body: "So sorry...",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraDecay2.png",
          slowRoll: true,
          rollSpeed: 750,
          voices: AUDIO_VOICES_DYING_C,
          size: "lg",
        },
        {
          header: "Uh oh...",
          body: "It's seen me...",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraDecay2.png",
          slowRoll: true,
          rollSpeed: 400,
          voices: AUDIO_VOICES_DYING_C,
          size: "lg",
        },
        {
          header: "Uh oh...",
          body: "I- I- I- I- I- I- sorry...",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraDecay3.png",
          slowRoll: true,
          rollSpeed: 800,
          voices: [AUDIO_VOICE_DEAD_0],
          size: "lg",
        },
        {
          header: "Uh oh...",
          body: "You're on your own now...",
          options: [new Option("", "Next")],
          allowKeyboard: false,
          image: "img/character/sahasraraDecay3.png",
          slowRoll: true,
          rollSpeed: 500,
          voices: [AUDIO_VOICE_DEAD_0],
          size: "lg",
        },
        {
          header: "Uh oh...",
          body: "",
          options: [new Option("", "Close")],
          allowKeyboard: false,
          image: "img/character/sahasraraDecay.gif",
          optionsDelay: 8000,
          voices: [AUDIO_FLOWER_DEATH],
          size: "lg",
        },
      ],
    },
    // Act4 -> Act5 (found the source)
    exitAct4: {
      cutscene: [
        {
          header: "Something's coming...",
          body: HANTU_A,
          options: [new Option("", "Next")],
          allowKeyboard: false,
          size: "lg",
        },
        {
          header: "Something's coming...",
          body: HANTU_B,
          options: [new Option("", "Next")],
          allowKeyboard: false,
          size: "lg",
        },
        {
          header: "Something's coming...",
          body: HANTU_C,
          options: [new Option("", "Next")],
          allowKeyboard: false,
          size: "lg",
        },
        {
          header: "Something's coming...",
          body: HANTU_D,
          options: [new Option("", "Next")],
          allowKeyboard: false,
          size: "lg",
        },
        {
          header: "Something's coming...",
          body: HANTU_E,
          options: [new Option("", "Decide")],
          allowKeyboard: false,
          size: "lg",
        },
      ],
    },
  };
}
