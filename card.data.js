let cardData_i = 0;

const TYPE_NONE = cardData_i++;
const TYPE_IDENTITY = cardData_i++;
const TYPE_ASSET = cardData_i++;
const TYPE_EVENT = cardData_i++;
const TYPE_ENEMY = cardData_i++;
const TYPE_ACT = cardData_i++;
const TYPE_AGENDA = cardData_i++;
const TYPE_LOCATION = cardData_i++;

const FACTION_NONE = cardData_i++;
const FACTION_ANARCH = cardData_i++;
const FACTION_CRIMINAL = cardData_i++;
const FACTION_SHAPER = cardData_i++;
const FACTION_NEUTRAL = cardData_i++;
const FACTION_MEAT = cardData_i++; // Meatspace locations/enemies
const FACTION_ICE = cardData_i++; // Netspace locations/enemies

///////////////////////////////////////////////////////////////////////////////

const TYPE_TO_TEXT = {};
TYPE_TO_TEXT[TYPE_NONE] = "NONE";
TYPE_TO_TEXT[TYPE_IDENTITY] = "Identity";
TYPE_TO_TEXT[TYPE_ASSET] = "Asset";
TYPE_TO_TEXT[TYPE_EVENT] = "Event";
TYPE_TO_TEXT[TYPE_ENEMY] = "Enemy";
TYPE_TO_TEXT[TYPE_ACT] = "Act";
TYPE_TO_TEXT[TYPE_AGENDA] = "Agenda";
TYPE_TO_TEXT[TYPE_LOCATION] = "Location";

const FACTION_TO_TEXT = {};
FACTION_TO_TEXT[FACTION_NONE] = "NONE";
FACTION_TO_TEXT[FACTION_ANARCH] = "Anarch";
FACTION_TO_TEXT[FACTION_CRIMINAL]  = "Criminal";
FACTION_TO_TEXT[FACTION_SHAPER]  = "Shaper";
FACTION_TO_TEXT[FACTION_NEUTRAL]  = "Neutral";
FACTION_TO_TEXT[FACTION_MEAT]  = "Corporeal";
FACTION_TO_TEXT[FACTION_ICE]  = "Netspace"; 

///////////////////////////////////////////////////////////////////////////////

class CardDataWriteError extends Error {
  static throwIfSet(obj, property) {
    if (obj[property]) {
      throw new CardDataWriteError(property);
    }
  }

  constructor(property) {
    super(
      `CardData property '${property}' was set, but already has a value. CardData properties may not be assigned twice.`
    );
    this.name = "CardDataWriteError";
  }
}

///////////////////////////////////////////////////////////////////////////////

// type is not defined here at it should be defined in subclasses
class CardData {
  static #instances = {};

  static getCard(id) {
    return this.#instances[id];
  }

  static log(trigger, data) {
    // console.log(trigger);
    // console.log(trigger, data);
  }

  #id;
  #title;
  #text;
  #subtypes;
  #faction;
  #image;

  constructor(id) {
    this.#id = id;
    CardData.#instances[id] = this;
  }

