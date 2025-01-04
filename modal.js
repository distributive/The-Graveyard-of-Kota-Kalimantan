class DuplicateModalIdError extends Error {
  constructor(modalId) {
    super(
      `The modal ID '${modalId}' is already in use and cannot be reassigned.`
    );
    this.name = "DuplicateModalIdError";
  }
}

// class MultipleModalError extends Error {
//   constructor(activeModalId, newModalId) {
//     super(
//       `Modal with id '${newModalId}' cannot be displayed as there is already an active modal with ID '${activeModalId}'.`
//     );
//     this.name = "MultipleModalError";
//   }
// }

///////////////////////////////////////////////////////////////////////////////

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
    this.#id = id; // null => temporary modal that does not need referencing later
    this.#header = header;
    this.#body = body;
    this.#options = options;
    this.#allowKeyboard = allowKeyboard;
    if (id) {
      if (Modal.find(id)) {
        throw new DuplicateModalIdError(id);
      }
      Modal.instances[id] = this;
    }
  }

  async display() {
    // Create modal
    const jOptions = [];
    const jModal = $("#modal");
    if (this.#header) {
      jModal.find("#modal-title").empty().append(this.#header);
      jModal.find(".modal-header").show();
    } else {
      jModal.find(".modal-header").hide();
    }
    const optionsParent = $(
      `<div id="modal-options" class="modal-options"></div>`
    );
    jModal.find("#modal-body").empty().append(this.#body).append(optionsParent);
    this.#options.forEach((option) => {
      const optionContainer = $(
        `<button class="modal-option ${
          option.classes ? option.classes : ""
        }"></button>`
      );
      const jOption = optionContainer.append(option.text);
      jOptions.push([option, jOption]);
      optionsParent.append(jOption);
    });
    Modal.show(this.#allowKeyboard);

    // Wait for an option to be pressed
    // It is the responsibility of the caller to close the modal
    return await new Promise(function (resolve, reject) {
      jOptions.forEach(([option, jOption]) => {
        jOption.click(async function () {
          resolve(option.id);
        });
      });
    });
  }
}
