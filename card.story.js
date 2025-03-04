Act1 = new ActData("act_1", {
  title: "Act 1",
  requirement: 1,
  act: 1,
  textRequirement: "end your turn with 1 data",
  text: "When your turn ends, spend 1 data to advance the act, if able.",
  image: "img/card/act/bg.png",
  async onTurnEnd() {
    if (Stats.clues >= this.requirement) {
      await Stats.addClues(-this.requirement);
      await Act.advance();
    }
  },
  async advance() {
    Act.setCard(Act2);
    await wait(200);
    if (Tutorial.active) {
      Agenda.setCard(Agenda2);
      await wait(2500);
      await Tutorial.run("agenda");
    }
    // Spawn a rat at an adjacent location
    const neighbours = Location.getCurrentLocation().neighbours;
    let spawnLoc;
    if (neighbours.length) {
      spawnLoc = randomElement(neighbours);
    } else {
      spawnLoc = Location.getCurrentLocation();
    }
    new Enemy(EnemyRat, spawnLoc);
  },
});

Act2 = new ActData("act_2", {
  title: "Act 2",
  requirement: 3,
  act: 2,
  textRequirement: "end your turn with 3 data",
  text: "When you reveal this act, summon a rat.\n\nWhen your turn ends, spend 3 data to advance the act, if able.",
  image: "img/card/act/bg.png",
  async onTurnEnd() {
    if (Stats.clues >= this.requirement) {
      await Stats.addClues(-this.requirement);
      await Act.advance();
    }
  },
  async advance() {
    // TODO - lore
    Act.setCard(Act3);
    const corners = shuffle([
      Location.getLocationAtPosition(2, 1),
      Location.getLocationAtPosition(2, -1),
      Location.getLocationAtPosition(6, 1),
      Location.getLocationAtPosition(6, -1),
    ]);
    // These checks are for safety but should never fail
    if (corners[0]) {
      corners[0].setCard(LocationBroadcastInfluence);
      corners[0].setClues(LocationBroadcastInfluence.clues);
    }
    if (corners[1]) {
      corners[1].setCard(LocationBroadcastMu);
      corners[1].setClues(LocationBroadcastMu.clues);
    }
    if (corners[2]) {
      corners[2].setCard(LocationBroadcastStrength);
      corners[2].setClues(LocationBroadcastStrength.clues);
    }
    if (corners[3]) {
      corners[3].setCard(LocationBroadcastLink);
      corners[3].setClues(LocationBroadcastLink.clues);
    }
    // Also for safety
    Story.broadcastTerminalsActivated = 0;
    Story.broadcastTerminalsCompleted = false;
  },
});

Act3 = new ActData("act_3", {
  title: "Act 3",
  requirement: null,
  act: 3,
  textRequirement: "",
  text: "When you activate three broadcast terminals, advance the act.",
  image: "img/card/act/bg.png",
  // Triggered by story.js
  async advance() {
    // TODO - lore
    Act.setCard(Act4);
    Agenda.setDoom(0);
    Agenda.setCard(Agenda4);
    Story.enterNetspace();
  },
});

Act4 = new ActData("act_4", {
  title: "Act 4",
  requirement: null,
  act: 4,
  textRequirement: "find the source - it's a location somewhere around you",
  text: "When you find the source, advance the act and the agenda.",
  image: "img/card/act/bg.png",
  // Triggered by the location itself
  async advance() {
    // TODO - lore
    await UiMode.setMode(UIMODE_WAITING);
    Act.setCard(Act4);
    await wait(250);
    Agenda.setDoom(0);
    Agenda.setCard(Agenda4);
    await wait(1500);
    await Story.summonBoss();
    if (!Game.checkTurnEnd()) {
      UiMode.setMode(UIMODE_SELECT_ACTION);
    }
  },
});

Act5 = new ActData("act_5", {
  title: "Act 5",
  requirement: null,
  act: 5,
  textRequirement: "survive until the agenda advances",
  text: "Survive.",
  image: "img/card/act/bg.png",
});

// Does nothing - is not visible
Agenda1 = new AgendaData("agenda_1", {
  hidden: true,
});

Agenda2 = new AgendaData("agenda_2", {
  title: "Agenda i",
  requirement: 10,
  agenda: 1,
  text: "When this hosts 10 or more doom, lose all data and advance the agenda.",
  image: "img/card/agenda/bg.png",
  async onDoomPlaced(data) {
    // For now we assume only the agenda can host doom
    if (data.doom >= this.requirement) {
      Stats.setClues(0);
      await Agenda.advance();
    }
  },
  async advance() {
    // TODO - lore
    if (Act.cardData.act < 4) {
      Act.setCard(Act4);
    }
    Agenda.setDoom(0);
    Agenda.setCard(Agenda3);
    await Story.enterNetspace();
  },
});

Agenda3 = new AgendaData("agenda_3", {
  title: "Agenda ii",
  requirement: 6,
  agenda: 2,
  text: "When this hosts 6 or more doom, succumb to the void.",
  image: "img/card/agenda/bg.png",
  async onDoomPlaced(data) {
    // For now we assume only the agenda can host doom
    if (data.doom >= this.requirement) {
      await Agenda.advance();
    }
  },
  async advance() {
    // TODO - lose state (no scoop)
  },
});

Agenda4 = new AgendaData("agenda_4", {
  title: "Agenda iii",
  requirement: 12,
  agenda: 3,
  // Note: the Hantu effect is implemented on Hantu
  text: "When this hosts 12 or more doom, escape the simulation.\n\nAt the end of each turn, spend 1 data to do 1 damage to Hantu.",
  image: "img/card/agenda/bg.png",
  async onDoomPlaced(data) {
    // For now we assume only the agenda can host doom
    if (data.doom >= this.requirement) {
      await Agenda.advance();
    }
  },
  async advance() {
    // TODO - victory state (neutral ending)
  },
});
