let cardData_i = 0;

const TYPE_NONE = cardData_i++;
const TYPE_IDENTITY = cardData_i++;
const TYPE_ASSET = cardData_i++;
const TYPE_EVENT = cardData_i++;
const TYPE_ENEMY = cardData_i++;
const TYPE_ACT = cardData_i++;
const TYPE_AGENDA = cardData_i++;
const TYPE_LOCATION = cardData_i++;
const TYPE_TREACHERY = cardData_i++;

const FACTION_NONE = cardData_i++;
const FACTION_ANARCH = cardData_i++;
const FACTION_CRIMINAL = cardData_i++;
const FACTION_SHAPER = cardData_i++;
const FACTION_NEUTRAL = cardData_i++;
const FACTION_MEAT = cardData_i++; // Meatspace locations/enemies
const FACTION_NET = cardData_i++; // Netspace locations/enemies
const FACTION_ENCOUNTER = cardData_i++;

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
TYPE_TO_TEXT[TYPE_TREACHERY] = "Treachery";

const FACTION_TO_TEXT = {};
FACTION_TO_TEXT[FACTION_NONE] = "NONE";
FACTION_TO_TEXT[FACTION_ANARCH] = "Anarch";
FACTION_TO_TEXT[FACTION_CRIMINAL]  = "Criminal";
FACTION_TO_TEXT[FACTION_SHAPER]  = "Shaper";
FACTION_TO_TEXT[FACTION_NEUTRAL]  = "Neutral";
FACTION_TO_TEXT[FACTION_MEAT]  = "Corporeal";
FACTION_TO_TEXT[FACTION_NET]  = "Netspace"; 

///////////////////////////////////////////////////////////////////////////////

