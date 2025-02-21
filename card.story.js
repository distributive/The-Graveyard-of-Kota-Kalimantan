Act1 = new ActData("act_1", {
  title: "Act 1",
  requirement: 1,
  act: 1,
  textRequirement: "end your turn with 1 data",
  text: "When your turn ends, spend 1 data to advance the act, if able.",
  image: "img/card/act/bg.png",
  async onTurnEnd(source) {
    if (Stats.clues >= 1) {
      await this.advance(source);
    }
  },
  async advance(source) {
    await Stats.addClues(-1);
    Act.setCard(Act2);
    await wait(200);
    Agenda.setCard(Agenda2);
    await wait(2500);
    await Tutorial.run("agenda");
    new Enemy(EnemyRat, Location.getLocationAtPosition(2, 1));
  },
});

Act2 = new ActData("act_2", {
  title: "Act 2",
  requirement: 3,
  act: 2,
  textRequirement: "end your turn with 3 data",
  text: "When your turn ends, spend 3 data to advance the act, if able.",
  image: "img/card/act/bg.png",
  async onTurnEnd(source) {
    if (Stats.clues >= 3) {
      await this.advance(source);
    }
  },
  async advance(source) {
    await Stats.addClues(-3);
    Act.setCard(Act3);
  },
});

Act3 = new ActData("act_3", {
  title: "Act 3",
  requirement: null,
  act: 3,
  textRequirement: "find the source - it's a location somewhere around you",
  text: "When you reveal the source, advance the act.",
  image: "img/card/act/bg.png",
  async advance(source) {
    Act.setCard(Act4);
  },
});

Act4 = new ActData("act_4", {
  title: "Act 4",
  requirement: null,
  act: 4,
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
  requirement: 5,
  agenda: 1,
  text: "When this hosts 5 or more doom, advance the agenda.",
  image: "img/card/agenda/bg.png",
});

Agenda3 = new AgendaData("agenda_3", {
  title: "Agenda ii",
  requirement: 5,
  agenda: 2,
  text: "When this hosts 5 or more doom, advance the agenda.",
  image: "img/card/agenda/bg.png",
});

Agenda4 = new AgendaData("agenda_4", {
  title: "Agenda iii",
  requirement: 12,
  agenda: 3,
  text: "When this hosts 12 or more doom, escape the simulation.",
  image: "img/card/agenda/bg.png",
});
