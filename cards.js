class Cards {
  static stack = []; // Array of PlayableCardData classes
  static grip = []; // Array of GripCard objects
  static heap = []; // Array of PlayableCardData classes
  static installedCards = []; // Array of RigCard objects

  static focusedCardId;

  ///////////////////////////////////////////////
  // General

  static focusCard(jCardImage) {
    const focusedCardId = jCardImage.parent().data("card-id");
    const cardData = CardData.getCard(focusedCardId);
    if (!cardData || cardData.hidden) {
      return;
    }
    this.focusedCardId = focusedCardId;
    $("#card-focused-image")
      .attr("src", jCardImage.find(".card-image").attr("src"))
      .removeClass("unfocused")
      .addClass("focused");
    Cards.populateData($("#card-focused-image").parent(), cardData, "1.73vh");
    // Surveyor is the only card with variable stats, so we're hardcoding support for that
    if (cardData == EnemySurveyor) {
      const enemyId = jCardImage.parent().data("enemy-id");
      const enemy = Enemy.getInstance(enemyId);
      const focusedImage = $("#card-focused-image");
      if (enemy && focusedImage) {
        focusedImage
          .parent()
          .find(".card-text-strength")
          .html(enemy.strength)
          .addClass("buffed");
        focusedImage
          .parent()
          .find(".card-text-link")
          .html(enemy.link)
          .addClass("buffed");
      }
    }
  }
  static unfocusCard() {
    $("#card-focused-image").removeClass("focused").addClass("unfocused");
  }
  static removeFocusCard() {
    $("#card-focused-image").removeClass("focused").removeClass("unfocused");
  }

  static flip(jCardContainer, newCardData, doAnimate = true, fast = false) {
    if (doAnimate) {
      jCardContainer.addClass("flipping");
      if (fast) {
        jCardContainer.addClass("fast");
      }
      setTimeout(
        () => {
          Cards.populateData(jCardContainer, newCardData);
          jCardContainer.removeClass("d-none"); // For cards that start hidden
        },
        fast ? 210 : 960
      );
      setTimeout(
        () => {
          if (newCardData && !newCardData.hidden) {
            jCardContainer.find(".card-image").attr("src", newCardData.image);
          } else {
            jCardContainer.find(".card-image").attr("src", "");
          }
          jCardContainer.removeClass("flipping");
        },
        doAnimate ? (fast ? 250 : 1000) : 0 // CSS currently takes 1s to flip a card halfway (0.25s if fast)
      );
      if (doAnimate && fast) {
        setTimeout(() => {
          jCardContainer.removeClass("fast");
        }, 500);
      }
    } else {
      Cards.populateData(jCardContainer, newCardData);
      jCardContainer.find(".card-image").attr("src", newCardData.image);
      jCardContainer
        .removeClass("flipping")
        .removeClass("fast")
        .removeClass("d-none"); // For cards that start hidden
      if (newCardData.hidden) {
        jCardContainer.find(".card-image").attr("src", "");
      }
    }
  }

  static populateData(jObj, cardData, fontSize) {
    let jText = jObj.find(".card-text");
    if (jText.length !== 0) {
      jObj.find(".card-text").empty().removeClass().addClass("card-text");
    } else {
      jObj.append($(`<div class="card-text"></div>`));
      jText = jObj.find(".card-text");
    }
    if (cardData.hidden) {
      return;
    }
    if (cardData) {
      cardData.populate(jText);
    }
    if (fontSize) {
      jObj.find(".card-text").css("font-size", fontSize);
    }
    if (cardData.largeText) {
      jObj.find(".card-text-text").addClass("short");
    } else if (cardData.smallText) {
      jObj.find(".card-text-text").addClass("long");
    }
  }

  ///////////////////////////////////////////////
  // Hand/deck/discard

  // cardData may be an array of classes
  static addToStack(cardData, shuffleInto = false, doAnimate = true) {
    if (typeof cardData == "object") {
      this.stack.push(...cardData);
    } else {
      this.stack.push(cardData);
    }
    if (shuffleInto) {
      shuffle(this.stack);
      if (doAnimate) {
        animate($("#stack-shuffle-cw"), 1000);
        animate($("#stack-shuffle-ccw"), 1000);
        Audio.playEffect(AUDIO_SHUFFLE);
      }
    }
    this.updateStackHeapHeights();
    this.determineCanDraw();
  }

  // cardData may be an array of classes
  static addToHeap(cardData, shuffleInto = false) {
    if (typeof cardData == "object" && cardData.length != null) {
      this.heap.push(...cardData);
    } else {
      this.heap.push(cardData);
    }
    if (shuffleInto) {
      shuffle(this.heap);
    }
    this.updateStackHeapHeights();
    this.determineCanDraw();
  }

  static canDraw() {
    return this.stack.length > 0 || this.heap.length > 0;
  }

  // Returns the number of cards that couldn't be drawn
  static async draw(n = 1) {
    let i = 0;
    for (; i < n && this.canDraw(); i++) {
      if (this.stack.length == 0) {
        this.shuffleHeap();
      }
      const cardData = this.stack.pop();
      this.addCardToGrip(cardData, i * 50);
    }
    this.updateStackHeapHeights();
    this.determineCanDraw();
    if (i > 0) {
      Broadcast.signal("onCardsDrawn", { number: i });
    }
    return n - i;
  }

  static addCardToGrip(cardData, delay) {
    const gripCard = new GripCard(cardData);
    this.grip.push(gripCard);
    if (delay) {
      setTimeout(() => {
        $("#grip").append(gripCard.jObj);
        this.updateHandPositions();
        Audio.playEffect(AUDIO_DRAW);
      }, delay);
    } else {
      $("#grip").append(gripCard.jObj);
      this.updateHandPositions();
      Audio.playEffect(AUDIO_DRAW);
    }
  }

  static async discard(card) {
    const gripCard = this.removeGripCard(card);
    if (gripCard) {
      this.addToHeap(gripCard.cardData);
      this.updateStackHeapHeights();
      this.determineCanDraw();
      // The card itself will not receive the broadcast, so we message it directly
      if (gripCard.cardData.onCardDiscarded) {
        await gripCard.cardData.onCardDiscarded(gripCard, { card: gripCard });
      }
      await Broadcast.signal("onCardDiscarded", { card: gripCard });
    }
  }

  static async discardRandom(number = 1) {
    for (let i = 0; i < number; i++) {
      await this.discard(randomIndex(Cards.grip));
    }
  }

  static shuffleHeap(doAnimate = true) {
    if (this.heap.length == 0) {
      return;
    }
    this.stack = shuffle(this.heap.map((x) => x));
    this.heap = [];
    this.updateStackHeapHeights();
    this.determineCanDraw();
    if (doAnimate) {
      animate($("#stack-shuffle-cw"), 1000);
      animate($("#stack-shuffle-ccw"), 1000);
      Audio.playEffect(AUDIO_SHUFFLE);
    }
  }

  static removeGripCard(card, installing = false) {
    const index = typeof card == "object" ? this.grip.indexOf(card) : card;
    if (index >= 0 && index < this.grip.length) {
      const card = this.grip[index];
      this.grip[index].remove(true, installing);
      this.grip.splice(index, 1);
      this.updateHandPositions();
      setTimeout(
        function () {
          Cards.updateHandPositions();
        },
        installing ? 210 : 10
      );
      return card;
    }
    return null;
  }

  static async trashInstalledCard(card) {
    await Broadcast.signal("onAssetTrashed", { card: card });
    const cardData = this.removeInstalledCard(card);
    this.addToHeap(cardData);
  }

  static async removeInstalledCardFromGame(card) {
    this.removeInstalledCard(card);
    Audio.playEffect(AUDIO_TRASH);
  }

  static removeInstalledCard(card, doAnimate = true) {
    const index =
      typeof card == "object" ? this.installedCards.indexOf(card) : card;
    if (index >= 0 && index < this.installedCards.length) {
      const cardData = this.installedCards[index].cardData;
      this.installedCards[index].remove(doAnimate);
      this.installedCards.splice(index, 1);
      return cardData;
    }
    return false;
  }

  static updateStackHeapHeights() {
    if (this.stack.length == 0) {
      $("#stack").addClass("empty");
    } else {
      $("#stack")
        .removeClass("empty")
        .css("--size", `${this.stack.length / 2}px`);
    }
    if (this.heap.length == 0) {
      $("#heap").addClass("empty");
    } else {
      $("#heap")
        .removeClass("empty")
        .css("--size", `${this.heap.length / 2}px`);
    }
  }

  static updateHandPositions() {
    // Unselected cards (default)
    $(".grip-card:not(.selected-card, .installing, .transition-out)")
      .css(
        "--hand-size",
        $("#grip .grip-card:not(.selected-card, .installing, .transition-out)")
          .length
      )
      .each((i, card) => {
        $(card).css("--index", i);
      });
    // Selected cards
    $(".grip-card.selected-card")
      .css("--hand-size", $("#grip .grip-card.selected-card").length)
      .each((i, card) => {
        $(card).css("--index", i);
      });
  }

  static determineCanDraw() {
    const canDraw = this.stack.length > 0 || this.heap.length > 0;
    UiMode.setFlag("can-draw", canDraw);
    return canDraw;
  }

  ///////////////////////////////////////////////
  // Rig

  static async install(cardData, data) {
    const rigCard = new RigCard(cardData, data);
    this.installedCards.push(rigCard);
    await cardData.onPlay(rigCard);
    await Broadcast.signal("onCardInstalled", { card: rigCard });
    Audio.playEffect(AUDIO_PLAY);
    return rigCard;
  }

  ///////////////////////////////////////////////
  // Serialisation

  static serialise() {
    const stack = this.stack.filter((card) => card).map((card) => card.id);
    const heap = this.heap.filter((card) => card).map((card) => card.id);
    const grip = this.grip
      .filter((card) => card)
      .map((card) => {
        return card.cardData.id;
      });
    const rig = this.installedCards.map((card) => {
      return {
        id: card.cardData.id,
        damage: card.damage,
        doom: card.doom,
        power: card.power,
        tapped: card.tapped,
      };
    });
    return {
      stack: stack,
      heap: heap,
      grip: grip,
      rig: rig,
    };
  }

  static async deserialise(json) {
    // Remove all existing card data
    this.deleteState();

    // Create new state from json
    this.stack = json.stack.map((id) => CardData.getCard(id));
    this.heap = json.heap.map((id) => CardData.getCard(id));
    json.grip.forEach((id) => {
      Cards.addCardToGrip(CardData.getCard(id));
    });
    json.rig.forEach((data) => {
      Cards.install(CardData.getCard(data.id), data); // Not async because it shouldn't matter
    });
  }

  static deleteState() {
    this.stack = [];
    this.heap = [];
    this.grip.forEach((card) => card.remove(false));
    this.grip = [];
    this.installedCards.forEach((card) => card.remove(false));
    this.installedCards = [];
  }
}

