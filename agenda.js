class Agenda {
  static #doom;

  static get doom() {
    return this.#doom;
  }

  static setDoom(value, doAnimate = true) {
    const jDoom = $("#agenda .doom");
    if (value == 0) {
      jDoom.hide();
    } else {
      jDoom.show();
    }
    jDoom.html(value);
    if (value != this.#doom && doAnimate) {
      animate(jDoom, 500);
    }
    this.#doom = value;
    return this;
  }
  static addDoom(value, doAnimate = true) {
    this.setDoom(this.#doom + value, doAnimate);
  }

  static advance() {
    // TODO - implement advancing
    this.setDoom(0);
  }
}
