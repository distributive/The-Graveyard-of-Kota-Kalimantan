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
      tutorial: tutorial,
      uiMode: uiMode,
    };
  }

  // Create the game state represented by a json object
  static async deserialise(json) {
    Broadcast.disable();

    Location.deserialise(json.location); // Enemies require locations to be loaded before them
    Act.deserialise(json.act);
    Agenda.deserialise(json.agenda);
    await Cards.deserialise(json.cards);
    Chaos.deserialise(json.chaos);
    Encounter.deserialise(json.encounter);
    await Enemy.deserialise(json.enemy);
    Identity.deserialise(json.identity);
    await Stats.deserialise(json.stats);
    Tutorial.deserialise(json.tutorial);
    await UiMode.deserialise(json.uiMode); // Should be last, as it will call setMode

    Broadcast.enable();
  }
}

const temp = {
  act: { cardId: "act_1" },
  agenda: { cardId: "agenda_2", doom: 3 },
  cards: {
    stack: [
      "tread_lightly",
      "difficult_john",
      "docklands_pass",
      "backflip",
      "akauntan",
      "spike",
      "infiltrate",
      "crowbar",
      "push",
      "inside_job",
      "forged_documents",
      "emp_device",
      "jack_of_all_trades",
      "backflip",
      "docklands_pass",
      "pennyearner",
      "jack_of_all_trades",
      "difficult_john",
      "unsureGamble",
      "emp_device",
      "forged_documents",
      "crowbar",
    ],
    heap: ["spike"],
    grip: ["tread_lightly", "inside_job", "shiv", "akauntan", "unsureGamble"],
    rig: [
      { id: "pennyearner", doom: 0, power: 2, tapped: false },
      { id: "shiv", damage: 0, doom: 0, power: 2, tapped: false },
    ],
  },
  chaos: [
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
  encounter: {
    deck: ["clumsy", "faulty_hardware", "rat", "rat"],
    discarded: ["falling_debris", "what_was_that", "rat"],
  },
  enemy: [
    {
      id: "rat",
      damage: 0,
      clues: 0,
      doom: 0,
      engaged: true,
      exhausted: false,
      location: 4,
    },
  ],
  identity: { id: "baz", damage: 3, doom: 0, tapped: false },
  location: {
    current: 4,
    nextId: 14,
    locations: [
      {
        id: 0,
        cardId: "corridor",
        x: 1,
        y: 0,
        playerDistance: 5,
        clues: 0,
        doom: 0,
        neighbours: [6],
      },
      {
        id: 1,
        cardId: "stairs",
        x: 2,
        y: 1,
        playerDistance: 3,
        clues: 0,
        doom: 0,
        neighbours: [6, 2],
      },
      {
        id: 2,
        cardId: "corridor",
        x: 3,
        y: 1,
        playerDistance: 2,
        clues: 0,
        doom: 0,
        neighbours: [1, 3],
      },
      {
        id: 3,
        cardId: "corridor",
        x: 4,
        y: 1,
        playerDistance: 1,
        clues: 0,
        doom: 0,
        neighbours: [2, 4, 7],
      },
      {
        id: 4,
        cardId: "corridor",
        x: 5,
        y: 1,
        playerDistance: 0,
        clues: 0,
        doom: 0,
        neighbours: [3, 5],
      },
      {
        id: 5,
        cardId: "unknown_meat",
        x: 6,
        y: 1,
        playerDistance: 1,
        clues: 0,
        doom: 0,
        neighbours: [4, 8],
      },
      {
        id: 6,
        cardId: "terminal",
        x: 2,
        y: 0,
        playerDistance: 4,
        clues: 0,
        doom: 0,
        neighbours: [0, 1, 9],
      },
      {
        id: 7,
        cardId: "unknown_meat",
        x: 4,
        y: 0,
        playerDistance: 2,
        clues: 0,
        doom: 0,
        neighbours: [3, 11],
      },
      {
        id: 8,
        cardId: "unknown_meat",
        x: 6,
        y: 0,
        playerDistance: 2,
        clues: 0,
        doom: 0,
        neighbours: [5, 13],
      },
      {
        id: 9,
        cardId: "unknown_meat",
        x: 2,
        y: -1,
        playerDistance: 5,
        clues: 0,
        doom: 0,
        neighbours: [6, 10],
      },
      {
        id: 10,
        cardId: "unknown_meat",
        x: 3,
        y: -1,
        playerDistance: 4,
        clues: 0,
        doom: 0,
        neighbours: [9, 11],
      },
      {
        id: 11,
        cardId: "unknown_meat",
        x: 4,
        y: -1,
        playerDistance: 3,
        clues: 0,
        doom: 0,
        neighbours: [7, 10, 12],
      },
      {
        id: 12,
        cardId: "unknown_meat",
        x: 5,
        y: -1,
        playerDistance: 4,
        clues: 0,
        doom: 0,
        neighbours: [11, 13],
      },
      {
        id: 13,
        cardId: "unknown_meat",
        x: 6,
        y: -1,
        playerDistance: 3,
        clues: 0,
        doom: 0,
        neighbours: [8, 12],
      },
    ],
  },
  stats: { link: 5, mu: 2, inf: 4, str: 2, clicks: 3, credits: 4, clues: 0 },
  tutorial: { triggers: [], mode: 0 },
  uiMode: { uiMode: 2, prevMode: 4 },
};
