class BroadcastError extends Error {
  constructor(trigger, type) {
    super(`Trigger '${trigger}' was broadcast but does not exist in ${type}.`);
    this.name = "BroadcastError";
  }
}

///////////////////////////////////////////////////////////////////////////////

class Broadcast {
  static async signal(trigger, data) {
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

    // Broadcast to the agenda/act
    // These are unique in that they do not provide a source
    // await Act.cardData[trigger](data);
    // await Agenda.cardData[trigger](data);
  }
}
