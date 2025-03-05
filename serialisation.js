class Serialisation {
  // Convert the game state into a json object
  static serialise() {
    const act = Act.serialise();
    const agenda = Agenda.serialise();
    const audio = Audio.serialise();
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
      audio: audio,
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
    Audio.deserialise(json.audio);
    await Cards.deserialise(json.cards);
    Chaos.deserialise(json.chaos);
    Encounter.deserialise(json.encounter);
    await Enemy.deserialise(json.enemy);
    Identity.deserialise(json.identity);
    await Stats.deserialise(json.stats);
    Story.deserialise(json.story);
    Tutorial.deserialise(json.tutorial);
    await UiMode.deserialise(json.uiMode); // Should be last, as it will call setMode

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
      json = JSON.parse(
        jsonOverwrite
          ? jsonOverwrite
          : window.localStorage.getItem("netrunner-sahasrara")
      );
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

  static saveSetting(key, value) {
    window.localStorage.setItem(`netrunner-sahasrara-${key}`, value);
  }
  static loadSetting(key) {
    return window.localStorage.getItem(`netrunner-sahasrara-${key}`);
  }
  static deleteSetting(key) {
    value = window.localStorage.getItem(`netrunner-sahasrara-${key}`);
    window.localStorage.removeItem(`netrunner-sahasrara-${key}`);
    return value;
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
}