///////////////////////////////////////////////////////////////////////////////

class GripCard {
  // STATIC
  static selectedCards = new Set();
  static deselectAll() {
    Cards.grip.forEach((card) => card.deselect());
    GripCard.selectedCards.clear();
  }

  static markPlayableCards() {
    Cards.grip.forEach((gripCard) => {
      gripCard.playable =
        UiMode.mode != UIMODE_END_TURN &&
        UiMode.mode != UIMODE_CORP_TURN &&
        (Tutorial.mode == TUTORIAL_MODE_NONE ||
          (Tutorial.mode == TUTORIAL_MODE_PLAY_EVENT &&
            gripCard.cardData.type == TYPE_EVENT) ||
          (Tutorial.mode == TUTORIAL_MODE_INSTALL_ASSET &&
            gripCard.cardData.type == TYPE_ASSET)) &&
        Tutorial.mode != TUTORIAL_MODE_WAITING &&
        Stats.credits >= gripCard.cost &&
        gripCard.cardData.canPlay(gripCard).success &&
        !(
          gripCard.cardData.unique &&
          RigCard.isCardDataInstalled(gripCard.cardData)
        );
    });
  }
  static markAllCardsUnplayable() {
    Cards.grip.forEach((gripCard) => {
      gripCard.playable = false;
    });
  }
  static markAllCardsUnselectable() {
    Cards.grip.forEach((gripCard) => {
      gripCard.selectable = false;
    });
  }

