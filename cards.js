class Cards {
  static stack = []; // Array of card IDs
  static grip = []; // Array of GripCard objects
  static heap = []; // Array of card IDs
  static installedCards = []; // Array of RigCard objects

  ///////////////////////////////////////////////
  // General

  static focusCard(jCardImage) {
    $("#card-focused-image")
      // .attr("src", jCardImage.attr("src").replace(".png", "_full.png"))
      .attr("src", jCardImage.attr("src"))
      .removeClass("unfocused")
      .addClass("focused");
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

  static addToStack(cardId, shuffleInto = false) {
    if (typeof cardId == "object") {
      this.stack.push(...cardId);
    } else {
      this.stack.push(cardId);
    }
    if (shuffleInto) {
      shuffle(this.stack);
    }
    this.updateStackHeapHeights();
    this.determineCanDraw();
  }

  static addToHeap(cardId, shuffleInto = false) {
    if (typeof cardId == "object") {
      this.heap.push(...cardId);
    } else {
      this.heap.push(cardId);
    }
    if (shuffleInto) {
      shuffle(this.heap);
    }
    this.updateStackHeapHeights();
    this.determineCanDraw();
  }

  // Returns the number of cards that couldn't be drawn
  static draw(n = 1) {
    let i = 0;
    for (; i < n && (this.stack.length > 0 || this.heap.length > 0); i++) {
      if (this.stack.length == 0) {
        this.shuffleHeap();
      }
      this.stack.pop();
      let jCard = $(
        `<div class="grip-card h-100"><img class="grip-card-image card-image h-100" src="img/card/placeholder.png" /></div>`
      );
      this.grip.push(new GripCard(jCard));
      setTimeout(() => {
        $("#grip").append(jCard);
        this.updateHandPositions();
      }, i * 50);
    }
    this.updateStackHeapHeights();
    this.determineCanDraw();
    return n - i;
  }

  static discard(index) {
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
    $(".grip-card:not(.selected-card)")
      .css("--hand-size", $("#grip .grip-card:not(.selected-card)").length)
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
    // card-padding is to make sure the parent class has the correct width
    // TODO: create a high/low res copy of each card image and have this display the high one
    let jCard = $(`
      <div class="installed-card h-100">
        <img class="card-padding h-100" src="img/card/placeholder.png" />
        <img class="installed-card-image card-image h-100" src="img/card/placeholder.png" />
      </div>`);
    $("#rig").append(jCard);
    this.installedCards = new RigCard(jCard);
  }
}

///////////////////////////////////////////////////////////////////////////////

class GripCard {
  static selectedCard = null;

  #jObj;

  constructor(jObj) {
    this.#jObj = jObj;
    let instance = this;
    this.#jObj.click(function () {
      if (UiMode.uiMode == UIMODE_SELECT_ACTION) {
        if (Game.actionPlayCard(instance)) {
          Cards.removeGripCard(instance);
        }
      } else if (UiMode.uiMode == UIMODE_SELECT_GRIP_CARD) {
        if (instance == GripCard.selectedCard) {
          instance.deselect();
        } else {
          instance.select();
        }
      }
    });
  }

  select() {
    GripCard.selectedCard = this;
    $(".grip-card").removeClass("selected-card");
    this.#jObj.addClass("selected-card");
    Cards.updateHandPositions();
  }

  // Only to be used if another card is not being selected
  deselect() {
    GripCard.selectedCard = null;
    $(".grip-card").removeClass("selected-card");
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
  static instances = [];
  static selectAll() {
    this.instances.forEach((card) => card.select());
  }
  static deselectAll() {
    this.instances.forEach((card) => card.deselect());
  }

  #jObj;
  #selected = false;

  constructor(jObj) {
    RigCard.instances.push(this);
    this.#jObj = jObj;
    jObj.click(() => {
      if (UiMode.uiMode != UIMODE_SELECT_INSTALLED_CARD) {
        return;
      }
      if (this.#selected) {
        this.deselect();
      } else {
        this.select();
      }
    });
  }

  select() {
    this.#selected = true;
    this.#jObj.addClass("selected-card");
  }

  deselect() {
    this.#selected = false;
    this.#jObj.removeClass("selected-card");
  }
}

///////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  Cards.updateStackHeapHeights();

  const displayCardModal = function () {
    const header = "Card Title";
    const body = `
      <img class="card-image" id="card-modal-image" src="${$(
        "#card-focused-image"
      ).attr("src")}" />
      <div>Card text here.</div>`;
    const options = [new Option("Close", "close")];
    const modal = new Modal(null, header, body, options, true);
    modal.display();
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
      ".card-image:not(#card-focused-image, #card-modal-image)",
      displayCardModal
    );

  $("#card-focused-image").click(displayCardModal);
});
