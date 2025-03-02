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

  static reset() {
    // Netspace
    this.isInNetspace = false;
    this.randomNetLocations = [
      LocationCloister,
      LocationCloister,
      LocationCloister,
      LocationNebula,
      LocationNebula,
      LocationDataWell,
      LocationTagStorm,
      LocationTagStorm,
      LocationNest,
      LocationTheDestroyersEye,
      LocationTheDestroyersEye,
      LocationTheDestroyersEye,
    ];
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
    };
  }

  static deserialise(json) {
    this.broadcastTerminalsActivated = json.terminals;
    this.broadcastTerminalsCompleted = json.broadcast;
    this.isInNetspace = json.net;
    this.randomNetLocations = json.netLocs.map((id) => CardData.getCard(id));
    this.netLocationsRevealed = json.netRevealed;
    this.isSourceRevealed = json.sourceRevealed;

    this.setNetspace(this.isInNetspace);
  }

  // Broadcast terminals
  static activateBroadcastTerminal(locationData) {
    this.broadcastTerminalsActivated++;
    if (
      !this.broadcastTerminalsCompleted &&
      this.broadcastTerminalsActivated >= 3
    ) {
      this.broadcastTerminalsCompleted = true;
      if (Act.cardData == Act3) {
        Act.advance();
      }
    }
  }

  // Netspace
  static enterNetspace() {
    if (this.isInNetspace) {
      return;
    }
    this.isInNetspace = true;
    Location.focusMapOffsetCurrentLocation();
    Location.setZoomIndex(0);
    this.setNetspace(true);

    Agenda.setDoom(0);
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
}
