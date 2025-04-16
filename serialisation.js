class Serialisation {
  // Convert the game state into a json object
  static serialise() {
    const act = Act.serialise();
    const agenda = Agenda.serialise();
    const cards = Cards.serialise();
    const chaos = Chaos.serialise();
    const encounter = Encounter.serialise();
    const enemy = Enemy.serialise();
    const identity = Identity.serialise();
    const location = Location.serialise();
    const stats = Stats.serialise();
    const story = Story.serialise();
    const tutorial = Tutorial.serialise();
    const uiMode = UiMode.serialise();
    return {
      act: act,
      agenda: agenda,
      cards: cards,
      chaos: chaos,
      encounter: encounter,
      enemy: enemy,
      identity: identity,
      location: location,
      stats: stats,
      story: story,
      tutorial: tutorial,
      uiMode: uiMode,
    };
  }

  // Create the game state represented by a json object
  static async deserialise(json) {
    Broadcast.disable();

    Location.deserialise(json.location); // Enemies require locations to be loaded before them
    Act.deserialise(json.act);
    await Agenda.deserialise(json.agenda);
    await Cards.deserialise(json.cards);
    Chaos.deserialise(json.chaos);
    Encounter.deserialise(json.encounter);
    await Enemy.deserialise(json.enemy);
    Identity.deserialise(json.identity);
    await Stats.deserialise(json.stats);
    Story.deserialise(json.story);
    Tutorial.deserialise(json.tutorial);
    await UiMode.deserialise(json.uiMode); // Should be last, as it will call setMode

    // Ensure all enemies (i.e. Surveyors) update their visual stats after all enemies have spawned
    for (const enemy of Enemy.instances) {
      enemy.updateStats();
    }

    Cards.updateStackHeapHeights();
    Cards.determineCanDraw();

    Tutorial.retriggerCutscene();

    Broadcast.enable();
  }

  // Saves game state to local storage
  static save() {
    const json = JSON.stringify(this.serialise());
    window.localStorage.setItem("netrunner-sahasrara", json);
  }

  // Loads the game state saved in local storage
  static async load(jsonOverwrite = null) {
    let json;
    try {
      json = jsonOverwrite
        ? jsonOverwrite
        : JSON.parse(window.localStorage.getItem("netrunner-sahasrara"));
      await this.deserialise(json);
    } catch (e) {
      console.error(e);
      // If the json is only partially corrupted, still determine if the Catalyst has been unlocked
      if (json && json.tutorial && json.tutorial.unlocked) {
        Tutorial.unlockCatalyst();
      }
      Broadcast.enable();
      return false;
    }
    return true;
  }

  // Deletes the save
  static deleteSave() {
    window.localStorage.removeItem("netrunner-sahasrara");
  }

  // Checks if a save data object exists, not if it's valid
  static get saveExists() {
    const json = window.localStorage.getItem("netrunner-sahasrara");
    if (!json) {
      return false;
    }
    try {
      JSON.parse(json);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Settings
  static saveSetting(key, value) {
    const address = `netrunner-sahasrara-${key}`;
    window.localStorage.setItem(address, value);
  }
  static loadSetting(key) {
    return window.localStorage.getItem(`netrunner-sahasrara-${key}`);
  }
  static deleteSetting(key) {
    const address = `netrunner-sahasrara-${key}`;
    const value = window.localStorage.getItem(address);
    window.localStorage.removeItem(address);
    return value;
  }
  static deleteAllSettings() {
    // We just hardcode these for simplicity - make sure this is up to date
    window.localStorage.removeItem(`netrunner-sahasrara-returning`);
    window.localStorage.removeItem(`netrunner-sahasrara-catalyst-unlocked`);
    window.localStorage.removeItem(`netrunner-sahasrara-music-muted`);
    window.localStorage.removeItem(`netrunner-sahasrara-sfx-muted`);
    window.localStorage.removeItem(`netrunner-sahasrara-buttons-muted`);
    window.localStorage.removeItem(`netrunner-sahasrara-slow-roll-disabled`);
  }

  static dumpState() {
    console.log(window.localStorage.getItem("netrunner-sahasrara"));
  }
}

const TEMP_SAVE = {
  act: { cardId: "act_5" },
  agenda: { cardId: "agenda_4", doom: 11 },
  cards: {
    stack: ["rapid_decay", "rapid_decay"],
    heap: [
      "unsureGamble",
      "soda",
      "zhan_zhuang",
      "inside_job",
      "spike",
      "inside_job",
      "jack_of_all_trades",
      "tread_lightly",
      "backflip",
      "emp_device",
      "emp_device",
      "tread_lightly",
      "push",
      "push",
      "forged_documents",
      "forged_documents",
      "shiv",
      "spike",
      "rapid_decay",
      "backflip",
      "pennyearner",
      "unsureGamble",
      "jack_of_all_trades",
      "docklands_pass",
      "crowbar",
      "crowbar",
      "akauntan",
    ],
    grip: [
      "rapid_decay",
      "rapid_decay",
      "rapid_decay",
      "rapid_decay",
      "rapid_decay",
      "rapid_decay",
      "rapid_decay",
    ],
    rig: [
      { id: "pennyearner", damage: 0, doom: 0, power: 12, tapped: false },
      { id: "docklands_pass", damage: 0, doom: 0, power: 0, tapped: false },
      { id: "akauntan", damage: 0, doom: 0, power: 0, tapped: false },
      { id: "shiv", damage: 1, doom: 0, power: 2, tapped: false },
    ],
  },
  chaos: {
    seed: 3567,
    tokens: [
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
    ],
  },
  encounter: {
    deck: ["anansi", "hydra"],
    discarded: [
      "rapid_decay",
      "something_in_the_dark",
      "rapid_decay",
      "something_in_the_dark",
      "data_raven",
      "archer",
      "surveyor",
      "architect",
    ],
  },
  enemy: {
    nextId: 0,
    enemies: [
      {
        id: "surveyor",
        damage: 2,
        clues: 0,
        doom: 0,
        engaged: true,
        exhausted: false,
        location: 8,
      },
      {
        id: "hantu",
        damage: 8,
        clues: 0,
        doom: 0,
        engaged: false,
        exhausted: true,
        location: 8,
      },
      {
        id: "data_raven",
        damage: 1,
        clues: 0,
        doom: 0,
        engaged: true,
        exhausted: false,
        location: 8,
      },
      {
        id: "architect",
        damage: 0,
        clues: 0,
        doom: 0,
        engaged: true,
        exhausted: false,
        location: 8,
      },
      {
        id: "anansi",
        damage: 0,
        clues: 0,
        doom: 0,
        engaged: false,
        exhausted: false,
        location: 26,
      },
      {
        id: "burke_bug",
        damage: 2,
        clues: 0,
        doom: 0,
        engaged: false,
        exhausted: true,
        location: 8,
      },
      {
        id: "surveyor",
        damage: 0,
        clues: 0,
        doom: 0,
        engaged: true,
        exhausted: false,
        location: 8,
      },
      {
        id: "architect",
        damage: 0,
        clues: 0,
        doom: 0,
        engaged: true,
        exhausted: false,
        location: 8,
      },
    ],
  },
  identity: { id: "baz", damage: 2, doom: 0, tapped: false },
  location: {
    current: 8,
    nextId: 31,
    locations: [
      {
        id: 6,
        cardId: "entrance",
        x: 3,
        y: -1,
        playerDistance: 1,
        clues: 1,
        doom: 0,
        neighbours: [8],
      },
      {
        id: 8,
        cardId: "the_destroyers_eye",
        x: 4,
        y: -1,
        playerDistance: 0,
        clues: 0,
        doom: 0,
        neighbours: [6, 15],
      },
      {
        id: 13,
        cardId: "cloister",
        x: 6,
        y: -1,
        playerDistance: 4,
        clues: 0,
        doom: 0,
        neighbours: [14, 26],
      },
      {
        id: 14,
        cardId: "source",
        x: 6,
        y: 0,
        playerDistance: 5,
        clues: 3,
        doom: 0,
        neighbours: [13],
      },
      {
        id: 15,
        cardId: "data_well",
        x: 4,
        y: -2,
        playerDistance: 1,
        clues: 0,
        doom: 0,
        neighbours: [8, 16, 17],
      },
      {
        id: 16,
        cardId: "tag_storm",
        x: 5,
        y: -2,
        playerDistance: 2,
        clues: 1,
        doom: 0,
        neighbours: [15, 19, 26],
      },
      {
        id: 17,
        cardId: "the_destroyers_eye",
        x: 4,
        y: -3,
        playerDistance: 2,
        clues: 0,
        doom: 0,
        neighbours: [15, 19],
      },
      {
        id: 19,
        cardId: "nebula",
        x: 5,
        y: -3,
        playerDistance: 3,
        clues: 0,
        doom: 0,
        neighbours: [16, 17, 23],
      },
      {
        id: 23,
        cardId: "nest",
        x: 5,
        y: -4,
        playerDistance: 4,
        clues: 0,
        doom: 0,
        neighbours: [19, 25],
      },
      {
        id: 25,
        cardId: "void",
        x: 5,
        y: -5,
        playerDistance: 5,
        clues: 0,
        doom: 0,
        neighbours: [23],
      },
      {
        id: 26,
        cardId: "nest",
        x: 6,
        y: -2,
        playerDistance: 3,
        clues: 0,
        doom: 0,
        neighbours: [13, 16],
      },
    ],
  },
  stats: { link: 5, mu: 2, inf: 4, str: 2, clicks: 0, credits: 16, clues: 0 },
  story: {
    terminals: 2,
    broadcast: false,
    net: true,
    netLocs: ["nebula", "tag_storm", "the_destroyers_eye"],
    netRevealed: 8,
    sourceRevealed: true,
    boss: true,
  },
  tutorial: {
    index: 17,
    triggers: [
      "encounter",
      "commit",
      "exitAct2",
      "firstBroadcast",
      "secondBroadcast",
      "exitAgenda2",
      "enterNetspace",
      "exitAct4",
    ],
    active: false,
    enabled: true,
  },
  uiMode: { uiMode: 9, prevMode: 0 },
};
