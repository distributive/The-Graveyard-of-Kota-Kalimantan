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
      // .attr("src", jCardImage.attr("src").replace(".png", "_full.png"))
      .attr("src", jCardImage.attr("src"))
      .removeClass("unfocused")
      .addClass("focused");
    this.focusedCardId = jCardImage.parent().data("card-id");
  }
  static unfocusCard() {
    $("#card-focused-image").removeClass("focused").addClass("unfocused");
  }
  static removeFocusCard() {
    $("#card-focused-image").removeClass("focused").removeClass("unfocused");
  }

  static flip(jCardImage, newImage) {
    jCardImage.addClass("flipping");
    setTimeout(() => {
      if (newImage) {
        jCardImage.attr("src", newImage);
      }
      jCardImage.removeClass("flipping");
    }, 1000); // CSS currently takes 1s to flip a card halfway
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
    if (typeof cardData == "object") {
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
        `<div class="grip-card h-100">
          <div class="card-image-container h-100">
            <img class="grip-card-image card-image h-100" src="${cardData.image}" />
          </div>
        </div>`
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

  static discard(card) {
    const index = typeof card == "object" ? this.grip.indexOf(card) : card;
    if (this.removeGripCard(index)) {
      this.updateStackHeapHeights();
      this.determineCanDraw();
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
      this.grip[index].remove();
      this.grip.splice(index, 1);
      this.updateHandPositions();
      setTimeout(function () {
        Cards.updateHandPositions();
      }, 210);
      return true;
    }
    return false;
  }

  static removeInstalledCard(card) {
    const index =
      typeof card == "object" ? this.installedCards.indexOf(card) : card;
    if (index >= 0 && index < this.installedCards.length) {
      this.installedCards[index].remove();
      this.installedCards.splice(index, 1);
      return true;
    }
    return false;
  }

  static updateStackHeapHeights() {
    if (this.stack.length == 0) {
      $("#stack").addClass("empty");
    } else {
      $("#stack")
        .removeClass("empty")
        .css("--size", `${this.stack.length / 3}px`);
    }
    if (this.heap.length == 0) {
      $("#heap").addClass("empty");
    } else {
      $("#heap")
        .removeClass("empty")
        .css("--size", `${this.heap.length / 3}px`);
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

  static install(cardId) {
    const rigCard = new RigCard(cardId);
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
        Stats.credits >= gripCard.cardData.cost &&
        gripCard.cardData.canPlay(gripCard);
    });
  }
  static markAllCardsUnplayable() {
    Cards.grip.forEach((gripCard) => {
      gripCard.playable = false;
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
    });
  }

  get cardData() {
    return this.#cardData;
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

  static highlightPlayableCards() {
    Cards.installedCards.forEach((card) => {
      if (card.cardData.canPlay(card)) {
        card.#jObj.addClass("playable");
      } else {
        card.#jObj.removeClass("playable");
      }
    });
  }
  static highlightDamageableCards() {
    Cards.installedCards.forEach((card) => {
      if (card.health > 0) {
        card.#jObj.addClass("selectable");
      } else {
        card.#jObj.removeClass("selectable");
      }
    });
  }
  static unhighlightAllCards() {
    Cards.installedCards.forEach((card) =>
      card.#jObj.removeClass("playable").removeClass("selectable")
    );
  }

  static getDamageableCards() {
    return Cards.installedCards.filter((card) => card.health > 0);
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

  constructor(cardId) {
    const instance = this;
    this.#cardData = CardData.getCard(cardId);

    // card-padding is to make sure the parent class has the correct width
    this.#jObj = $(`
      <div class="installed-card">
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
    this.#jObj.data("card-id", this.#cardData.id);
    $("#rig").append(this.#jObj);

    this.#jObj.click(() => {
      if (UiMode.uiMode == UIMODE_SELECT_INSTALLED_CARD) {
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

  get cardData() {
    return this.#cardData;
  }
  get health() {
    return this.cardData.health;
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
    if (value < this.health) {
      this.setPerceivedDamage(value, doAnimate);
      this.#damage = value;
    } else {
      Cards.removeInstalledCard(this);
    }
    return this;
  }
  setPerceivedDamage(value, doAnimate = false) {
    const jDamage = this.#jDamage;
    if (value == 0) {
      this.#jDamage.hide();
    } else {
      this.#jDamage.show();
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

  setPower(value, doAnimate = true) {
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
    jObj.addClass("transition-out").removeClass("perceived-trashed");
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
    const modal = new Modal(null, null, body, options, true);
    await modal.display();
  };

  $("body")
    .on(
      "mouseenter",
      ":not(.modal) .card-image:not(#card-focused-image, #card-modal-image)",
      function () {
        Cards.focusCard($(this));
      }
    )
    .on(
      "mouseleave",
      ":not(.modal) .card-image:not(#card-focused-image, #card-modal-image)",
      function () {
        Cards.unfocusCard($(this));
      }
    )
    .on(
      "dblclick",
      ".card-image:not(#card-focused-image, #card-modal-image, .grip-card-image)",
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
