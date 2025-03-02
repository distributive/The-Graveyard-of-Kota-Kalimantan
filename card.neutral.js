///////////////////////////////////////////////////////////////////////////////
// ASSETS

// Special tutorial asset
CardWarehouseKey = new AssetData("warehouse_key", {
  title: "Warehouse Key",
  text: "{click}: Unlock the warehouse. Draw 2 cards. Remove this asset from the game.",
  flavour: `TODO: write some backstory as to how you got this."`,
  subtypes: ["item"],
  faction: FACTION_NEUTRAL,
  image: "img/card/asset/warehouseKey.png",
  cost: 4,
  uncollectable: true,
  async onUse(source) {
    // The layout this produces must match the non-tuturial starting layout in game.js
    if (Tutorial.mode != TUTORIAL_MODE_USE_ASSET) return;
    await Stats.addClicks(-1);
    await Cards.removeInstalledCardFromGame(source);
    await Cards.draw(2);
    // Remove the previous layout
    for (const location of Location.instances) {
      if (location != Location.getCurrentLocation()) {
        Location.remove(location);
      }
    }
    // Set camera to see the new locations
    Location.focusMapOffsetToLocationPosition(4, 0);
    Location.setZoomIndex(0); // Zoom out fully
    // Change current location
    Location.getCurrentLocation().setCard(LocationCorridor);
    // Create new floorplan (current location expected to be at (1,0))
    const l_ = Location.getCurrentLocation();
    const l5 = new Location(LocationUnknownMeat, 2, 0);
    await wait(250);
    const l0 = new Location(LocationUnknownMeat, 2, 1);
    const l8 = new Location(LocationUnknownMeat, 2, -1);
    await wait(250);
    const l1 = new Location(LocationUnknownMeat, 3, 1);
    const l9 = new Location(LocationUnknownMeat, 3, -1);
    await wait(250);
    const l2 = new Location(LocationUnknownMeat, 4, 1);
    const lA = new Location(LocationUnknownMeat, 4, -1);
    await wait(250);
    const l3 = new Location(LocationUnknownMeat, 5, 1);
    const l6 = new Location(LocationUnknownMeat, 4, 0);
    const lB = new Location(LocationUnknownMeat, 5, -1);
    await wait(250);
    const l4 = new Location(LocationUnknownMeat, 6, 1);
    const lC = new Location(LocationUnknownMeat, 6, -1);
    await wait(250);
    const l7 = new Location(LocationUnknownMeat, 6, 0);
    // Connect neighbours
    l_.addNeighbour(l5);
    l5.addNeighbour(l0);
    l5.addNeighbour(l8);
    l0.addNeighbour(l1);
    l1.addNeighbour(l2);
    l2.addNeighbour(l3);
    l3.addNeighbour(l4);
    l6.addNeighbour(l2);
    l6.addNeighbour(lA);
    l7.addNeighbour(l4);
    l7.addNeighbour(lC);
    l8.addNeighbour(l9);
    l9.addNeighbour(lA);
    lA.addNeighbour(lB);
    lB.addNeighbour(lC);
    // Recalculate distances
    Location.recalculatePlayerDistance();
  },
});

///////////////////////////////////////////////////////////////////////////////
// EVENTS

CardUnsureGamble = new EventData("unsureGamble", {
  title: "Unsure Gamble",
  text: "Test 0{influence}. If successful, gain 4{c}.",
  flavour: `Lady luck took the form of rolling 3 autofails in a row, proceeding to get defeated in act 3 and just looking up the scoop on Sunday instead.`,
  subtypes: ["familiar", "gambit"],
  faction: FACTION_NEUTRAL,
  image: "img/card/event/offShoreFund.png",
  cost: 0,
  skills: ["influence", "mu", "strength", "link"],
  onPlay: async (card) => {
    const results = await Chaos.runModal({
      stat: "influence",
      target: 0,
      canCancel: false,
      title: "Unsure Gamble!",
      description: "If successful, you will gain 4 credits.",
      forceOutcome: "success", // Teehee
    });
    if (results.success) {
      await Stats.addCredits(4);
    }
  },
});
