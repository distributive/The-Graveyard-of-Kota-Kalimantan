class Enemy {
  #jObj;
  #jDamage;
  #jClues;
  #jDoom;

  #currentLocation;
  #damage;
  #clues;
  #doom;

  constructor(location) {
    this.#jObj = $(`
      <div class="enemy-container">
        <img src="img/card/enemyPlaceholder.png" class="enemy-image card-image" onmousedown="event.preventDefault()" />
        <div class="hosted-counters">
          <div class="damage shake-counter"></div>
          <div class="clues shake-counter"></div>
          <div class="doom shake-counter"></div>
        </div>
      </div>`);
    Location.root.append(this.#jObj);

    this.#jDamage = this.#jObj.find(".damage");
    this.#jClues = this.#jObj.find(".clues");
    this.#jDoom = this.#jObj.find(".doom");
    this.setDamage(0);
    this.setClues(0);
    this.setDoom(0);

    this.moveTo(location);
  }

  moveTo(location) {
    if (this.#currentLocation) {
      this.#currentLocation.removeEnemy(this);
    }
    this.#currentLocation = location;
    this.#currentLocation.addEnemy(this);
    const [x, y] = location.pos;
    this.#jObj.css("--x-pos", `${Location.xCoordToPos(x)}px`);
    this.#jObj.css("--y-pos", `${Location.yCoordToPos(y)}px`);
  }

  // Ensures enemies at the same location don't fully overlap
  setOffsetIndex(index, length) {
    this.#jObj.css("--index", index);
    if (index == length - 1) {
      this.#jObj.find(".hosted-counters").removeClass("covered");
    } else {
      this.#jObj.find(".hosted-counters").addClass("covered");
    }
  }

  setDamage(value, doAnimate = true) {
    if (value == 0) {
      this.#jDamage.hide();
    } else {
      this.#jDamage.show();
    }
    let jDamage = this.#jDamage;
    jDamage.html(value);
    if (value != this.#damage && doAnimate) {
      jDamage.addClass("animate");
      setTimeout(function () {
        jDamage.removeClass("animate");
      }, 500);
    }
    this.#damage = value;
    return this;
  }

  setClues(value, doAnimate = true) {
    if (value == 0) {
      this.#jClues.hide();
    } else {
      this.#jClues.show();
    }
    let jClues = this.#jClues;
    jClues.html(value);
    if (value != this.#clues && doAnimate) {
      jClues.addClass("animate");
      setTimeout(function () {
        jClues.removeClass("animate");
      }, 500);
    }
    this.#clues = value;
    return this;
  }

  setDoom(value, doAnimate = true) {
    if (value == 0) {
      this.#jDoom.hide();
    } else {
      this.#jDoom.show();
    }
    let jDoom = this.#jDoom;
    jDoom.html(value);
    if (value != this.#doom && doAnimate) {
      jDoom.addClass("animate");
      setTimeout(function () {
        jDoom.removeClass("animate");
      }, 500);
    }
    this.#doom = value;
    return this;
  }
}
