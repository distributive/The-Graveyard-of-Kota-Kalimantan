///////////////////////////////////////////////////////////////////////////////
// TUTORIAL

const LocationApartment = new LocationData("apartment", {
  title: "Apartment",
  text: "Your home sweet home.",
  subtypes: ["building"],
  faction: FACTION_MEAT,
  image: "img/card/location/apartment.png",
  illustrator: "Photo by Khachik Simonian, Unsplash (modified)",
  shroud: 0,
  clues: 0,
});

const LocationHideout = new LocationData("hideout", {
  title: "Hideout",
  text: "Your home sweet home.",
  subtypes: ["building"],
  faction: FACTION_MEAT,
  image: "img/card/location/hideout.png",
  illustrator: "Photo by Mark Eder, Unsplash (modified)",
  shroud: 0,
  clues: 0,
});

const LocationPenthouse = new LocationData("penthouse", {
  title: "Penthouse",
  text: "Your home sweet home.",
  subtypes: ["building"],
  faction: FACTION_MEAT,
  image: "img/card/location/penthouse.png",
  illustrator: "Photo by Mostafa Safadel, Unsplash (modified)",
  shroud: 0,
  clues: 0,
});

const LocationWarehouse = new LocationData("warehouse", {
  title: "Warehouse",
  text: "Your next job.",
  flavour: "If you lived here, you'd have your scoop by now!",
  subtypes: ["building"],
  faction: FACTION_MEAT,
  image: "img/card/location/warehouse.png",
  illustrator: "Photo by Zach Heiberg, Unsplash (modified)",
  shroud: 0,
  clues: 0,
  enterSfx: AUDIO_MOVE_OUTSIDE,
});

///////////////////////////////////////////////////////////////////////////////
// MEATSPACE

const LocationUnknownMeat = new LocationData("unknown_meat", {
  title: "Unknown",
  text: "When you enter this location, flip it.",
  subtypes: ["room", "hidden"],
  faction: FACTION_MEAT,
  image: "img/card/location/unknownMeat.png",
  flavour: "oooOOOoooOOOooo spooky!",
  shroud: 0,
  clues: 0,
  async onPlayerMoves(source, data) {
    if (data.toLocation != source) return;
    // We're hardcoding these based on location (sorry not sorry)
    let cardData;
    if (source.x == 2 && source.y == 0) {
      cardData = LocationTerminal;
      if (Tutorial.active) {
        Location.resetZoom();
      }
    } else if (
      (source.x == 2 && source.y == 1) ||
      (source.x == 2 && source.y == -1) ||
      (source.x == 6 && source.y == 1) ||
      (source.x == 6 && source.y == -1)
    ) {
      cardData = LocationStairs;
    } else if (source.x == 4 && source.y == 0) {
      cardData = LocationOffice;
    } else if (source.x == 6 && source.y == 0) {
      cardData = LocationStoreroom;
    } else if (source.x == 4) {
      cardData = LocationJunction;
    } else {
      cardData = LocationCorridor;
    }
    source.setCard(cardData);
    await source.addClues(cardData.clues);
  },
});

const LocationCorridor = new LocationData("corridor", {
  title: "Corridor",
  text: "",
  flavour:
    "In the dark, windowless hallways, it almost feels like it twists onwards forever.",
  subtypes: ["room"],
  faction: FACTION_MEAT,
  image: "img/card/location/corridor.png",
  illustrator: "Photo by Matthew Feeney, Unsplash (modified)",
  shroud: 2,
  clues: 0,
});

const LocationTerminal = new LocationData("terminal", {
  title: "Private Access Terminal",
  text: "",
  flavour: `You see some grafiti etched into the side of the hardware.<br>It reads: "try jacking in at this location to download the data from it".`,
  subtypes: ["room"],
  faction: FACTION_MEAT,
  image: "img/card/location/terminal.png",
  illustrator: "Photo by Tina Rataj-Berard, Unsplash (modified)",
  shroud: 3,
  clues: 1,
});

const LocationOffice = new LocationData("office", {
  title: "Ransacked Office",
  text: "",
  subtypes: ["room"],
  faction: FACTION_MEAT,
  image: "img/card/location/office.png",
  illustrator: "Photo by Jon Butterworth, Unsplash (modified)",
  shroud: 4,
  clues: 1,
});

const LocationStairs = new LocationData("stairs", {
  title: "Stairs",
  text: "",
  flavour: "Up or down; it makes no difference.",
  subtypes: ["room"],
  faction: FACTION_MEAT,
  image: "img/card/location/stairs.png",
  illustrator: "Photo by Greg Panagiotoglou, Unsplash (modified)",
  shroud: 2,
  clues: 0,
});

const LocationStoreroom = new LocationData("storeroom", {
  title: "Storeroom",
  text: "",
  subtypes: ["room"],
  faction: FACTION_MEAT,
  image: "img/card/location/storeroom.png",
  illustrator: "Photo by Peter Herrmann, Unsplash (modified)",
  shroud: 2,
  clues: 3,
});

