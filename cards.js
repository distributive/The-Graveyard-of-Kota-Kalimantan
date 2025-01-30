class Cards {
  static stack = []; // Array of PlayableCardData classes
  static grip = []; // Array of GripCard objects
  static heap = []; // Array of PlayableCardData classes
  static installedCards = []; // Array of RigCard objects

  static focusedCardId;

  ///////////////////////////////////////////////
  // General

  static focusCard(jCardImage) {
    $("#card-focused-image")
      .attr("src", jCardImage.find(".card-image").attr("src"))
      // .attr("src", jCardImage.attr("src").replace(".png", "_full.png")) // TODO
      .removeClass("unfocused")
      .addClass("focused");
    this.focusedCardId = jCardImage.parent().data("card-id");
    Cards.populateData(
      $("#card-focused-image").parent(),
      CardData.getCard(this.focusedCardId),
      "16.5px"
    );
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
          Cards.populateData(
            jCardContainer,
            newCardData,
            jCardContainer.find(".card-text").css("font-size")
          );
        },
        fast ? 240 : 990
      );
    }
    setTimeout(
      () => {
        if (newCardData) {
          jCardContainer.find(".card-image").attr("src", newCardData.image);
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
  }

  static populateData(jObj, cardData, fontSize) {
    jObj.find(".card-text").remove();
    if (cardData) {
      cardData.populate(jObj);
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
  static addToStack(cardData, shuffleInto = false) {
    if (typeof cardData == "object") {
      this.stack.push(...cardData);
    } else {
      this.stack.push(cardData);
    }
    if (shuffleInto) {
      shuffle(this.stack);
    }
    this.updateStackHeapHeights();
    this.determineCanDraw();
  }

  // cardData may be an array of classes
  static addToHeap(cardData, shuffleInto = false) {
    if (cardData.length != null) {
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
  static draw(n = 1) {
    let i = 0;
    for (; i < n && this.canDraw(); i++) {
      if (this.stack.length == 0) {
        this.shuffleHeap();
      }
      const cardData = this.stack.pop();
      let jCard = $(
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
        jCard.find(".card-image-container"),
        cardData,
        "12.1px"
      );
      jCard.data("card-id", cardData.id);
      this.grip.push(new GripCard(cardData.id, jCard));
      setTimeout(() => {
        $("#grip").append(jCard);
        this.updateHandPositions();
      }, i * 50);
    }
    this.updateStackHeapHeights();
    this.determineCanDraw();
    return n - i;
  }

  static async discard(card) {
    const cardData = this.removeGripCard(card);
    if (cardData) {
      this.addToHeap(cardData);
      this.updateStackHeapHeights();
      this.determineCanDraw();
      await Broadcast.signal("onCardDiscarded", { cardData: cardData });
    }
  }

  static async discardRandom(number = 1) {
    for (let i = 0; i < number; i++) {
      await this.discard(randomIndex(Cards.grip));
    }
  }

  static shuffleHeap() {
    if (this.heap.length == 0) {
      return;
    }
    this.stack = shuffle(this.heap.map((x) => x));
    this.heap = [];
    this.updateStackHeapHeights();
    this.determineCanDraw();
  }

  static removeGripCard(card) {
    const index = typeof card == "object" ? this.grip.indexOf(card) : card;
    if (index >= 0 && index < this.grip.length) {
      const cardData = this.grip[index].cardData;
      this.grip[index].remove();
      this.grip.splice(index, 1);
      this.updateHandPositions();
      setTimeout(function () {
        Cards.updateHandPositions();
      }, 210);
      return cardData;
    }
    return false;
  }

  static async trashInstalledCard(card) {
    await Broadcast.signal("onAssetTrashed", { card: card });
    const cardData = this.removeInstalledCard(card);
  }

  static removeInstalledCard(card) {
    const index =
      typeof card == "object" ? this.installedCards.indexOf(card) : card;
    if (index >= 0 && index < this.installedCards.length) {
      const cardData = this.installedCards[index].cardData;
      this.installedCards[index].remove();
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
    $(".grip-card:not(.selected-card)")
      .css("--hand-size", $("#grip .grip-card:not(.selected-card)").length)
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

  static install(cardData) {
    const rigCard = new RigCard(cardData);
    this.installedCards.push(rigCard);
    return rigCard;
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
        Stats.credits >= gripCard.cost &&
        gripCard.cardData.canPlay(gripCard) &&
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

  constructor(cardId, jObj) {
    this.#cardData = CardData.getCard(cardId);
    this.#jObj = jObj;
    const instance = this;
    this.#jObj.click(async function () {
      if (UiMode.uiMode == UIMODE_SELECT_ACTION) {
        jObj.addClass("in-play");
        const { success, reason } = await Game.actionPlayCard(instance);
        if (success) {
          Cards.removeGripCard(instance);
        } else {
          jObj.removeClass("in-play");
          animate(instance.#jObj, 300);
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
  }

  get installed() {
    return false;
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

  remove() {
    let jObj = this.#jObj;
    jObj.addClass("transition-out");
    setTimeout(function () {
      jObj.remove();
    }, 200);
  }

  // // Releases the card from the grip and moves it to a given point
  // freeAndMove(x, y) {
  //   Cards.removeGripCard(this);
  //   this.#jObj.detach();
  //   $("body").append(this.#jObj);
  //   Cards.updateHandPositions();
  //   this.#jObj.css("left", `${x}px`);
  //   this.#jObj.css("bottom", `${y}px`);
  // }
}

///////////////////////////////////////////////////////////////////////////////

class RigCard {
  // STATIC
  static selectedCards = new Set();

  static deselectAll() {
    Cards.installedCards.forEach((card) => card.deselect());
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
      card.selectable = card.cardData.canUse && card.cardData.canUse(card);
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
  static highlightSelectableCards(fFilter) {
    Cards.installedCards.forEach((card) => {
      card.selectable = !fFilter || fFilter(card);
    });
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

  constructor(cardData) {
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
      "9.75px"
    );
    this.#jObj.data("card-id", this.#cardData.id);
    $("#rig").append(this.#jObj);

    this.#jObj.click(async () => {
      if (UiMode.uiMode == UIMODE_SELECT_ACTION) {
        if (instance.cardData.canUse(instance)) {
          await Game.actionUseCard(instance);
        }
      } else if (UiMode.uiMode == UIMODE_SELECT_INSTALLED_CARD) {
        if (RigCard.selectedCards.has(instance)) {
          instance.deselect();
        } else if (UiMode.data.maxCards == 1) {
          RigCard.deselectAll();
          instance.select();
        } else if (RigCard.selectedCards.size < UiMode.data.maxCards) {
          instance.select();
        } else {
          const message =
            UiMode.data.minCards != UiMode.data.maxCards
              ? `You must select between ${UiMode.data.minCards} and ${UiMode.data.maxCards} cards, inclusive.`
              : `You must select ${UiMode.data.maxCards} cards.`;
          Alert.send(message, ALERT_WARNING, true, false);
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
    this.setDamage(0);
    this.setDoom(0);
    this.setPower(0);
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
  set tapped(value) {
    if (value) {
      this.#jObj.addClass("tapped");
    } else {
      this.#jObj.removeClass("tapped");
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

  setDoom(value, doAnimate = true) {
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
    this.#doom = value;
    return this;
  }
  addDoom(value, doAnimate = true) {
    this.setDoom(this.#doom + value, doAnimate);
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
    RigCard.selectedCards.delete(this);
    this.#jObj.removeClass("selected-card");
  }

  remove() {
    let jObj = this.#jObj;
    jObj
      .addClass("transition-out")
      .removeClass("perceived-trashed")
      .removeClass("selectable")
      .removeClass("selected-card");
    setTimeout(function () {
      jObj.remove();
    }, 200);
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
    const body = `
      <div>
        ${cardData.title}
      </div>
      <div class="row">
        <div class="col-5">
          <img class="card-image w-100" id="card-modal-image" src="${
            cardData.image
          }" />
        </div>
        <div class="col-7">
          <div>
            ${FACTION_TO_TEXT[cardData.faction]} ${
      TYPE_TO_TEXT[cardData.type]
    } ${cardData.subtypes ? `: ${cardData.subtypes.join(" - ")}` : ""} 
          </div>
          <div>${cardData.text}</div>
        </div>
      </div>`;
    const options = [new Option("close", "Close", "close")];
    const modal = new Modal(null, {
      body: body,
      options: options,
      canCancel: true,
    });
    await modal.display();
    Modal.hide();
  };

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
        Cards.unfocusCard($(this));
      }
    )
    .on(
      "dblclick",
      ".card-image-container:not(#card-focused-image, #card-modal-image, .grip-card-image)",
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
    );

  $("#card-focused-image").click(function () {
    displayCardModal(Cards.focusedCardId);
  });
});
