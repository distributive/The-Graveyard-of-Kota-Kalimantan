Act1 = new ActData("act_1", {
  requirement: "end your turn with 1 data",
  text: "When your turn ends, spend 1 data to advance the act, if able.",
  image: "img/card/act/act1.png",
  async onTurnEnd(source) {
    if (Stats.clues >= 1) {
      await this.advance(source);
    }
  },
  async advance(source) {
    Act.setCard(Act2);
    await wait(200);
    Agenda.setCard(Agenda2);
    await wait(2500);
    await Tutorial.run("agenda");
    new Enemy(EnemyRat, Location.getLocationAtPosition(2, 1));
  },
});

Act2 = new ActData("act_2", {
  requirement: "end your turn with 3 data",
  text: "When your turn ends, spend 3 data to advance the act, if able.",
  image: "img/card/act/act2.png",
  async onTurnEnd(source) {
    if (Stats.clues >= 3) {
      await this.advance(source);
    }
  },
  async advance(source) {
    Act.setCard(Act3);
  },
});

Act3 = new ActData("act_3", {
  requirement: "find the source - it's a location somewhere around you",
  text: "When you reveal the source, advance the act.",
  image: "img/card/act/act3.png",
  async advance(source) {
    Act.setCard(Act4);
  },
});

Act4 = new ActData("act_4", {
  requirement: "survive until the agenda advances",
  text: "Survive.",
  image: "img/card/act/act4.png",
});

// Does nothing - is not visible
Agenda1 = new AgendaData("agenda_1", {
  hidden: true,
});

Agenda2 = new AgendaData("agenda_2", {
  requirement: 3,
  text: "When this hosts 3 or more doom, advance the agenda.",
  image: "img/card/agenda/agenda2.png",
});

Agenda3 = new AgendaData("agenda_3", {
  requirement: 3,
  text: "When this hosts 3 or more doom, advance the agenda.",
  image: "img/card/agenda/agenda3.png",
});

Agenda4 = new AgendaData("agenda_4", {
  requirement: 12,
  text: "When this hosts 12 or more doom, escape the simulation.",
  image: "img/card/agenda/agenda4.png",
});