class CardDataDuplicateIdError extends Error {
  constructor(id) {
    super(
      `A card has already been registered with the ID '${id}'. CardData IDs must be unique.`
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

  static getAllCards() {
    return Object.values(this.#instances);
  }

  static log(trigger, data) {
    // console.log(trigger);
    // console.log(trigger, data);
  }

  id;
  title;
  text;
  subtypes;
  faction;
  image;
  hidden; // Special flag - set true if the card is just a placeholder and should not be treated as a real card (e.g. Agenda1)

  constructor(id, data) {
    if (CardData.#instances[id]) {
      throw new CardDataDuplicateIdError(id);
    }
    this.id = id;
    CardData.#instances[id] = this;
  }

  get formattedTitle() { return this.unique ? "♦ " + this.title : this.title; }
  get jText() {
    return `<div>${this.formattedText}</div>`;
  }
  get formattedText() {
    if (!this.text) {
      return "";
    }
    return this.text
      .replaceAll("{c}", "{credit}")
      .replaceAll("\n", "<br>")
      .replaceAll(/\{.*?\}/g, function (match) {
        const flag = match.slice(1, -1);
        return `<img src="img/game/${flag}.png" class="inline-icon" title="${flag}" />`;
      });
  }
  get displaySubtypes() {
    return this.subtypes
      .join(" - ")
      .replace(/\w\S*/g,
        (match) => match.charAt(0).toUpperCase() + match.substring(1).toLowerCase());
  }
}

// Treacheries should not inherit these
class NonTreacheryData extends CardData {
  async onTurnStart(source, data) {CardData.log("onTurnStart", data)}
  async onTurnEnd(source, data) {CardData.log("onTurnEnd", data)}
  
  async onGainCredits(source, data) {CardData.log("onGainCredits", data)}
  async onLoseCredits(source, data) {CardData.log("onLoseCredits", data)}
  async onGainClicks(source, data) {CardData.log("onGainClicks", data)}
  async onLoseClicks(source, data) {CardData.log("onLoseClicks", data)}

  async onCardsDrawn(source, data) {CardData.log("onCardsDrawn", data)}
  async onCardPlayed(source, data) {CardData.log("onCardPlayed", data)}
  async onCardInstalled(source, data) {CardData.log("onCardInstalled", data)}
  async onCardDiscarded(source, data) {CardData.log("onCardDiscarded", data)} // Trashing from hand is the same as discarding
  async onAssetTrashed(source, data) {CardData.log("onAssetTrashed", data)} // Trashing means specifically while installed

  async onTestAttempted(source, data) {CardData.log("onTestAttempted")}
  async onTestCompleted(source, data) {CardData.log("onTestCompleted")}

  async onActAdvanced(source, data) {CardData.log("onActAdvanced", data)}
  async onAgendaAdvanced(source, data) {CardData.log("onAgendaAdvanced", data)}
  async onDoomPlaced(source, data) {CardData.log("onDoomPlaced", data)}
  
  async onPlayerMoves(source, data) {CardData.log("onPlayerMoves", data)}
  async onPlayerEngages(source, data) {CardData.log("onPlayerEngages", data)}
  async onPlayerAttackAttempt(source, data) {CardData.log("onPlayerAttackAttempt", data)}
  async onPlayerAttacks(source, data) {CardData.log("onPlayerAttacks", data)}
  async onPlayerKills(source, data) {CardData.log("onPlayerKills", data)}
  async onPlayerEvadeAttempt(source, data) {CardData.log("onPlayerEvadeAttempt", data)}
  async onPlayerEvades(source, data) {CardData.log("onPlayerEvades", data)}
  
  async onEnemySpawns(source, data) {CardData.log("onEnemySpawns", data)}
  async onEnemyMoves(source, data) {CardData.log("onEnemyMoves", data)}
  async onEnemyAttacks(source, data) {CardData.log("onEnemyAttacks", data)}
  async onEnemyDies(source, data) {CardData.log("onEnemyDies", data)}

  async onInvestigationAttempt(source, data) {CardData.log("onInvestigationAttempt", data)}
  async onInvestigation(source, data) {CardData.log("onInvestigation", data)}
}

class IdentityData extends NonTreacheryData {
  influence;
  mu;
  strength;
  link;
  health;

  get type() { return TYPE_IDENTITY; }

  constructor(id, data) {
    super(id, data);
    if (data) {
      for (const key of Object.keys(data)) {
        this[key] = data[key];
      }
    }
    Object.freeze(this);
  }

  // Determines if the identity can be used
  canUse(source, data) { return this.onUse != null; }
  // onUse(source, data) {} // Leave this unset for canUse

  // TODO - complete
  populate(jObj) {
    const jCardText = $(`
      <div class="card-text identity">
      </div>
    `)
    jObj.append(jCardText);
  }
}

class PlayableCardData extends NonTreacheryData {
  cost;
  activeInHand;
  preventAttacks;
  skills; // list of skills the card can be committed for

  // Adds any non-printed play/install costs
  calculateCost(source, data) { return this.cost; }
  // Lists any non-cost requirements to play/install
  canPlay(source, data) { return true; }

  async onPlay(source, data) {CardData.log("onPlay", data)}
  async onDiscard(source, data) {CardData.log("onDiscard", data)}
}

class AssetData extends PlayableCardData {
  health;
  unique;

  get type() { return TYPE_ASSET; }

  constructor(id, data) {
    super(id, data);
    if (data) {
      for (const key of Object.keys(data)) {
        this[key] = data[key];
      }
    }
    Object.freeze(this);
  }

  // Determines if the asset can be used while installed
  canUse(source, data) { return this.onUse != null; }
  // onUse(source, data) {} // Leave this unset for canUse

  populate(jObj) {
    const skills = this.skills
      ? this.skills
          .map(
            (skill) => `<img class="card-text-skill" src="img/skill/${skill}.png" />`
          )
          .join("")
      : "";
    const jCardText = $(`
      <div class="card-text asset">
        <div class="card-text-cost">${this.cost}</div>
        <div class="card-text-title">${this.formattedTitle}</div>
        <div class="card-text-subtypes">${this.displaySubtypes}</div>
        <div class="card-text-text"></div>
        ${this.health ? `<div class="card-text-health">${this.health}</div>` : ""}
        <div class="card-text-skills">${skills}</div>
      </div>
    `);
    jCardText.find(".card-text-text").append(this.jText);
    jObj.append(jCardText);
  }
}

class EventData extends PlayableCardData {
  get type() { return TYPE_EVENT; }

  constructor(id, data) {
    super(id, data);
    if (data) {
      for (const key of Object.keys(data)) {
        this[key] = data[key];
      }
    }
    Object.freeze(this);
  }

  populate(jObj) {
    const skills = this.skills
      ? this.skills
          .map(
            (skill) => `<img class="card-text-skill" src="img/skill/${skill}.png" />`
          )
          .join("")
      : "";
    const jCardText = $(`
      <div class="card-text event">
        <div class="card-text-cost">${this.cost}</div>
        <div class="card-text-title">${this.formattedTitle}</div>
        <div class="card-text-subtypes">${this.displaySubtypes}</div>
        <div class="card-text-text"></div>
        <div class="card-text-skills">${skills}</div>
      </div>
    `);
    jCardText.find(".card-text-text").append(this.jText);
    jObj.append(jCardText);
  }
}

class EnemyData extends NonTreacheryData {
  health;
  strength;
  link;
  isHunter;

  get type() { return TYPE_ENEMY; }

  constructor(id, data) {
    super(id, data);
    if (data) {
      for (const key of Object.keys(data)) {
        this[key] = data[key];
      }
    }
    Object.freeze(this);
  }

  async attack(source, data) {CardData.log("attack", data)}

  populate(jObj) {
    const jCardText = $(`
      <div class="card-text enemy ${this.faction == FACTION_NET ? "alt" : ""}">
        <div class="card-text-title">${this.formattedTitle}</div>
        <div class="card-text-strength">${this.strength}</div>
        <div class="card-text-health">${this.health}</div>
        <div class="card-text-link">${this.link}</div>
        <div class="card-text-box">
          ${this.subtypes ? `<div class="card-text-subtypes">${this.displaySubtypes}</div>` : ""}
          <div class="card-text-text"></div>
        </div>
      </div>
    `);
    jCardText.find(".card-text-text").append(this.jText);
    jObj.append(jCardText);
  }
}

class ActData extends NonTreacheryData {
  requirement; // String describing the required action to advance the act

  get type() { return TYPE_ACT; }

  constructor(id, data) {
    super(id, data);
    if (data) {
      for (const key of Object.keys(data)) {
        this[key] = data[key];
      }
    }
    Object.freeze(this);
  }

  async advance(source, data) {CardData.log("advanceAct", data)}

  populate(jObj) {
    const jCardText = $(`
      <div class="card-text act">
        <div class="card-text-title">${this.formattedTitle}</div>
        <div class="card-text-requirement">${this.requirement ? this.requirement : "-"}</div>
        <div class="card-text-act">${this.act}</div>
        <div class="card-text-text-box">
          <div class="card-text-float"></div>
          <div class="card-text-text"></div>
        </div>
      </div>
    `);
    jCardText.find(".card-text-text").append(this.jText);
    jObj.append(jCardText);
  }
}

class AgendaData extends NonTreacheryData {
  requirement; // Number of doom required to advance the agenda

  get type() { return TYPE_AGENDA; }

  constructor(id, data) {
    super(id, data);
    if (data) {
      for (const key of Object.keys(data)) {
        this[key] = data[key];
      }
    }
    Object.freeze(this);
  }

  async advance(source, data) {CardData.log("advanceAgenda", data)}

  populate(jObj) {
    const jCardText = $(`
      <div class="card-text agenda">
        <div class="card-text-title">${this.formattedTitle}</div>
        <div class="card-text-requirement">${this.requirement ? this.requirement : "-"}</div>
        <div class="card-text-agenda">${this.agenda}</div>
        <div class="card-text-text-box">
          <div class="card-text-float"></div>
          <div class="card-text-text"></div>
        </div>
      </div>
    `);
    jCardText.find(".card-text-text").append(this.jText);
    jObj.append(jCardText);
  }
}

class LocationData extends NonTreacheryData {
  shroud;
  clues;
  enterSfx; // There are defaults for meatspace/netspace if this is not set

  get type() { return TYPE_LOCATION; }

  constructor(id, data) {
    super(id, data);
    if (data) {
      for (const key of Object.keys(data)) {
        this[key] = data[key];
      }
    }
    Object.freeze(this);
  }

  populate(jObj) {
    const jCardText = $(`
      <div class="card-text location ${this.faction == FACTION_NET ? "alt" : ""}">
        <div class="card-text-title">${this.formattedTitle}</div>
        <div class="card-text-shroud">${this.shroud}</div>
        <div class="card-text-clues">${this.clues}</div>
        <div class="card-text-subtypes">${this.displaySubtypes}</div>
        <div class="card-text-text"></div>
      </div>
    `);
    jCardText.find(".card-text-text").append(this.jText);
    jObj.append(jCardText);
  }
}

class TreacheryData extends CardData {
  get type() { return TYPE_TREACHERY; }

  constructor(id, data) {
    super(id, data);
    if (data) {
      for (const key of Object.keys(data)) {
        this[key] = data[key];
      }
    }
    this.faction = FACTION_ENCOUNTER;
    Object.freeze(this);
  }

  canEncounter() { return true; }
  async onEncounter() { }

  populate(jObj) {
    const jCardText = $(`
      <div class="card-text treachery">
        <div class="card-text-title">${this.formattedTitle}</div>
        <div class="card-text-subtypes">${this.displaySubtypes}</div>
        <div class="card-text-text"></div>
      </div>
    `);
    jCardText.find(".card-text-text").append(this.jText);
    jObj.append(jCardText);
  }
}
