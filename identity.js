class Identity {
  static #cardData;
  static #damage;

  static get cardData() {
    return this.#cardData;
  }
  static get damage() {
    return this.#damage;
  }
}