const LocationJunction = new LocationData("junction", {
  title: "Junction",
  text: "",
  subtypes: ["room"],
  faction: FACTION_MEAT,
  image: "img/card/location/junction.png",
  illustrator: "Photo by Mick De Paola, Unsplash (modified)",
  shroud: 2,
  clues: 1,
});

// Broadcast stations
const LocationBroadcastInfluence = new LocationData("broadcast_influence", {
  title: "Broadcast Terminal",
  text: "When you jack in at this location, test against {influence} instead of {mu}.\nWhen you download the last data from this location, activate this terminal.",
  flavour:
    "You're sure you've seen this model before. If only you could remember where.",
  subtypes: ["room"],
  faction: FACTION_MEAT,
  image: "img/card/location/broadcastRed.png",
  illustrator: "Photo by Peter Herrmann, Unsplash (modified)",
  shroud: 4,
  clues: 1,
  statOverride: "influence",
  async onGainClues(source, data) {
    if (source.clues == 0) {
      source.setCard(LocationBroadcastActive);
      await Story.activateBroadcastTerminal(this);
    }
  },
});

const LocationBroadcastMu = new LocationData("broadcast_mu", {
  title: "Broadcast Terminal",
  text: "When you download the last data from this location, activate this terminal.",
  flavour: "This tech has seen better days.",
  subtypes: ["room"],
  faction: FACTION_MEAT,
  image: "img/card/location/broadcastPurple.png",
  illustrator: "Photo by Peter Herrmann, Unsplash (modified)",
  shroud: 4,
  clues: 1,
  async onGainClues(source, data) {
    if (source.clues == 0) {
      source.setCard(LocationBroadcastActive);
      await Story.activateBroadcastTerminal(this);
    }
  },
});

const LocationBroadcastStrength = new LocationData("broadcast_strength", {
  title: "Broadcast Terminal",
  text: "When you jack in at this location, test against {strength} instead of {mu}.\nWhen you download the last data from this location, activate this terminal.",
  flavour: "It looks like it needs prying open.",
  subtypes: ["room"],
  faction: FACTION_MEAT,
  image: "img/card/location/broadcastGreen.png",
  illustrator: "Photo by Peter Herrmann, Unsplash (modified)",
  shroud: 4,
  clues: 1,
  statOverride: "strength",
  async onGainClues(source, data) {
    if (source.clues == 0) {
      source.setCard(LocationBroadcastActive);
      await Story.activateBroadcastTerminal(this);
    }
  },
});

const LocationBroadcastLink = new LocationData("broadcast_link", {
  title: "Broadcast Terminal",
  text: "When you jack in at this location, test against {link} instead of {mu}.\nWhen you download the last data from this location, activate this terminal.",
  flavour: "It's encrypted.",
  subtypes: ["room"],
  faction: FACTION_MEAT,
  image: "img/card/location/broadcastYellow.png",
  illustrator: "Photo by Peter Herrmann, Unsplash (modified)",
  shroud: 4,
  clues: 1,
  statOverride: "link",
  async onGainClues(source, data) {
    if (source.clues == 0) {
      source.setCard(LocationBroadcastActive);
      await Story.activateBroadcastTerminal(this);
    }
  },
});

const LocationBroadcastActive = new LocationData("broadcast_active", {
  title: "Broadcast Terminal",
  text: "",
  flavour: "UNWRITTEN",
  subtypes: ["room"],
  faction: FACTION_MEAT,
  image: "img/card/location/broadcastActive.png",
  illustrator: "Photo by Peter Herrmann, Unsplash (modified)",
  shroud: 4,
  clues: 0,
});

///////////////////////////////////////////////////////////////////////////////
// NETSPACE

const LocationUnknownNet = new LocationData("unknown_net", {
  title: "Unknown",
  text: "When you enter this location, flip it.",
  flavour: "Tread carefully.",
  subtypes: ["netspace", "hidden"],
  faction: FACTION_NET,
  image: "img/card/location/unknownNet.png",
  shroud: 0,
  clues: 0,
  async onPlayerMoves(source, data) {
    if (data.toLocation != source) return;

    // Reveal the location
    let cardData;
    // After 7 reveals, have a chance to reveal the source (it's guaranteed when there are none left to reveal)
    // If it is the last two clicks before the agenda would advance, remove the random chance
    if (
      !Story.isSourceRevealed &&
      (Story.randomNetLocations.length == 0 ||
        (Story.netLocationsRevealed > 7 &&
          ((Agenda.cardData == Agenda3 &&
            Agenda.doom == Agenda.cardData.requirement - 1 &&
            Stats.clicks < 2) ||
            randomInt(0, 3) == 0)))
    ) {
      cardData = LocationSource;
      Story.isSourceRevealed = true;
    }
    // Reveal a random netspace location from the pool
    else if (Story.randomNetLocations.length > 0) {
      const index = randomIndex(Story.randomNetLocations);
      cardData = Story.randomNetLocations[index];
      Story.randomNetLocations.splice(index, 1);
      Story.netLocationsRevealed++;
    }
    // When netspace locations are exhausted, reveal a void
    else {
      cardData = LocationVoid;
    }
    source.setCard(cardData);
    source.addClues(cardData.clues);

    // Summon neighbouring locations
    const [x, y] = source.pos;
    const neighbourLocations = [
      [x + 1, y],
      [x, y - 1],
      [x - 1, y],
      [x, y + 1],
    ];
    for (const [nx, ny] of neighbourLocations) {
      const neighbour = Location.getLocationAtPosition(nx, ny);
      if (neighbour) {
        source.addNeighbour(neighbour);
      } else if (cardData != LocationVoid) {
        const location = new Location(LocationUnknownNet, nx, ny);
        source.addNeighbour(location);
        // Connect the new location to any other existince neighbours
        const nestedNeighbourLocations = [
          [nx + 1, ny],
          [nx, ny - 1],
          [nx - 1, ny],
          [nx, ny + 1],
        ];
        for (const [nnx, nny] of nestedNeighbourLocations) {
          const nestedNeighbour = Location.getLocationAtPosition(nnx, nny);
          if (nestedNeighbour) {
            location.addNeighbour(nestedNeighbour);
          }
        }
      }
    }
    Location.recalculatePlayerDistance();

    // Story progression
    if (cardData == LocationSource && Act.cardData == Act4) {
      await Act.advance();
    }
  },
});

