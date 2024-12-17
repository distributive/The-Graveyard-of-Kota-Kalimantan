class Enemy {
  #jObj;
  #currentLocation;
  #doom;

  constructor(jObj, location) {
    this.#jObj = jObj;
    this.#currentLocation = location;
  }

  set doom(value) {
    this.#doom = value;
  }
  get doom() {
    return this.#doom;
  }

  moveTo(location) {
    this.#currentLocation = location;
  }
}
