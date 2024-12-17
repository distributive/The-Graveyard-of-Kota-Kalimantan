class Cards {
  static stack = []; // Array of card IDs
  static grip = []; // Array of GripCard objects
  static heap = []; // Array of card IDs
  static installedCards = []; // Array of RigCard objects

  ///////////////////////////////////////////////
  // General

  static focusCard(cardImage) {
    $("#card-focused-image").attr("src", cardImage.attr("src"));
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
    return n - i;
  }

  static discard(index) {
    if (this.removeGripCard(index)) {
      this.updateStackHeapHeights();
    }
  }

  static shuffleHeap() {
    if (this.heap.length == 0) {
      return;
    }
    this.stack = shuffle(this.heap.map((x) => x));
    this.heap = [];
    this.updateStackHeapHeights();
  }

  static removeGripCard(card) {
    const index = typeof card == "object" ? this.grip.indexOf(card) : card;
    if (index >= 0 && index < this.grip.length) {
      this.grip.splice(index, 1);
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
    jObj.click(() => {
      if (UiMode.uiMode != UIMODE_SELECT_GRIP_CARD) {
        return;
      }
      if (this == GripCard.selectedCard) {
        this.deselect();
      } else {
        this.select();
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

  $("body").on("mouseenter", ".card-image", function () {
    Cards.focusCard($(this));
  });
});
