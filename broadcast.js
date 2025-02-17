class BroadcastError extends Error {
  constructor(trigger, type) {
    super(`Trigger '${trigger}' was broadcast but does not exist in ${type}.`);
    this.name = "BroadcastError";
  }
}

///////////////////////////////////////////////////////////////////////////////

class Broadcast {
  static #disabled = true;

  static async signal(trigger, data) {
    if (this.#disabled) {
      return;
    }

    // Broadcast to the tutorial controller
    // Note: we don't wait for the tutorial to finish resolving because it has async timing with the game
    Tutorial.signal(trigger, data);

    // Broadcast to cards in hand that have active effects
    for (const source of Cards.grip) {
      if (source.cardData.activeInHand) {
        if (!source.cardData[trigger]) {
          throw new BroadcastError(trigger, "grip card");
        }
        await source.cardData[trigger](source, data);
      }
    }

    // Broadcast to all installed cards
    for (const source of Cards.installedCards) {
      if (!source.cardData[trigger]) {
        throw new BroadcastError(trigger, "installed card");
      }
      await source.cardData[trigger](source, data);
    }

    // Broadcast to all locations
    for (const source of Location.instances) {
      if (!source.cardData[trigger]) {
        throw new BroadcastError(trigger, "location");
      }
      await source.cardData[trigger](source, data);
    }

    // Broadcast to all enemies
    for (const source of Enemy.instances) {
      if (!source.cardData[trigger]) {
        throw new BroadcastError(trigger, "enemy");
      }
      await source.cardData[trigger](source, data);
    }

    // Broadcast to the agenda/act/identity
    // These are unique in that they do not provide a source as there is only ever one active
    await Act.cardData[trigger](data);
    await Agenda.cardData[trigger](data);
    await Identity.cardData[trigger](Identity, data);
  }

  static enable() {
    this.#disabled = false;
  }

  static disable() {
    this.#disabled = true;
  }
}