const LocationEntrance = new LocationData("entrance", {
  title: "Entrance",
  text: "",
  flavour: "No exit.",
  subtypes: ["netspace"],
  faction: FACTION_NET,
  image: "img/card/location/entrance.png",
  shroud: 2,
  clues: 0,
});

const LocationSource = new LocationData("source", {
  title: "Source",
  text: "",
  flavour: `"Come to me. I am awake."`,
  subtypes: ["netspace", "lair"],
  faction: FACTION_NET,
  image: "img/card/location/source.png",
  shroud: 2,
  clues: 0,
  async onPlayerMoves(source, data) {
    if (data.toLocation != source || Act.cardData != Act4) return;
    await Act.advance();
  },
});

const LocationVoid = new LocationData("void", {
  title: "Void",
  text: "There is nothing more to find.",
  flavour: "Even infinity has walls.",
  subtypes: ["netspace"],
  faction: FACTION_NET,
  image: "img/card/location/void.png",
  shroud: 0,
  clues: 0,
});

// Random netspace locations
const LocationCloister = new LocationData("cloister", {
  title: "Cloister",
  text: "",
  subtypes: ["netspace"],
  faction: FACTION_NET,
  image: "img/card/location/cloister.png",
  shroud: 2,
  clues: 0,
});

const LocationNebula = new LocationData("nebula", {
  title: "Nebula",
  text: "",
  subtypes: ["netspace"],
  faction: FACTION_NET,
  image: "img/card/location/nebula.png",
  shroud: 4,
  clues: 1,
});

const LocationDataWell = new LocationData("data_well", {
  title: "Data Well",
  text: "When you download the last data from this location, heal 3 damage from your identity and place 1 doom on the agenda.",
  subtypes: ["netspace"],
  faction: FACTION_NET,
  image: "img/card/location/dataWell.png",
  shroud: 3,
  clues: 3,
  async onInvestigation(source, data) {
    if (data.location == source && source.clues == 0) {
      Agenda.addDoom(1);
      Identity.addDamage(-3);
    }
  },
});

const LocationTagStorm = new LocationData("tag_storm", {
  title: "Tag Storm",
  text: "Whenever you successfully jack in while at this location, suffer 1 damage.",
  subtypes: ["netspace", "hostile"],
  faction: FACTION_NET,
  image: "img/card/location/tagStorm.png",
  shroud: 1,
  clues: 2,
  async onInvestigation(source, data) {
    if (data.results.success && source == Location.getCurrentLocation()) {
      await Game.sufferDamage(1, "Tag Storm");
    }
  },
});

const LocationNest = new LocationData("nest", {
  title: "Nest",
  text: "Whenever you move out of this location, spawn a bug.",
  subtypes: ["netspace", "lair"],
  faction: FACTION_NET,
  image: "img/card/location/nest.png",
  shroud: 2,
  clues: 0,
  async onPlayerMoves(source, data) {
    if (data.fromLocation == source) {
      await Enemy.spawn(EnemyBurkeBug, source);
    }
  },
});

const LocationTheDestroyersEye = new LocationData("the_destroyers_eye", {
  title: "The Destroyer's Eye",
  text: "If you end your turn at this location, discard 1 card from your hand.",
  subtypes: ["netspace", "observer"],
  faction: FACTION_NET,
  image: "img/card/location/eye.png",
  shroud: 2,
  clues: 0,
  async onTurnEnd(source, data) {
    if (source == Location.getCurrentLocation() && Cards.grip.length > 0) {
      await UiMode.setMode(UIMODE_SELECT_GRIP_CARD, {
        message: `The Destroyer's Eye: Select 1 card to discard.`,
        minCards: 1,
        maxCards: 1,
        canCancel: false,
      });
      await Cards.discard(UiMode.data.selectedCards[0]);
    }
  },
});
