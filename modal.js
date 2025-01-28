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
  static #visible = false;

  static show(allowKeyboard) {
    $("#modal").modal({
      backdrop: allowKeyboard ? true : "static",
      keyboard: !!allowKeyboard,
    });
    if (!this.#visible) {
      $("#modal").modal("show");
      this.#visible = true;
    }
  }
  static async hide() {
    await $("#modal").modal("hide");
    this.#visible = false;
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
  #allowKeyboard; // bool => true allows the modal to be closed by keyboard/clicking outside the modal
  #image; // Mutually exclusive with cardData
  #cardData; // Mutually exclusive with image
  #slowRoll; // bool => true makes the text in #body appear word by word (assumes #body is a container of <p>s)
  #size; // string => [xl, lg, sm] (default is medium) - Preference is xl for meta game modals, lg for image modals, and md for game mechanics

  constructor(id, data) {
    this.#id = id; // null => temporary modal that does not need referencing later
    const {
      header,
      body,
      options,
      allowKeyboard,
      image,
      cardData,
      slowRoll,
      size,
    } = data;
    this.#header = header;
    this.#body = body;
    this.#options = options;
    this.#allowKeyboard = allowKeyboard;
    this.#image = image;
    this.#cardData = cardData;
    this.#slowRoll = slowRoll;
    this.#size = size;
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

    // Set size
    $(".modal-dialog")
      .removeClass("modal-xl")
      .removeClass("modal-lg")
      .removeClass("modal-sm");
    if (this.#size) {
      if (this.#size == "xl") {
        $(".modal-dialog").addClass("modal-xl");
      } else if (this.#size == "lg") {
        $(".modal-dialog").addClass("modal-lg");
      } else if (this.#size == "sm") {
        $(".modal-dialog").addClass("modal-sm");
      }
    }

    // Header
    if (this.#header) {
      jModal.find("#modal-title").empty().append(this.#header);
      jModal.find(".modal-header").show();
    } else {
      jModal.find(".modal-header").hide();
    }

    // Body
    const bodyContainer = $(`<div id="modal-body-container"></div>`).append(
      this.#body
    );
    if (this.#image) {
      const imageContainer = $(
        `<img id="modal-image" class="float-start" src="${this.#image}" />`
      );
      this.#body = $(`<div></div>`)
        .append(imageContainer)
        .append(bodyContainer);
    } else if (this.#cardData) {
      const imageContainer = $(
        `<div class="card-image-container float-start">
          <img class="card-image h-100" src="${this.#cardData.image}" />
        </div>`
      );
      Cards.populateData(imageContainer, this.#cardData, "19.5px");
      this.#body = $(`<div></div>`)
        .append(imageContainer)
        .append(bodyContainer);
      imageContainer.parent().data("card-id", this.#cardData.id);
    } else if (typeof this.#body == "string") {
      this.#body = $(`<div>${this.#body}</div>`);
    }

    // Options
    const optionsParent = $(
      `<div id="modal-options" class="modal-options"></div>`
    );
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

    // Slow roll
    const paragraphs = [];
    if (this.#slowRoll) {
      bodyContainer.find("p").each(function (i, e) {
        paragraphs.push(e.outerText.split(" "));
      });
      if (paragraphs.length == 0) {
        paragraphs.push(bodyContainer.html().split(" "));
      }
      bodyContainer.empty();
    }

    // Combine the elements
    jModal.find("#modal-body").empty().append(this.#body).append(optionsParent);

    // Start slow roll animation
    if (this.#slowRoll) {
      (async function () {
        jOptions.forEach(([option, jOption]) => {
          jOption.attr("disabled", true);
        });
        for (const paragraph of paragraphs) {
          await wait(500);
          if (paragraph.length > 0) {
            const p = $(`<p></p>`);
            bodyContainer.append(p);
            p.append(paragraph[0]);
            for (let i = 1; i < paragraph.length; i++) {
              await wait(30);
              p.append(" " + paragraph[i]);
            }
          }
        }
        jOptions.forEach(([option, jOption]) => {
          jOption.attr("disabled", false);
        });
      })();
    }

    if (this.#options) {
      // Wait for an option to be pressed
      // It is the responsibility of the caller to close the modal
      return await new Promise(function (resolve) {
        jOptions.forEach(([option, jOption]) => {
          jOption.click(async function () {
            resolve(option.id);
          });
        });
      });
    }
  }
}

$(document).ready(async function () {
  const a = new Modal("a", {
    header: "Test Character",
    body: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.`,
    options: [new Option("next", "Next")],
    allowKeyboard: false,
    image: "img/character/sahasrara.png",
    slowRoll: true,
    size: "xl",
  });
  const b = new Modal("b", {
    header: "Test Character",
    body: `<p>Contrary to popular belief, Lorem Ipsum is not simply random text.</p><p>It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.</p><p>Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC.</p><p>This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p><p>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p>`,
    options: [new Option("next", "Next")],
    allowKeyboard: false,
    image: "img/character/sahasraraHappy.png",
    slowRoll: true,
    size: "lg",
  });
  const c = new Modal("c", {
    header: "Test Character",
    body: "Test text",
    options: [new Option("next", "Next")],
    allowKeyboard: false,
    image: "img/character/sahasraraPensive.png",
    slowRoll: true,
  });
  const d = new Modal("d", {
    header: "Test Character",
    body: "Test text",
    options: [new Option("next", "Next")],
    allowKeyboard: false,
    image: "img/character/sahasraraSad.png",
    slowRoll: true,
    size: "sm",
  });

  // await Modal.find("a").display();
  // await Modal.find("b").display();
  // await Modal.find("c").display();
  // await Modal.find("d").display();
  // Modal.hide();
});
