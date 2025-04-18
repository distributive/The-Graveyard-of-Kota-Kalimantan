///////////////////////////////////////////////////////////////////////////////
// Meat

const TreacheryWhatWasThat = new TreacheryData("what_was_that", {
  title: "What Was That?",
  text: "Test 3{influence}. If unsuccessful, discard a random card.",
  subtypes: ["peril"],
  image: "img/card/treachery/whatWasThat.jpg",
  canEncounter() {
    return !!Cards.grip.length;
  },
  async onEncounter() {
    const validTargets = Enemy.instances.filter(
      (enemy) => !enemy.engaged && !enemy.cardData.subtypes.includes("elite")
    );
    const results = await Chaos.runModal({
      stat: "influence",
      target: 3,
      canCancel: false,
      title: "What was that?",
      description: `If this test is unsuccessful, discard a random card from your hand.`,
    });
    Modal.hide();
    if (results.success || Cards.grip.length == 0) {
      return;
    }
    await Cards.discardRandom(1);
  },
});

const TreacheryClumsy = new TreacheryData("clumsy", {
  title: "Clumsy",
  text: "Test 3 {link}. If unsuccessful, move 2 of your data to your current location.",
  subtypes: ["hazard"],
  image: "img/card/treachery/clumsy.jpg",
  canEncounter() {
    return Stats.clues > 0;
  },
  async onEncounter() {
    const results = await Chaos.runModal({
      stat: "link",
      target: 3,
      canCancel: false,
      title: "Clumsy",
      description: `If this test is unsuccessful, move 2 of your data to your current location.`,
    });
    Modal.hide();
    if (results.success || Stats.clues == 0) {
      return;
    }
    const cluesRemoved = Math.min(2, Stats.clues);
    await Stats.addClues(-cluesRemoved);
    Location.getCurrentLocation().addClues(cluesRemoved);
  },
});

const TreacheryFallingDebris = new TreacheryData("falling_debris", {
  title: "Falling Debris",
  text: "Test 3{strength}. If unsuccessful, suffer 2 damage.",
  subtypes: ["hazard"],
  image: "img/card/treachery/fallingDebris.jpg",
  async onEncounter() {
    const results = await Chaos.runModal({
      stat: "strength",
      target: 3,
      canCancel: false,
      title: "Falling debris",
      description: `If this test is unsuccessful, suffer 2 damage.`,
    });
    Modal.hide();
    if (results.success) {
      return;
    }
    await Game.sufferDamage(2, "Falling Debris");
  },
});

const TreacheryFaultyHardware = new TreacheryData("faulty_hardware", {
  title: "Faulty Hardware",
  text: "Test 3 {mu}. If unsuccessful, exhaust all installed cards (they cannot be used for the rest of the turn).",
  subtypes: ["hazard"],
  image: "img/card/treachery/faultyHardware.jpg",
  canEncounter() {
    return !!Cards.installedCards.length;
  },
  async onEncounter() {
    const results = await Chaos.runModal({
      stat: "mu",
      target: 3,
      canCancel: false,
      title: "Faulty hardware",
      description: `If this test is unsuccessful, exhaust all installed cards.`,
    });
    Modal.hide();
    if (results.success) {
      return;
    }
    for (const card of Cards.installedCards) {
      await card.setTapped(true);
    }
  },
});

///////////////////////////////////////////////////////////////////////////////
// Net

const TreacherySomethingInTheDark = new TreacheryData("something_in_the_dark", {
  title: "In the Dark",
  text: "Test 4{influence}. If unsuccessful, move an unengaged non-elite enemy to your location. It engages you. If you cannot, suffer 2 damage.",
  subtypes: ["terror"],
  image: "img/card/treachery/scales.jpg",
  async onEncounter() {
    const validTargets = Enemy.instances.filter(
      (enemy) => !enemy.engaged && !enemy.cardData.subtypes.includes("elite")
    );
    const results = await Chaos.runModal({
      stat: "influence",
      target: 4,
      canCancel: false,
      title: "Something in the Dark...",
      description: `If this test is unsuccessful, ${
        validTargets.length > 0
          ? "move an unengaged non-elite enemy to your location. It engages you."
          : "suffer 2 damage."
      }`,
    });
    Modal.hide();
    if (results.success) {
      return;
    }
    if (validTargets.length > 0) {
      await UiMode.setMode(UIMODE_SELECT_ENEMY, {
        validTargets: validTargets,
        canCancel: false,
        reason:
          "Pick 1 non-elite enemy to move to your current location and engage.",
      });
      await UiMode.data.selectedEnemy.setLocation(
        Location.getCurrentLocation(),
        true
      );
    } else {
      await Game.sufferDamage(2, "In the Dark");
    }
  },
});

const TreacheryRapidDecay = new EventData("rapid_decay", {
  title: "Rapid Decay",
  text: "When you encounter or discard this, shuffle 2 copies into your deck.",
  subtypes: ["blight"],
  faction: FACTION_NEUTRAL,
  image: "img/card/event/rapidDecay.jpg",
  cost: 5,
  uncollectable: true,
  async onEncounter() {
    Cards.addToStack([TreacheryRapidDecay, TreacheryRapidDecay], true);
  },
  async onPlay() {},
  async onCardDiscarded(source, data) {
    if (source == data.card) {
      Cards.addToStack([TreacheryRapidDecay, TreacheryRapidDecay], true);
    }
  },
});