  get id() { return this.#id; }

  get title() { return this.#title; }
  set title(value) {
    CardDataWriteError.throwIfSet(this, "title");
    this.#title = value;
  }
  get text() { return this.#text; }
  set text(value) {
    CardDataWriteError.throwIfSet(this, "text");
    this.#text = value;
  }
  get subtypes() { return this.#subtypes; }
  set subtypes(value) {
    CardDataWriteError.throwIfSet(this, "subtypes");
    this.#subtypes = value;
  }
  get faction() { return this.#faction; }
  set faction(value) {
    CardDataWriteError.throwIfSet(this, "faction");
    this.#faction = value;
  }
  get image() { return this.#image; }
  set image(value) {
    CardDataWriteError.throwIfSet(this, "image");
    this.#image = value;
  }

  async onGainCredits(source, data) {CardData.log("onGainCredits", data)}
  async onLoseCredits(source, data) {CardData.log("onLoseCredits", data)}
  async onGainClicks(source, data) {CardData.log("onGainClicks", data)}
  async onLoseClicks(source, data) {CardData.log("onLoseClicks", data)}
  async onCardPlayed(source, data) {CardData.log("onCardPlayed", data)}
  async onCardInstalled(source, data) {CardData.log("onCardInstalled", data)}
  async onCardDiscarded(source, data) {CardData.log("onCardDiscarded", data)} // Trashing from hand is the same as discarding
  async onAssetTrashed(source, data) {CardData.log("onAssetTrashed", data)} // Trashing means specifically while installed
  async onPlayerMoved(source, data) {CardData.log("onPlayerMoved", data)}
  async onEnemyMoved(source, data) {CardData.log("onEnemyMoved", data)}
  async onActAdvanced(source, data) {CardData.log("onActAdvanced", data)}
  async onAgendaAdvanced(source, data) {CardData.log("onAgendaAdvanced", data)}
  async onAgendaDoomPlaced(source, data) {CardData.log("onAgendaDoomPlaced", data)}
  async onPlayerAttackAttempt(source, data) {CardData.log("onPlayerAttackAttempt", data)}
  async onPlayerAttacks(source, data) {CardData.log("onPlayerAttacks", data)}
  async onPlayerKills(source, data) {CardData.log("onPlayerKills", data)}
  async onPlayerEvadeAttempt(source, data) {CardData.log("onPlayerEvadeAttempt", data)}
  async onPlayerEvades(source, data) {CardData.log("onPlayerEvades", data)}
  async onPlayerAttacked(source, data) {CardData.log("onPlayerAttacked", data)}
  async onInvestigationAttempt(source, data) {CardData.log("onInvestigationAttempt", data)}
  async onInvestigation(source, data) {CardData.log("onInvestigation", data)}
}

class IdentityData extends CardData {
  #influence;
  #mu;
  #strength;
  #link;

  get type() { return TYPE_IDENTITY; }

  get influence() { return this.#influence; }
  set influence(value) {
    CardDataWriteError.throwIfSet(this, "influence");
    this.#influence = value;
  }
  get mu() { return this.#mu; }
  set mu(value) {
    CardDataWriteError.throwIfSet(this, "mu");
    this.#mu = value;
  }
  get strength() { return this.#strength; }
  set strength(value) {
    CardDataWriteError.throwIfSet(this, "strength");
    this.#strength = value;
  }
  get link() { return this.#link; }
  set link(value) {
    CardDataWriteError.throwIfSet(this, "link");
    this.#link = value;
  }
}

class PlayableCardData extends CardData {
  #cost;

  get cost() { return this.#cost; }
  set cost(value) {
    CardDataWriteError.throwIfSet(this, "cost");
    this.#cost = value;
  }

  // Adds any non-printed play costs
  calculateCost(source, data) { return this.cost; }
  // Lists any non-cost requirements to play
  canPlay(source, data) { return true; }

  async onPlay(source, data) {CardData.log("onPlay", data)}
  async onDiscard(source, data) {CardData.log("onDiscard", data)}
}

class AssetData extends PlayableCardData {
  #health;

  get type() { return TYPE_ASSET; }

  get health() { return this.#health; }
  set health(value) {
    CardDataWriteError.throwIfSet(this, "health");
    this.#health = value;
  }

  async onTrash(source, data) {CardData.log("onTrash", data)}
}

class EventData extends PlayableCardData {
  get type() { return TYPE_EVENT; }
}

class EnemyData extends CardData {
  #health;
  #strength;
  #link;

  get type() { return TYPE_ENEMY; }

  get health() { return this.#health; }
  set health(value) {
    CardDataWriteError.throwIfSet(this, "health");
    this.#health = value;
  }
  get strength() { return this.#strength; }
  set strength(value) {
    CardDataWriteError.throwIfSet(this, "strength");
    this.#strength = value;
  }
  get link() { return this.#link; }
  set link(value) {
    CardDataWriteError.throwIfSet(this, "link");
    this.#link = value;
  }

  async attack(source, data) {CardData.log("attack", data)}

  async onThisAttackAttempt(source, data) {CardData.log("onThisAttackAttempt", data)}
  async onThisAttacked(source, data) {CardData.log("onThisAttacked", data)}
  async onThisEvadeAttempt(source, data) {CardData.log("onThisEvadeAttempt", data)}
  async onThisEvaded(source, data) {CardData.log("onThisEvaded", data)}
}

class ActData extends CardData {
  get type() { return TYPE_ACT; }
}

class AgendaData extends CardData {
  #requirement;

  get type() { return TYPE_AGENDA; }

  get requirement() { return this.#requirement; }
  set requirement(value) {
    CardDataWriteError.throwIfSet(this, "requirement");
    this.#requirement = value;
  }
}

class LocationData extends CardData {
  #shroud;
  #clues;

  get type() { return TYPE_LOCATION; }

  get shroud() { return this.#shroud; }
  set shroud(value) {
    CardDataWriteError.throwIfSet(this, "shroud");
    this.#shroud = value;
  }
  get clues() { return this.#clues; }
  set clues(value) {
    CardDataWriteError.throwIfSet(this, "clues");
    this.#clues = value;
  }

  async onThisInvestigationAttempt(source, data) {CardData.log("onThisInvestigationAttempt", data)}
  async onThisInvestigated(source, data) {CardData.log("onThisInvestigated", data)}
}
