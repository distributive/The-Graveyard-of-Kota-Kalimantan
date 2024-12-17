class Modal {
  // STATIC
  static show() {
    $("#modal").modal({ backdrop: "static", keyboard: false });
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

  constructor(id, header, body, options) {
    this.#id = id;
    this.#header = header;
    this.#body = body;
    this.#options = options;
    if (Modal.find(id)) {
      throw new Error(`Duplicate modal ID "${id}"`);
    }
    Modal.instances[id] = this;
  }

  display() {
    let modal = $("#modal");
    modal.find("#modal-title").empty().append(this.#header);
    let optionsParent = $(
      `<div id="modal-options" class="modal-options"></div>`
    );
    modal.find("#modal-body").empty().append(this.#body).append(optionsParent);
    this.#options.forEach((option) => {
      let optionContainer = $(`<button class="modal-option"></button>`);
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
    Modal.show();
  }
}

/** effect values:
 * - "close" - closes the modal
 * - any other string - attempts to find the modal with that ID and displays it
 * - modal object - displays that modal
 * - function - runs the function
 */
class Option {
  constructor(text, effect) {
    this.text = text;
    this.effect = effect;
  }
}
