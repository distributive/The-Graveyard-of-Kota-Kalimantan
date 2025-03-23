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

  static get isModalVisible() {
    return $("#modal").css("display") != "none";
  }

  // INSTANCE
  #header;
  #body;
  #options;
  #checkboxes;
  #allowKeyboard; // bool => true allows the modal to be closed by keyboard/clicking outside the modal
  #image; // Mutually exclusive with cardData
  #cardData; // Mutually exclusive with image
  #slowRoll; // bool => true makes the text in #body appear word by word (assumes #body is a container of <p>s)
  #rollSpeed; // number => how many ms between words if slowRoll is true
  #voices; // [AUDIO] => array of audio clips to randomly play for each word if slowRoll is true
  #size; // string => [xl, lg, sm] (default is medium) - Preference is xl for meta game modals, lg for image modals, and md for game mechanics

  constructor(data) {
    const {
      header,
      body,
      options,
      checkboxes,
      allowKeyboard,
      image,
      cardData,
      slowRoll,
      rollSpeed,
      voices,
      size,
    } = data;
    this.#header = header;
    this.#body = body;
    this.#options = options;
    this.#checkboxes = checkboxes;
    this.#allowKeyboard = allowKeyboard;
    this.#image = image;
    this.#cardData = cardData;
    this.#slowRoll = slowRoll;
    this.#rollSpeed = rollSpeed ? rollSpeed : 30;
    this.#voices = voices ? voices : AUDIO_VOICES;
    this.#size = size;
  }

  async display() {
    // Create modal
    const jOptions = [];
    const jCheckboxes = [];
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
        `<div id="card-modal-image" class="card-image-container h-100 float-start">
          <img class="card-image w-100 h-100" src="${this.#cardData.image}" />
        </div>`
      );
      Cards.populateData(imageContainer, this.#cardData, "19.5px");
      this.#body = $(`<div></div>`)
        .append(imageContainer)
        .append(bodyContainer);
      imageContainer.parent().data("card-id", this.#cardData.id);
    } else if (typeof this.#body == "string") {
      this.#body = $(`<div></div>`).append(bodyContainer);
    }

    // Checkboxes
    const checkboxesParent = $(
      this.#checkboxes
        ? `<div id="modal-checkboxes" class="modal-checkboxes mx-3"></div>`
        : ""
    );
    if (this.#checkboxes) {
      this.#checkboxes.forEach((option) => {
        const jCheckbox = $(
          `<label class="modal-checkbox-container">
            <input type="checkbox" class="modal-checkbox ${
              option.classes ? option.classes : ""
            }"></input>
            <div class="mx-2" >–</div>
            <div>${option.text}</div>
          </label>`
        );
        jCheckboxes.push([option, jCheckbox]);
        checkboxesParent.append(jCheckbox);
      });
    }

    // Options
    const optionsParent = $(
      `<div id="modal-options" class="modal-options"></div>`
    );
    this.#options.forEach((option) => {
      // Entering null as an option inserts a line break
      if (option) {
        const optionContainer = $(
          `<button class="modal-option ${
            option.classes ? option.classes : ""
          }"></button>`
        );
        const jOption = optionContainer.append(option.text);
        jOptions.push([option, jOption]);
        optionsParent.append(jOption);
      } else {
        optionsParent.append(`<br style="margin:1em 0 0 0">`);
      }
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
    jModal
      .find("#modal-body")
      .empty()
      .append(this.#body)
      .append(checkboxesParent)
      .append(optionsParent);

    // Start slow roll animation
    if (this.#slowRoll) {
      const rollSpeed = this.#rollSpeed;
      const voices = this.#voices;
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
            Audio.playEffect(randomElement(voices));
            for (let i = 1; i < paragraph.length; i++) {
              await wait(rollSpeed);
              if (rollSpeed >= 50 || i % 2 == 0) {
                Audio.playEffect(randomElement(voices));
              }
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
            if (jCheckboxes.length == 0) {
              resolve(option.id);
            } else {
              const checkboxResults = {};
              jCheckboxes.forEach(([option, jCheckbox]) => {
                checkboxResults[option.id] = jCheckbox
                  .find("input[type='checkbox']")
                  .is(":checked");
              });
              resolve({
                option: option.id,
                checkboxes: checkboxResults,
              });
            }
            if (!Audio.buttonsMuted) {
              Audio.playEffect(AUDIO_CLICK, true);
            }
          });
        });
      });
    }
  }
}
