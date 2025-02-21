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
  static deserialise(json) {}
}
