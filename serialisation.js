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
}
