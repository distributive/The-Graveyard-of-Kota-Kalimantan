let alert_i = 0;
const ALERT_PRIMARY = alert_i++;
const ALERT_SECONDARY = alert_i++;
const ALERT_INFO = alert_i++;
const ALERT_WARNING = alert_i++;
const ALERT_DANGER = alert_i++;

const ALERT_LIMIT = 3;
const ALERT_TIMEOUT = 5000; //ms

///////////////////////////////////////////////////////////////////////////////

const ALERT_TYPE_TO_CLASS = {};
ALERT_TYPE_TO_CLASS[ALERT_PRIMARY] = "alert-primary";
ALERT_TYPE_TO_CLASS[ALERT_SECONDARY] = "alert-secondary";
ALERT_TYPE_TO_CLASS[ALERT_INFO] = "alert-info";
ALERT_TYPE_TO_CLASS[ALERT_WARNING] = "alert-warning";
ALERT_TYPE_TO_CLASS[ALERT_DANGER] = "alert-danger";

///////////////////////////////////////////////////////////////////////////////

class Alert {
  // STATIC
  static #alerts = []; // list of IDs
  static #idToAlert = {};
  static #nextId = 0;

  // Returns the alert created
  static send(
    message,
    type,
    dismissible = true,
    pinned = false,
    options = null
  ) {
    // If it is a simple alert (no options, unpinned and dismissible) and the
    // previous alert shares the same text, conflate them
    if (!options && dismissible && !pinned && this.#alerts.length > 0) {
      const prevAlertId = this.#alerts[this.#alerts.length - 1];
      const prevAlert = this.#idToAlert[prevAlertId];
      if (prevAlert.#message == message) {
        prevAlert.refreshTimeout(true);
        return;
      }
    }

    // Limit alert count (ignores pinned alerts)
    if (this.#alerts.length > ALERT_LIMIT - 1) {
      this.removeLastDismissable();
    }

    // Create alert
    const alert = new Alert(message, type, dismissible, pinned, options);
    this.#alerts.unshift(alert.id);
    this.#idToAlert[alert.id] = alert;

    // Return the alert
    return alert;
  }

  static remove(id, forceClose = true) {
    const index = this.#alerts.indexOf(id);
    if (index < 0) {
      return;
    }
    if (forceClose) {
      this.#idToAlert[id].close();
    }
    delete this.#idToAlert[id];
    this.#alerts.splice(index, 1);
  }

  static removeLastDismissable(forceClose = true) {
    if (this.#alerts.length < 1) {
      return;
    }
    let i = this.#alerts.length - 1;
    for (; i >= 0 && !this.#idToAlert[this.#alerts[i]].dismissible; i--) {}
    if (i < 0) {
      return;
    }
    this.remove(this.#alerts[i], forceClose);
  }

  // Remains for prosperity - I don't expect to use this
  static removeLastAlert() {
    if (this.#alerts.length < 1) {
      return;
    }
    const alert = this.#alerts.pop();
    this.remove(alert.data("card-id"));
  }

  // INSTANCE
  #id;
  #jObj;
  #message;
  #dismissible;
  #timeout; // Only if dismissible
  #options;
  #hasBeenClosed = false;

  constructor(
    message,
    type,
    dismissible = true,
    pinned = false,
    options = null
  ) {
    const instance = this;
    const id = Alert.#nextId++;
    this.#id = id;
    this.#message = message;
    this.#options = options;
    this.#dismissible = dismissible;

    // Create the jQuery object
    // This looks a mess, but it's just a customisable Bootstrap 5 alert
    this.#jObj = $(`
      <div class="alert ${ALERT_TYPE_TO_CLASS[type ? type : ALERT_PRIMARY]} ${
      dismissible ? "alert-dismissible" : ""
    } ${pinned ? "important" : ""} fade show">
        ${message}
        ${
          dismissible
            ? `<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`
            : ""
        }</div>`);
    this.#jObj.data("alert-id", id);

    // Add any option buttons
    if (options) {
      let optionsParent = $(`<div class="alert-options"></div>`);
      options.forEach((option) => {
        let optionContainer = $(
          `<button class="alert-option ${
            option.classes ? option.classes : ""
          }"></button>`
        );
        optionsParent.append(optionContainer.append(option.text));
      });
      this.#jObj.append(optionsParent);
    }

    // Clean up alerts closed by the user
    // Does not force close the UI, as that will recursively call this function
    this.#jObj.on("close.bs.alert", function () {
      if (!instance.#hasBeenClosed) {
        instance.#hasBeenClosed = true;
        Alert.remove(id, false);
      }
    });

    // Automatically remove dismissable alerts after a short period
    if (dismissible) {
      this.refreshTimeout(false); // (Re)starts the timeout
    }

    // Add to the page
    $("#alert-container").prepend(this.#jObj);
  }

  get id() {
    return this.#id;
  }
  get dismissible() {
    return this.#dismissible;
  }

  refreshTimeout(doAnimate = true) {
    clearTimeout(this.#timeout);
    this.#timeout = setTimeout(function () {
      if (!instance.#hasBeenClosed) {
        instance.#hasBeenClosed = true;
        Alert.remove(id);
      }
    }, ALERT_TIMEOUT);
    if (doAnimate) {
      animate(this.#jObj, 500);
    }
  }

  // Adds listeners to the alert's buttons
  // Alert options do nothing unless this is called
  // This needs calling again for each successive response requested
  async waitForOption() {
    if (!this.#options) {
      return;
    }
    // Wait for an option to be clicked and return its ID
    // Closing the alert is the caller's responsibility
    const instance = this;
    return await new Promise(function (resolve) {
      // Relies on this.#options and the option container having the same order
      const options = instance.#options;
      instance.#jObj.find(".alert-option").each(function (i) {
        $(this)
          .off("click")
          .click(() => {
            resolve(options[i].id);
          });
      });
    });
  }

  close() {
    this.#jObj.alert("close");
  }
}