  // INSTANCE
  #cardData;
  #jObj;
  #playable = false;

  constructor(cardData) {
    const instance = this;
    this.#cardData = cardData;
    this.#jObj = $(
      `<div class="grip-card ${
        cardData.type == TYPE_EVENT && cardData.preventAttacks
          ? "prevent-attacks"
          : ""
      }">
          <div class="card-image-container h-100">
            <img class="grip-card-image card-image h-100" src="${
              cardData.image
            }" />
          </div>
        </div>`
    );
    Cards.populateData(
      this.#jObj.find(".card-image-container"),
      cardData,
      "12.1px"
    );
    this.#jObj.data("card-id", cardData.id);
    const jObj = this.#jObj;
    this.#jObj.click(async function () {
      if (UiMode.uiMode == UIMODE_SELECT_ACTION) {
        jObj.addClass("in-play");
        const { success, reason } = await Game.actionPlayCard(instance);
        if (success) {
          Cards.removeGripCard(instance, instance.cardData.type == TYPE_ASSET);
          await Game.nextAction();
        } else {
          jObj.removeClass("in-play");
          animate(instance.#jObj, 300);
          Audio.playEffect(AUDIO_UNPLAYABLE);
          if (reason == "clicks") {
            Alert.send(
              "You do not have enough clicks to play this card.",
              ALERT_WARNING
            );
          } else if (reason == "type") {
            Alert.send("This card is not a playable type.", ALERT_WARNING);
          } else if (reason == "unique") {
            Alert.send(
              "You cannot install another copy of a unique card.",
              ALERT_WARNING
            );
          } else if (reason == "credits") {
            Alert.send(
              "You do not have enough credits to play this card.",
              ALERT_WARNING
            );
          } else if (reason == "unplayable") {
            Alert.send(
              "You do not meet the additional requirements to play this card.",
              ALERT_WARNING
            );
          } else if (reason) {
            Alert.send(reason, ALERT_WARNING);
          }
        }
      } else if (UiMode.uiMode == UIMODE_SELECT_GRIP_CARD) {
        if (instance.selectable) {
          if (GripCard.selectedCards.has(instance)) {
            instance.deselect();
          } else if (UiMode.data.maxCards == 1) {
            GripCard.deselectAll();
            instance.select();
          } else if (GripCard.selectedCards.size < UiMode.data.maxCards) {
            instance.select();
          } else {
            const message =
              UiMode.data.minCards != UiMode.data.maxCards
                ? `You must select between ${UiMode.data.minCards} and ${UiMode.data.maxCards} cards, inclusive.`
                : `You must select ${UiMode.data.maxCards} cards.`;
            Alert.send(message, ALERT_WARNING, true, false);
          }
        }
      }
    });
    this.#jObj.on("mouseenter", function () {
      Audio.playEffect(randomElement(AUDIO_FLICKS));
    });
  }

  get installed() {
    return false;
  }

  get jObj() {
    return this.#jObj;
  }
  get cardData() {
    return this.#cardData;
  }
  get cost() {
    return this.#cardData.calculateCost(this);
  }
  get printedCost() {
    return this.#cardData.cost;
  }

  get playable() {
    return this.#playable;
  }
  set playable(value) {
    this.#playable = value;
    if (value) {
      this.#jObj.addClass("playable");
    } else {
      this.#jObj.removeClass("playable");
    }
  }

  select() {
    GripCard.selectedCards.add(this);
    this.#jObj.addClass("selected-card");
    Cards.updateHandPositions();
  }

  // Only to be used if another card is not being selected
  deselect() {
    GripCard.selectedCards.delete(this);
    this.#jObj.removeClass("selected-card");
    Cards.updateHandPositions();
  }

  get selectable() {
    return this.#jObj.hasClass("selectable");
  }
  set selectable(value) {
    if (value) {
      this.#jObj.addClass("selectable");
    } else {
      this.#jObj.removeClass("selectable");
    }
  }

  get selected() {
    return this.#jObj.hasClass("selected-card");
  }

  get inPlay() {
    return this.#jObj.hasClass("in-play");
  }

  remove(doAnimate = true, installing = false) {
    let jObj = this.#jObj;
    if (doAnimate) {
      if (installing) {
        jObj.addClass("installing");
      } else {
        jObj.addClass("transition-out");
        jObj.find(".card-text").remove();
        jObj.find(".card-image").attr("src", "img/card/back/neutral.png");
        const distance = $("#heap").offset().left - jObj.offset().left;
        jObj.css("--discard-distance", `${distance}px`);
      }
      setTimeout(
        function () {
          jObj.remove();
        },
        installing ? 200 : 400
      );
    } else {
      jObj.remove();
    }
  }
}

