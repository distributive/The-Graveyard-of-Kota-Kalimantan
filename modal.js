class Modal {
  // STATIC
  static show(allowKeyboard) {
    $("#modal").modal({
      backdrop: allowKeyboard ? true : "static",
      keyboard: !!allowKeyboard,
    });
    $("#modal").modal("show");
  }
  static hide() {
    $("#modal").modal("hide");
  }

  static instances = {};
  static find(id) {
    return Modal.instances[id];
  }

  // INSTANCE
  #id;
  #header;
  #body;
  #options;
  #allowKeyboard; // Bool => true allows the modal to be closed by keyboard/clicking outside the modal

  constructor(id, header, body, options, allowKeyboard) {
    this.#id = id; // Null => temporary modal that does not need referencing later
    this.#header = header;
    this.#body = body;
    this.#options = options;
    this.#allowKeyboard = allowKeyboard;
    if (this.#id) {
      if (Modal.find(id)) {
        throw new Error(`Duplicate modal ID "${id}"`);
      }
      Modal.instances[id] = this;
    }
  }

  display() {
    let modal = $("#modal");
    if (this.#header) {
      modal.find("#modal-title").empty().append(this.#header);
      modal.find(".modal-header").show();
    } else {
      modal.find(".modal-header").hide();
    }
    let optionsParent = $(
      `<div id="modal-options" class="modal-options"></div>`
    );
    modal.find("#modal-body").empty().append(this.#body).append(optionsParent);
    this.#options.forEach((option) => {
      let optionContainer = $(
        `<button class="modal-option ${
          option.classes ? option.classes : ""
        }"></button>`
      );
      let effect =
        option.effect instanceof Modal
          ? () => {
              option.effect.display();
            }
          : option.effect == "close"
          ? Modal.hide
          : typeof option.effect == "string"
          ? () => {
              Modal.find(option.effect).display();
            }
          : option.effect;
      optionsParent.append(optionContainer.append(option.text).click(effect));
    });
    Modal.show(this.#allowKeyboard);
  }
}
