// This supports story-specific values and functions
class Story {
  // Broadcast terminals
  static broadcastTerminalsActivated = 0;
  static broadcastTerminalsCompleted = false;

  // Random net locations
  static isInNetspace = false;
  static randomNetLocations = [];
  static netLocationsRevealed = 0;
  static isSourceRevealed = false;

  // Boss
  static isBossSummoned = false;

  static reset() {
    // Broadcast terminals
    this.broadcastTerminalsActivated = 0;
    this.broadcastTerminalsCompleted = false;
    // Netspace
    this.isInNetspace = false;
    this.randomNetLocations = [
      LocationCloister,
      LocationCloister,
      LocationNebula,
      LocationNebula,
      LocationDataWell,
      LocationTagStorm,
      LocationTagStorm,
      LocationNest,
      LocationNest,
      LocationTheDestroyersEye,
      LocationTheDestroyersEye,
      LocationTheDestroyersEye,
    ];
    this.netLocationsRevealed = 0;
    this.isSourceRevealed = false;
    // Boss
    this.isBossSummoned = false;
  }

  static serialise() {
    const netLocations = this.randomNetLocations.map((cardData) => cardData.id);
    return {
      terminals: this.broadcastTerminalsActivated,
      broadcast: this.broadcastTerminalsCompleted,
      net: this.isInNetspace,
      netLocs: netLocations,
      netRevealed: this.netLocationsRevealed,
      sourceRevealed: this.isSourceRevealed,
      boss: this.isBossSummoned,
    };
  }

  static deserialise(json) {
    this.broadcastTerminalsActivated = json.terminals;
    this.broadcastTerminalsCompleted = json.broadcast ? true : false;
    this.isInNetspace = json.net ? true : false;
    this.randomNetLocations = json.netLocs.map((id) => CardData.getCard(id));
    this.netLocationsRevealed = json.netRevealed;
    this.isSourceRevealed = json.sourceRevealed ? true : false;
    this.isBossSummoned = json.boss ? true : false;

    this.setNetspace(this.isInNetspace);
  }

  // Broadcast terminals
  static async activateBroadcastTerminal(locationData) {
    this.broadcastTerminalsActivated++;
    if (this.broadcastTerminalsActivated == 1) {
      // Wait for modal to close
      UiMode.setMode(UIMODE_WAITING);
      await wait(500);
      await Tutorial.run("firstBroadcast");
    } else if (this.broadcastTerminalsActivated == 2) {
      // Wait for modal to close
      UiMode.setMode(UIMODE_WAITING);
      await wait(500);
      await Tutorial.run("secondBroadcast");
    } else if (
      !this.broadcastTerminalsCompleted &&
      this.broadcastTerminalsActivated >= 3
    ) {
      this.broadcastTerminalsCompleted = true;
      if (Act.cardData == Act3) {
        await Act.advance();
      }
    }
  }

  // Netspace
  static async enterNetspace() {
    if (this.isInNetspace) {
      return;
    }
    this.isInNetspace = true;

    Audio.fadeInMusic(AUDIO_TRACK_LEVEL_2, 5000);
    Location.focusMapOffsetCurrentLocation();
    Location.setZoomIndex(0);
    this.setNetspace(true);

    await Agenda.setDoom(0);
    Agenda.setCard(Agenda3);

    // Update all locations
    for (const location of Location.instances) {
      if (location == Location.getCurrentLocation()) {
        location.setCard(LocationEntrance, true, false);
      } else {
        location.setCard(LocationUnknownNet, true, false);
      }
    }

    // Update all enemies (should only be rats)
    for (const enemy of Enemy.instances) {
      enemy.setCard(EnemyNetRat, true, false);
    }

    // Update encounters
    Encounter.setPool(NET_ENCOUNTERS);
  }

  static setNetspace(isNetspace) {
    if (isNetspace) {
      $("body").addClass("netspace");
    } else {
      $("body").removeClass("netspace");
    }
  }

  // Boss
  // Note: it is the responsibility of the caller to ensure the UI mode is set correctly during this
  static async summonBoss() {
    if (this.isBossSummoned) {
      return;
    }
    this.isBossSummoned = true;

    // There should be exactly one entrance location, but we should check
    const locations = Location.instances.filter(
      (location) => location.cardData == LocationEntrance
    );
    const spawnLoc = locations.length
      ? locations[0]
      : Location.getCurrentLocation();

    // Remove all unknown locations
    for (const location of Location.instances.filter(
      (location) =>
        location.cardData == LocationUnknownNet &&
        location != Location.getCurrentLocation()
    )) {
      Location.remove(location);
    }
    Location.recalculatePlayerDistance();
    Location.getCurrentLocation().setCurrentLocation();

    // Update encounters
    Encounter.addPool(BOSS_ENCOUNTERS);

    // Make sure the player sees the spawn
    Location.focusMapOffsetToLocation(spawnLoc);
    Location.resetZoom();

    // Wait for the camera to move then spawn
    await wait(600);
    await Enemy.spawn(EnemyHantu, spawnLoc);
  }
}