///////////////////////////////////////////////////////////////////////////////

class RigCard {
  // STATIC
  static selectedCards = new Set();

  static deselectAll() {
    Cards.installedCards.forEach((card) => card.deselect());
    this.selectedCards.clear();
  }

  static #totalPerceivedDamage = 0;

  static get totalPerceivedDamage() {
    return this.#totalPerceivedDamage;
  }

  static resetAllPerceivedDamage() {
    Cards.installedCards.forEach((card) =>
      card.setPerceivedDamage(card.damage)
    );
    this.#totalPerceivedDamage = 0;
  }
  static async applyAllPerceivedDamage() {
    const destroyedCardIds = [];
    for (let i = 0; i < Cards.installedCards.length; i++) {
      const card = Cards.installedCards[i];
      await card.setDamage(card.#perceivedDamage);
      if (card.damage == card.health) {
        destroyedCardIds.push(card.id);
      }
    }
    this.#totalPerceivedDamage = 0;
    return destroyedCardIds;
  }

  static markUsableCards() {
    Cards.installedCards.forEach((card) => {
      card.selectable =
        card.cardData.canUse &&
        card.cardData.canUse(card).success &&
        !card.tapped &&
        (Tutorial.mode == TUTORIAL_MODE_NONE ||
          Tutorial.mode == TUTORIAL_MODE_USE_ASSET);
    });
  }
  static markAllCardsUnusable() {
    Cards.installedCards.forEach((card) => {
      card.selectable = false;
    });
  }

  static highlightDamageableCards() {
    Cards.installedCards.forEach((card) => {
      card.selectable = card.health > 0;
    });
  }
  static highlightCards(targets) {
    if (targets) {
      targets.forEach((card) => {
        card.selectable = true;
      });
    } else {
      Cards.installedCards.forEach((card) => {
        card.selectable = true;
      });
    }
  }
  static unhighlightAllCards() {
    Cards.installedCards.forEach((card) => {
      card.selectable = false;
    });
  }

  static getDamageableCards() {
    return Cards.installedCards.filter((card) => card.health > 0);
  }

  static isCardDataInstalled(cardData) {
    return (
      Cards.installedCards.filter((card) => card.cardData.id == cardData.id)
        .length > 0
    );
  }

  static async readyAll() {
    for (const card of Cards.installedCards) {
      await card.setTapped(false);
    }
  }

  // INSTANCE
  #cardData;

  #jObj;
  #jDamage;
  #jDoom;
  #jPower;

  #damage;
  #perceivedDamage = 0; // For showing potential damage while assigning damage
  #doom;
  #power;

  constructor(cardData, data) {
    const instance = this;
    this.#cardData = cardData;

    // card-padding is to make sure the parent class has the correct width
    this.#jObj = $(`
      <div class="installed-card ${
        cardData.preventAttacks ? "prevent-attacks" : ""
      }">
        <div class="card-image-container h-100">
          <img class="card-padding h-100" src="img/card/placeholder.png" />
          <img class="installed-card-image card-image h-100" src="${
            this.#cardData.image
          }" />
        </div>
        <div class="installed-card-outro-container h-100">
          <img class="installed-card-outro h-100" src="img/card/trashedCardOutro.png" />
        </div>
        <div class="hosted-counters">
          <div class="power shake-counter"></div>
          <div class="damage shake-counter"></div>
          <div class="doom shake-counter"></div>
        </div>
      </div>`);
    Cards.populateData(
      this.#jObj.find(".card-image-container"),
      this.#cardData,
      "0.95vh"
    );
    this.#jObj.data("card-id", this.#cardData.id);
    $("#rig").append(this.#jObj);

    this.#jObj.click(async () => {
      if (UiMode.uiMode == UIMODE_SELECT_ACTION) {
        const canUse = instance.cardData.canUse(instance);
        if (canUse.success) {
          await Game.actionUseCard(instance);
        } else if (canUse.reason) {
          Alert.send(canUse.reason, ALERT_WARNING);
        }
      } else if (UiMode.uiMode == UIMODE_SELECT_INSTALLED_CARD) {
        if (this.selectable) {
          if (RigCard.selectedCards.has(instance)) {
            instance.deselect();
            Audio.playEffect(AUDIO_FLICK_0);
          } else if (UiMode.data.maxCards == 1) {
            RigCard.deselectAll();
            instance.select();
            Audio.playEffect(AUDIO_FLICK_2);
          } else if (RigCard.selectedCards.size < UiMode.data.maxCards) {
            instance.select();
            Audio.playEffect(AUDIO_FLICK_2);
          } else {
            const message =
              UiMode.data.minCards != UiMode.data.maxCards
                ? `You must select between ${UiMode.data.minCards} and ${UiMode.data.maxCards} cards, inclusive.`
                : `You must select ${UiMode.data.maxCards} cards.`;
            Alert.send(message, ALERT_WARNING);
          }
        }
      } else if (UiMode.uiMode == UIMODE_ASSIGN_DAMAGE) {
        if (
          RigCard.#totalPerceivedDamage < UiMode.data.damage &&
          this.#perceivedDamage < this.health
        ) {
          this.setPerceivedDamage(this.#perceivedDamage + 1);
          RigCard.#totalPerceivedDamage++;
        }
      }
    });

    this.#jDamage = this.#jObj.find(".damage");
    this.#jDoom = this.#jObj.find(".doom");
    this.#jPower = this.#jObj.find(".power");
    this.setDamage(data && Number.isInteger(data.damage) ? data.damage : 0);
    this.setDoom(data && Number.isInteger(data.doom) ? data.doom : 0); // Theoretically causes async problems, but this should never advance the agenda
    this.setPower(data && Number.isInteger(data.power) ? data.power : 0);

    if (data && data.tapped) {
      this.setTapped(true); // Ditto - should be fine
    }
  }

  get installed() {
    return true;
  }

  get cardData() {
    return this.#cardData;
  }
  get cost() {
    return this.#cardData.calculateCost(this);
  }
  get printedCost() {
    return this.#cardData.cost;
  }
  get health() {
    return this.cardData.health;
  }

  get selectable() {
    return this.#jObj.hasClass("selectable");
  }
  set selectable(value) {
    if (value) {
      this.#jObj.addClass("selectable");
    } else {
      this.#jObj.removeClass("selectable");
    }
  }

  get tapped() {
    return this.#jObj.hasClass("tapped");
  }
  async setTapped(value) {
    if (value == this.tapped) {
      return;
    }
    if (value) {
      this.#jObj.addClass("tapped");
      if (this.#cardData.onTapped) {
        await this.#cardData.onTapped();
      }
    } else {
      this.#jObj.removeClass("tapped");
      if (this.#cardData.onUntapped) {
        await this.#cardData.onUntapped();
      }
    }
  }

  get damage() {
    return this.#damage;
  }
  get doom() {
    return this.#doom;
  }
  get power() {
    return this.#power;
  }

  setDamage(value, doAnimate = true) {
    if (!this.health) {
      this.setPerceivedDamage(0);
      return; // Assets with no health cannot be damaged
    }
    if (value < 0) {
      value = 0;
    }
    if (value < this.health) {
      this.setPerceivedDamage(value, doAnimate);
      this.#damage = value;
    } else {
      Cards.trashInstalledCard(this);
    }
    return this;
  }
  addDamage(value, doAnimate = true) {
    this.setDamage(this.#damage + value, doAnimate);
  }
  setPerceivedDamage(value, doAnimate = false) {
    const jDamage = this.#jDamage;
    if (value == 0) {
      this.#jDamage.hide();
    } else {
      this.#jDamage.show();
    }
    if (!this.health) {
      return; // Assets with no health cannot be damaged
    }
    jDamage.html(value);
    if (value != this.#damage && doAnimate) {
      animate(jDamage, 500);
    }
    this.#perceivedDamage = value;
    if (this.#perceivedDamage >= this.health) {
      this.#jObj.addClass("perceived-trashed").removeClass("selectable");
    } else {
      this.#jObj.removeClass("perceived-trashed");
    }
    return this;
  }

  async setDoom(value, doAnimate = true) {
    if (value < 0) {
      value = 0;
    }
    const jDoom = this.#jDoom;
    if (value == 0) {
      this.#jDoom.hide();
    } else {
      this.#jDoom.show();
    }
    jDoom.html(value);
    if (value != this.#doom && doAnimate) {
      animate(jDoom, 500);
    }
    if (this.#doom < value) {
      await Broadcast.signal("onDoomPlaced", {
        doom: value,
        card: this,
        cardData: this.cardData,
      });
    }
    this.#doom = value;
    return this;
  }
  async addDoom(value, doAnimate = true) {
    await this.setDoom(this.#doom + value, doAnimate);
  }

  setPower(value, doAnimate = true) {
    if (value < 0) {
      value = 0;
    }
    const jPower = this.#jPower;
    if (value == 0) {
      this.#jPower.hide();
    } else {
      this.#jPower.show();
    }
    jPower.html(value);
    if (value != this.#power && doAnimate) {
      animate(jPower, 500);
    }
    this.#power = value;
    return this;
  }
  addPower(value, doAnimate = true) {
    this.setPower(this.#power + value, doAnimate);
  }

  select() {
    RigCard.selectedCards.add(this);
    this.#jObj.addClass("selected-card");
  }

  deselect() {
    RigCard.selectedCards.delete(this); // This isn't working for some reason
    this.#jObj.removeClass("selected-card");
  }

  remove(doAnimate = true) {
    if (doAnimate) {
      let jObj = this.#jObj;
      jObj
        .addClass("transition-out")
        .removeClass("perceived-trashed")
        .removeClass("selectable")
        .removeClass("selected-card");
      setTimeout(function () {
        jObj.remove();
      }, 200);
    } else {
      this.#jObj.remove();
    }
  }
}

///////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  Cards.updateStackHeapHeights();

  const displayCardModal = async function (cardId) {
    const cardData = CardData.getCard(cardId);
    if (!cardData) {
      return;
    }

    // Do not display the faction if it's meatspace (spoilers!) or an act/agenda
    const factionText =
      cardData.faction == FACTION_MEAT ||
      cardData.type == TYPE_ACT ||
      cardData.type == TYPE_AGENDA
        ? ""
        : `${FACTION_TO_TEXT[cardData.faction]} `;

    let stats;
    if (cardData.type == TYPE_ASSET || cardData.type == TYPE_EVENT) {
      stats = `Cost: ${cardData.cost}<img class="inline-icon" src="img/game/credit.png">`;
    } else if (cardData.type == TYPE_IDENTITY) {
      stats = `
        <img class="inline-icon" src="img/game/influence.png"> Influence <span class="float-end">${cardData.influence}</span><br>
        <img class="inline-icon" src="img/game/mu.png"> MU <span class="float-end">${cardData.mu}</span><br>
        <img class="inline-icon" src="img/game/strength.png"> Strength <span class="float-end">${cardData.strength}</span><br>
        <img class="inline-icon" src="img/game/link.png"> Link <span class="float-end">${cardData.link}</span><br>
        Health <span class="float-end">${cardData.health}</span>`;
    } else if (cardData.type == TYPE_LOCATION) {
      stats = `
        Shroud <span class="float-end">${cardData.shroud}</span><br>
        Data <span class="float-end">${cardData.clues}</span>`;
    } else if (cardData.type == TYPE_ENEMY) {
      stats = `
        <img class="inline-icon" src="img/game/strength.png"> Strength <span class="float-end">${cardData.strength}</span><br>
        <img class="inline-icon" src="img/game/link.png"> Link <span class="float-end">${cardData.link}</span><br>
        Health <span class="float-end">${cardData.health}</span><br>`;
    }

    const body = `
      <div class="row">
        <div class="font-size-32">
          ${cardData.title}
        </div>
        <hr>
        <div class="font-size-20">
          <span class="fw-bold">${factionText}${
      TYPE_TO_TEXT[cardData.type]
    }</span>${
      cardData.subtypes
        ? `: ${cardData.subtypes.join(" - ").toTitleCase()}`
        : ""
    } 
        </div>
        ${stats ? `<hr><div class="font-size-18">${stats}</div>` : ""}
        ${cardData.formattedText ? "<hr>" : ""}
        <div class="quote">${cardData.formattedText}</div>
        ${
          cardData.flavour
            ? `<hr><div class="fst-italic my-2">${cardData.flavour}</div>`
            : ""
        }
        <hr>
        <div class="font-size-14 mt-2">${
          cardData.illustrator ? cardData.illustrator : "Illustrator: Ams"
        }</div>
      </div>`;

    const options = [new Option("close", "Close", "close")];
    const modal = new Modal({
      body: body,
      cardData: cardData,
      options: options,
      allowKeyboard: false, // Causes async issues (TODO: mightfix)
      size: "lg",
    });
    await modal.display();
    Modal.hide();
  };

  let mousedCard;
  let x = -1000;
  let y = -1000;
  $("body")
    .on(
      "mouseenter",
      ":not(.modal) :not(#card-focused) > .card-image-container",
      function () {
        Cards.focusCard($(this));
      }
    )
    .on(
      "mouseleave",
      ":not(.modal) .card-image-container:not(#card-focused-image, #card-modal-image)",
      function () {
        Cards.unfocusCard();
      }
    )
    .on(
      "dblclick",
      ":not(.grip-card) > .card-image-container:not(#card-modal-image)",
      function () {
        if (
          (UiMode.uiMode == UIMODE_SELECT_INSTALLED_CARD ||
            UiMode.uiMode == UIMODE_ASSIGN_DAMAGE) &&
          $(this).parent().hasClass("installed-card")
        ) {
          return;
        }
        displayCardModal($(this).parent().data("card-id"));
      }
    )
    .on(
      "mousedown",
      ".card-image-container:not(#card-modal-image)",
      function (e) {
        if (e.which == 2) {
          mousedCard = e.target;
          x = e.pageX;
          y = e.pageY;
        }
      }
    )
    .on(
      "mouseup",
      ".card-image-container:not(#card-modal-image)",
      function (e) {
        if (e.which == 2) {
          if (
            e.target == mousedCard &&
            (!e.target.classList.contains("location-image") ||
              Math.abs(e.pageX - x) + Math.abs(e.pageY - y) < 50)
          ) {
            displayCardModal($(this).parent().data("card-id"));
          }
          mousedCard = null;
        }
      }
    );

  $("#card-focused-image").click(function () {
    displayCardModal(Cards.focusedCardId);
  });
  $("#card-focused-toggle").click((e) => {
    e.preventDefault();
    $("#card-focused").toggleClass("hidden");
  });

  // View stack
  $("#stack").click(async function () {
    const cards = $(`<div class="row card-list"></div>`);
    for (const cardData of Cards.stack
      .slice()
      .sort((a, b) =>
        a.title.replace(/[^a-zA-Z0-9]/, "") >
        b.title.replace(/[^a-zA-Z0-9]/, "")
          ? 1
          : -1
      )) {
      const jCard = $(`
        <div class="col-3 position-relative">
          <div class="card-image-container card-list-card">
              <img class="grip-card-image card-image w-100" src="${cardData.image}" />
          </div>
        </div>`);
      Cards.populateData(
        jCard.find(".card-image-container"),
        cardData,
        "15.5px"
      );
      cards.append(jCard);
    }
    const body =
      Cards.stack.length == 0
        ? "Your deck is empty. The next time you attempt to draw, you will shuffle your discard pile into it."
        : cards;
    const modal = new Modal({
      header: `Your deck (${Cards.stack.length} ${
        Cards.stack.length == 1 ? "card" : "cards"
      })`,
      body: body,
      options: [new Option("close", "Close", "close")],
      allowKeyboard: false,
      size: Cards.stack.length == 0 ? "md" : "xl",
    });
    await modal.display();
    Modal.hide();
  });

  // View heap
  $("#heap").click(async function () {
    const cards = $(`<div class="row"></div>`);
    for (const cardData of Cards.heap
      .slice()
      .sort(
        (a, b) =>
          a.title.replace(/[^a-zA-Z0-9]/, "") >
          b.title.replace(/[^a-zA-Z0-9]/, "")
      )) {
      const jCard = $(`
        <div class="col-3 position-relative">
          <div class="card-image-container card-list-card">
              <img class="grip-card-image card-image w-100" src="${cardData.image}" />
          </div>
        </div>`);
      Cards.populateData(
        jCard.find(".card-image-container"),
        cardData,
        "15.5px"
      );
      cards.append(jCard);
    }
    const body = Cards.heap.length == 0 ? "Your discard pile is empty." : cards;
    const modal = new Modal({
      header: `Your discard pile (${Cards.heap.length} ${
        Cards.heap.length == 1 ? "card" : "cards"
      })`,
      body: body,
      options: [new Option("close", "Close", "close")],
      allowKeyboard: false,
      size: Cards.heap.length == 0 ? "md" : "xl",
    });
    await modal.display();
    Modal.hide();
  });
});
