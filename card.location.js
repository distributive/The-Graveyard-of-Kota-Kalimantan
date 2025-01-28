const LocationRoom = new LocationData("room", {
  title: "Room",
  text: "Whenever you enter this location, place 1 clue and 1 doom on it.",
  subtypes: ["place"],
  faction: FACTION_MEAT,
  image: "img/card/location/bg.png",
  shroud: 3,
  clues: 2,
});

const LocationUnknownMeat = new LocationData("unknown_meat", {
  title: "Unknown",
  text: "When you enter this location, flip it.",
  subtypes: ["hidden"],
  faction: FACTION_MEAT,
  image: "img/card/location/unknownMeat.png",
  shroud: 0,
  clues: 0,
});

const LocationUnknownNet = new LocationData("unknown_net", {
  title: "Unknown",
  text: "When you enter this location, flip it.",
  subtypes: ["hidden", "netspace"],
  faction: FACTION_NET,
  image: "img/card/location/unknownNet.png",
  shroud: 0,
  clues: 0,
  async onPlayerMoves(source, data) {
    if (data.toLocation != source) return;

    // Reveal the location
    let cardData;
    if (RANDOM_NET_LOCATIONS.length > 0) {
      const index = randomIndex(RANDOM_NET_LOCATIONS);
      cardData = RANDOM_NET_LOCATIONS[index];
      RANDOM_NET_LOCATIONS.splice(index, 1);
    } else {
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
  shroud: 4,
  clues: 0,
});

// Random netspace locations
const RANDOM_NET_LOCATIONS = [];

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
  text: "When the last clue is removed from this location, place 1 doom on the agenda.",
  subtypes: ["netspace"],
  faction: FACTION_NET,
  image: "img/card/location/dataWell.png",
  shroud: 3,
  clues: 3,
});
RANDOM_NET_LOCATIONS.push(LocationDataWell);

const LocationTagStorm = new LocationData("tag_storm", {
  title: "Tag Storm",
  text: "Whenever you successfully download data at this location, suffer 1 damage.",
  subtypes: ["netspace"],
  faction: FACTION_NET,
  image: "img/card/location/tagStorm.png",
  shroud: 1,
  clues: 2,
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
});
RANDOM_NET_LOCATIONS.push(LocationNest);

const LocationEye = new LocationData("eye", {
  title: "Eye",
  text: "If you end your turn at this location, discard 1 card from your hand.",
  subtypes: ["netspace", "observer"],
  faction: FACTION_NET,
  image: "img/card/location/eye.png",
  shroud: 2,
  clues: 0,
});
RANDOM_NET_LOCATIONS.push(LocationEye);
RANDOM_NET_LOCATIONS.push(LocationEye);
RANDOM_NET_LOCATIONS.push(LocationEye);
