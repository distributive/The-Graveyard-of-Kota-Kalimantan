class Tutorial {
  static #flags = {};

  static async run(flag) {
    if (this.#flags[flag] || !this.#tutorials[flag]) {
      return;
    }
    this.#flags[flag] = true;

    const tutorial = this.#tutorials[flag].length
      ? this.#tutorials[flag]
      : [this.#tutorials[flag]];
    for (const page of tutorial) {
      await new Modal(null, page).display();
    }
    Modal.hide();
  }

  // Each tutorial is represented as a data collection (or list of data collections) to be passed to a new modal
  static #tutorials = {
    example: {
      header: "",
      body: "",
      options: [],
      allowKeyboard: false,
      image: null,
      slowRoll: false,
      size: "md",
    },
    //
    test: {
      header: "Test Tutorial",
      body: "This is a test tutorial modal. Please read this text.",
      options: [new Option("next", "Close")],
      allowKeyboard: false,
      image: null,
      slowRoll: false,
      size: "md",
    },
    testList: [
      {
        header: "Test List A",
        body: "This is the first page.",
        options: [new Option("next", "Next")],
        allowKeyboard: false,
        image: null,
        slowRoll: false,
        size: "md",
      },
      {
        header: "Test List B",
        body: "This is the second page.",
        options: [new Option("close", "Close")],
        allowKeyboard: false,
        image: null,
        slowRoll: false,
        size: "md",
      },
    ],
  };
}
