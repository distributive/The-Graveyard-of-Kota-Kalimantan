Act1 = new ActData("act_1", {
  title: "Act 1",
  requirement: 1,
  act: 1,
  textRequirement: "end your turn with 1 data",
  text: "When your turn ends, spend 1 data to advance the act, if able.",
  image: "img/card/act/act1.png",
  illustrator: `Photo by Andrew Amistad, Unsplash (modified)`,
  faction: FACTION_MEAT,
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
    await Enemy.spawn(EnemyRat, spawnLoc);
  },
});

Act2 = new ActData("act_2", {
  title: "Act 2",
  requirement: 3,
  act: 2,
  textRequirement: "end your turn with 3 data",
  text: "When you reveal this act, summon a rat.\n\nWhen your turn ends, spend 3 data to advance the act, if able.",
  image: "img/card/act/act2.png",
  illustrator: `Photo by Michał Franczak, Unsplash (modified)`,
  faction: FACTION_MEAT,
  async onTurnEnd() {
    if (Stats.clues >= this.requirement) {
      await Stats.addClues(-this.requirement);
      await Act.advance();
    }
  },
  async advance() {
    await Tutorial.run("exitAct2");
    Act.setCard(Act3);
    const corners = shuffle([
      Location.getLocationAtPosition(3, 1),
      Location.getLocationAtPosition(3, -1),
      Location.getLocationAtPosition(5, 1),
      Location.getLocationAtPosition(5, -1),
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
  text: "When you have investigated three archives, advance the act.",
  image: "img/card/act/act3.png",
  illustrator: `Photo by Julian Hochgesang, Unsplash (modified)`,
  faction: FACTION_MEAT,
  // Triggered by story.js
  async advance() {
    Audio.fadeOutMusic(2500);
    // Delay for a second to let the Chaos modal close
    UiMode.setMode(UIMODE_WAITING);
    await wait(1000);
    await Tutorial.run("exitAct3", false);
    await Tutorial.run("enterNetspace");
    Act.setCard(Act4);
    await Story.enterNetspace(); // Resetting doom + changing the agenda is performed here
    await Game.nextAction();
  },
});

Act4 = new ActData("act_4", {
  title: "Act 4",
  requirement: null,
  act: 4,
  textRequirement: "find the source - it's a location somewhere around you",
  text: "When you find the source, advance the act and the agenda.",
  image: "img/card/act/act4.png",
  faction: FACTION_NET,
  // Triggered by the location itself
  async advance() {
    await UiMode.setMode(UIMODE_WAITING);
    await wait(1000);
    await Tutorial.run("exitAct4");
    await wait(250);
    Act.setCard(Act5);
    await wait(250);
    Agenda.setDoom(0);
    Agenda.setCard(Agenda4);
    await wait(1500);
    await Story.summonBoss();
    await Game.nextAction();
  },
});

Act5 = new ActData("act_5", {
  title: "Act 5",
  requirement: null,
  act: 5,
  textRequirement: "survive until the agenda advances",
  text: "Survive.",
  image: "img/card/act/act5.png",
  faction: FACTION_NET,
});

// Does nothing - is not visible
Agenda1 = new AgendaData("agenda_1", {
  hidden: true,
});

Agenda2 = new AgendaData("agenda_2", {
  title: "Agenda i",
  requirement: 12,
  agenda: 1,
  text: "When this hosts 12 or more doom, lose all data and advance the agenda.",
  image: "img/card/agenda/agenda2.png",
  illustrator: `Photo by Vasilis Chatzopoulos, Unsplash (modified)`,
  faction: FACTION_MEAT,
  async onDoomPlaced(data) {
    // For now we assume only the agenda can host doom
    if (data.doom >= this.requirement) {
      await Stats.setClues(0);
      await Agenda.advance();
    } else if (data.doom == this.requirement - 1) {
      await new Modal({
        header: "One turn remains",
        body: "The agenda is one doom away from advancing...",
        options: [new Option("", "Okay")],
        cardData: this,
        allowKeyboard: false,
        size: "lg",
      }).display();
      Modal.hide();
    } else if (data.doom == this.requirement - 2) {
      await new Modal({
        header: "Two turns remain",
        body: "The agenda is two doom away from advancing...",
        options: [new Option("", "Okay")],
        cardData: this,
        allowKeyboard: false,
        size: "lg",
      }).display();
      Modal.hide();
    } else if (data.doom == this.requirement - 3) {
      await new Modal({
        header: "Three turns remain",
        body: "The agenda is three doom away from advancing...",
        options: [new Option("", "Okay")],
        cardData: this,
        allowKeyboard: false,
        size: "lg",
      }).display();
      Modal.hide();
    }
  },
  async advance() {
    Audio.fadeOutMusic(2500);
    if (Act.cardData == Act3) {
      await Tutorial.run("exitAgenda2", false);
    } else {
      await Tutorial.run("exitAgenda2NoBroadcast", false);
    }
    await Tutorial.run("enterNetspace");
    if (Act.cardData.act < 4) {
      Act.setCard(Act4);
    }
    await Story.enterNetspace(); // Resetting doom + changing the agenda is performed here
  },
});

Agenda3 = new AgendaData("agenda_3", {
  title: "Agenda ii",
  requirement: 7,
  agenda: 2,
  text: "When this hosts 7 or more doom, succumb to the void (lose).",
  image: "img/card/agenda/agenda3.png",
  faction: FACTION_NET,
  async onDoomPlaced(data) {
    // For now we assume only the agenda can host doom
    if (data.doom >= this.requirement) {
      await Agenda.advance();
    } else if (data.doom == this.requirement - 1) {
      await new Modal({
        header: "One turn remains",
        body: "The agenda is one doom away from advancing...",
        options: [new Option("", "Okay")],
        cardData: this,
        allowKeyboard: false,
        size: "lg",
      }).display();
      Modal.hide();
    } else if (data.doom == this.requirement - 2) {
      await new Modal({
        header: "Two turns remain",
        body: "The agenda is two doom away from advancing...",
        options: [new Option("", "Okay")],
        cardData: this,
        allowKeyboard: false,
        size: "lg",
      }).display();
      Modal.hide();
    } else if (data.doom == this.requirement - 3) {
      await new Modal({
        header: "Three turns remain",
        body: "The agenda is three doom away from advancing...",
        options: [new Option("", "Okay")],
        cardData: this,
        allowKeyboard: false,
        size: "lg",
      }).display();
      Modal.hide();
    }
  },
  async advance() {
    Audio.playEffect(AUDIO_DEATH);
    Ending.show(ENDING_BAD_ACT_THREE);
  },
});

Agenda4 = new AgendaData("agenda_4", {
  title: "Agenda iii",
  requirement: 12,
  agenda: 3,
  // Note: the Hantu effect is implemented on Hantu
  text: "When this hosts 12 or more doom, escape the simulation (win).\n\nAt the end of each turn, spend 1 data to do 1 damage to Hantu.",
  image: "img/card/agenda/agenda4.png",
  illustrator: "Photo by Andrew Amistad, Unsplash (modified)",
  faction: FACTION_NET,
  async onDoomPlaced(data) {
    // For now we assume only the agenda can host doom
    if (data.doom >= this.requirement) {
      await Agenda.advance();
    }
  },
  async advance() {
    Audio.playEffect(AUDIO_DEATH_BOSS);
    Ending.show(ENDING_NEUTRAL);
  },
});
