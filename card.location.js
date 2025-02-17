// Example room for the tutorial
const LocationRoom = new LocationData("room", {
  title: "Room",
  text: "",
  subtypes: ["place"],
  faction: FACTION_MEAT,
  image: "img/card/location/bg.png",
  shroud: 3,
  clues: 2,
});

///////////////////////////////////////////////////////////////////////////////
// TUTORIAL

const LocationApartment = new LocationData("apartment", {
  title: "Apartment",
  text: "Your home sweet home.",
  subtypes: ["building"],
  faction: FACTION_MEAT,
  image: "img/card/location/apartment.png",
  shroud: 0,
  clues: 0,
});

const LocationWarehouse = new LocationData("warehouse", {
  title: "Warehouse",
  text: "Your next job.",
  subtypes: ["building"],
  faction: FACTION_MEAT,
  image: "img/card/location/warehouse.png",
  shroud: 0,
  clues: 0,
});

///////////////////////////////////////////////////////////////////////////////
// MEATSPACE

const LocationUnknownMeat = new LocationData("unknown_meat", {
  title: "Unknown",
  text: "When you enter this location, flip it.",
  subtypes: ["room", "hidden"],
  faction: FACTION_MEAT,
  image: "img/card/location/unknownMeat.png",
  shroud: 0,
  clues: 0,
  async onPlayerMoves(source, data) {
    if (data.toLocation != source) return;
    // We're hardcoding these based on location (sorry not sorry)
    let cardData;
    if (source.x == 2 && source.y == 0) {
      cardData = LocationTerminal;
      Location.resetZoom();
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
    } else {
      cardData = LocationCorridor;
    }
    source.setCard(cardData);
    source.setClues(cardData.clues);
  },
});

const LocationCorridor = new LocationData("corridor", {
  title: "Corridor",
  text: "",
  subtypes: ["room"],
  faction: FACTION_MEAT,
  image: "img/card/location/corridor.png",
  shroud: 2,
  clues: 0,
});

const LocationTerminal = new LocationData("terminal", {
  title: "Public Access Terminal",
  text: "",
  subtypes: ["room"],
  faction: FACTION_MEAT,
  image: "img/card/location/terminal.png",
  shroud: 3,
  clues: 1,
});

const LocationOffice = new LocationData("office", {
  title: "Ransacked Office",
  text: "",
  subtypes: ["room"],
  faction: FACTION_MEAT,
  image: "img/card/location/office.png",
  shroud: 4,
  clues: 1,
});

const LocationStairs = new LocationData("stairs", {
  title: "Stairs",
  text: "",
  subtypes: ["room"],
  faction: FACTION_MEAT,
  image: "img/card/location/stairs.png",
  shroud: 2,
  clues: 0,
});

const LocationStoreroom = new LocationData("storeroom", {
  title: "Storeroom",
  text: "",
  subtypes: ["room"],
  faction: FACTION_MEAT,
  image: "img/card/location/storeroom.png",
  shroud: 2,
  clues: 2,
});

///////////////////////////////////////////////////////////////////////////////
// NETSPACE

const LocationUnknownNet = new LocationData("unknown_net", {
  title: "Unknown",
  text: "When you enter this location, flip it.",
  subtypes: ["netspace", "hidden"],
  faction: FACTION_NET,
  image: "img/card/location/unknownNet.png",
  shroud: 0,
  clues: 0,
  async onPlayerMoves(source, data) {
    if (data.toLocation != source) return;

    // Reveal the location
    let cardData;
    // After 4 reveals, have a chance to reveal the source (it's guaranteed when there are none left to reveal)
    if (
      !SOURCE_HAS_BEEN_REVEALED &&
      (RANDOM_NET_LOCATIONS.length == 0 ||
        (RANDOM_NET_LOCATIONS_REVEALED > 4 && randomInt(0, 3) == 0))
    ) {
      cardData = LocationSource;
      SOURCE_HAS_BEEN_REVEALED = true;
    }
    // Reveal a random netspace location from the pool
    else if (RANDOM_NET_LOCATIONS.length > 0) {
      const index = randomIndex(RANDOM_NET_LOCATIONS);
      cardData = RANDOM_NET_LOCATIONS[index];
      RANDOM_NET_LOCATIONS.splice(index, 1);
      RANDOM_NET_LOCATIONS_REVEALED++;
    }
    // When netspace locations are exhausted, reveal a void
    else {
      cardData = LocationVoid;
    }
    source.setCard(cardData);
    source.setClues(cardData.clues);

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
  },
});

const LocationEntrance = new LocationData("entrance", {
  title: "Entrance",
  text: "",
  subtypes: ["netspace"],
  faction: FACTION_NET,
  image: "img/card/location/entrance.png",
  shroud: 2,
  clues: 0,
});

const LocationSource = new LocationData("source", {
  title: "Source",
  text: "",
  subtypes: ["netspace", "lair"],
  faction: FACTION_NET,
  image: "img/card/location/source.png",
  shroud: 2,
  clues: 0,
});

const LocationVoid = new LocationData("void", {
  title: "Void",
  text: "Turn back; there is nothing more to find.",
  subtypes: ["netspace"],
  faction: FACTION_NET,
  image: "img/card/location/void.png",
  shroud: 0,
  clues: 0,
});

// Random netspace locations
const RANDOM_NET_LOCATIONS = [];
let RANDOM_NET_LOCATIONS_REVEALED = 0;
let SOURCE_HAS_BEEN_REVEALED = false;

const LocationCloister = new LocationData("cloister", {
  title: "Cloister",
  text: "",
  subtypes: ["netspace"],
  faction: FACTION_NET,
  image: "img/card/location/cloister.png",
  shroud: 2,
  clues: 0,
});
RANDOM_NET_LOCATIONS.push(LocationCloister);
RANDOM_NET_LOCATIONS.push(LocationCloister);
RANDOM_NET_LOCATIONS.push(LocationCloister);

const LocationNebula = new LocationData("nebula", {
  title: "Nebula",
  text: "",
  subtypes: ["netspace"],
  faction: FACTION_NET,
  image: "img/card/location/nebula.png",
  shroud: 4,
  clues: 1,
});
RANDOM_NET_LOCATIONS.push(LocationNebula);
RANDOM_NET_LOCATIONS.push(LocationNebula);

const LocationDataWell = new LocationData("data_well", {
  title: "Data Well",
  text: "When the last clue is removed from this location, heal 3 damage from your identity and place 1 doom on the agenda.",
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
RANDOM_NET_LOCATIONS.push(LocationDataWell);

const LocationTagStorm = new LocationData("tag_storm", {
  title: "Tag Storm",
  text: "Whenever you successfully jack in while at this location, suffer 1 damage.",
  subtypes: ["netspace"],
  faction: FACTION_NET,
  image: "img/card/location/tagStorm.png",
  shroud: 1,
  clues: 2,
  async onInvestigation(source, data) {
    if (data.results.success && source == Location.getCurrentLocation()) {
      await Game.sufferDamage(1);
    }
  },
});
RANDOM_NET_LOCATIONS.push(LocationTagStorm);
RANDOM_NET_LOCATIONS.push(LocationTagStorm);

const LocationNest = new LocationData("nest", {
  title: "Nest",
  text: "Whenever you move out of this location, spawn an enemy here.",
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
RANDOM_NET_LOCATIONS.push(LocationNest);

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
RANDOM_NET_LOCATIONS.push(LocationTheDestroyersEye);
RANDOM_NET_LOCATIONS.push(LocationTheDestroyersEye);
RANDOM_NET_LOCATIONS.push(LocationTheDestroyersEye);
