class Menu {
  static enableInGameMenuButton() {
    $("#menu-button").attr("disabled", false);
  }
  static disableInGameMenuButton() {
    $("#menu-button").attr("disabled", true);
  }

  // Main menu
  static async showMainMenu() {
    this.showMainBG();

    const modal = new Modal(null, {
      body: `<div class="text-center font-size-32">Netham Horror</div>`,
      options: [
        new Option("about", "About", "secondary"),
        new Option("play", "Play"),
        new Option("credits", "Credits", "secondary"),
      ],
      allowKeyboard: false,
      size: "xl",
    });

    // Remain in the main menu until the player chooses to play
    let inMenu = true;
    while (inMenu) {
      const option = await modal.display();
      if (option == "credits") {
        await this.showCredits();
      } else if (option == "about") {
        await this.showAbout();
      } else if (option == "play") {
        inMenu = false;
      }
    }

    // Determine if there is a save to be loaded
    if (Serialisation.saveExists) {
      const saveFoundModal = new Modal(null, {
        body: `An existing save has been found. Do you wish to resume or restart the scenario?`,
        options: [
          new Option("resume", "Resume"),
          new Option("restart", "Restart"),
        ],
        allowKeyboard: false,
        size: "md",
      });
      const confirmModal = new Modal(null, {
        body: `Are you sure you want to restart?`,
        options: [new Option("y", "Yes"), new Option("n", "No")],
        allowKeyboard: false,
        size: "md",
      });
      const failModal = new Modal(null, {
        body: "The save file was corrupted and could not be loaded.",
        options: [new Option("", "Restart")],
        allowKeyboard: false,
        size: "md",
      });
      let undecided = true;
      while (undecided) {
        const option = await saveFoundModal.display();
        if (option == "resume") {
          const success = await Serialisation.load();
          if (success) {
            Modal.hide();
            await wait(500);
            this.hideMainBG();
            return;
          } else {
            await failModal.display();
            undecided = false;
          }
        } else {
          const confirmOption = await confirmModal.display();
          if (confirmOption == "y") {
            undecided = false;
          }
        }
      }
    }

    // Start the animation now so they can't see it
    Story.setNetspace(false);

    // Pick an ID
    const characterModal = new Modal(null, {
      body: `
        <div>
          <div class="text-center font-size-32">Character selection</div>
          <div class="row mt-3 mb-4">
            <div class="col-4"><img id="topan-image" class="card-image character-selection-image" src="img/card/identity/topan.png" /></div>
            <div class="col-4"><img id="baz-image" class="card-image character-selection-image" src="img/card/identity/baz.png" /></div>
            <div class="col-4"><img id="catalyst-image" class="card-image character-selection-image ${
              Tutorial.catalystIsUnlocked ? "" : "disabled"
            }" src="img/card/identity/theCatalyst.png" /></div>
          </div>
        </div>
        `,
      options: [
        new Option("topan", "Topan", "character-button topan-select"),
        new Option("baz", "Baz", "character-button baz-select"),
        new Option(
          "catalyst",
          Tutorial.catalystIsUnlocked ? "The Catalyst" : "Locked",
          Tutorial.catalystIsUnlocked
            ? "character-button catalyst-select"
            : "character-button disabled"
        ),
      ],
      allowKeyboard: false,
      size: "xl",
    });

    // Add listeners for the mouseover animations
    setTimeout(function () {
      $(".topan-select").hover(
        function () {
          $("#topan-image")
            .addClass("hover")
            .attr("src", "img/card/identity/topanFull.png");
        },
        function () {
          $("#topan-image")
            .removeClass("hover")
            .attr("src", "img/card/identity/topan.png");
        }
      );
      $(".baz-select").hover(
        function () {
          $("#baz-image")
            .addClass("hover")
            .attr("src", "img/card/identity/bazFull.png");
        },
        function () {
          $("#baz-image")
            .removeClass("hover")
            .attr("src", "img/card/identity/baz.png");
        }
      );
      $(".catalyst-select").hover(
        function () {
          $("#catalyst-image")
            .addClass("hover")
            .attr("src", "img/card/identity/theCatalystFull.png");
        },
        function () {
          $("#catalyst-image")
            .removeClass("hover")
            .attr("src", "img/card/identity/theCatalyst.png");
        }
      );
    }, 1);

    const identityOption = await characterModal.display();
    const identity =
      identityOption == "topan"
        ? CardTopan
        : identityOption == "baz"
        ? CardBaz
        : CardTheCatalyst;

    // Offer to skip the tutorial if it has already been completed
    let tutorialActive = true;
    if (Tutorial.catalystIsUnlocked) {
      const skipTutorialModal = new Modal(null, {
        body: `Would you like to skip the tutorial, or replay it?`,
        options: [new Option("skip", "Skip"), new Option("", "Replay")],
        allowKeyboard: false,
        size: "md",
      });
      const skipOption = await skipTutorialModal.display();
      if (skipOption == "skip") {
        tutorialActive = false;
      }
    }

    await Tutorial.run("intro");

    Modal.hide();
    await Game.initGameState(identity, tutorialActive);
    await wait(500);
    this.hideMainBG();
  }

  static showMainBG() {
    $("#main-menu-bg").addClass("show");
    $("#main-menu-bg").show();
  }
  static hideMainBG(doAnimate = true) {
    $("#main-menu-bg").removeClass("show");
    if (!doAnimate) {
      $("#main-menu-bg").hide();
    }
  }

  // In-game menu
  static async showInGameMenu() {
    let inMenu = true;
    while (inMenu) {
      const modal = new Modal(null, {
        body: `<div class="text-center font-size-32">Options</div>`,
        options: [
          new Option("", "Resume"),
          new Option("main", "Main Menu"),
          new Option("music", Audio.musicMuted ? "Unmute music" : "Mute music"),
          new Option("sfx", Audio.sfxMuted ? "Unmute SFX" : "Mute SFX"),
          new Option("credits", "Credits"),
          new Option("about", "About"),
        ],
        allowKeyboard: false,
        size: "sm",
      });
      const option = await modal.display();
      if (option == "credits") {
        await this.showCredits();
      } else if (option == "about") {
        await this.showAbout();
      } else if (option == "main") {
        // Intentionally break synchronicity
        this.showMainMenu();
        Tutorial.clearHintTimout(); // Prevent tutorial alerts spawning
        Alert.reset(); // Clean up remaining alerts
        return;
      } else if (option == "music") {
        Audio.toggleMusic();
      } else if (option == "sfx") {
        Audio.toggleSfx();
      } else {
        inMenu = false;
      }
    }

    Modal.hide();
  }

  // Does not close the modal
  static async showAbout() {
    const body = `
      <div>
        <div>This game was made in support of the release of Null Signal Games' Elevation set.</div>
        <div>Although it was made with the help of members of NSG, it is not an official product.</div>
        <div class="mt-2 font-size-20">Content warnings</div>
        <ul>
          <li>Mild horror themes</li>
          <li>TBD</li>
        </ul>
        <div>
          There are no jumpscares, flashing lights, or sudden noises.
        </div>
      </div>
      `;
    const option = await new Modal(null, {
      header: "About",
      body: body,
      options: [new Option("", "Back"), new Option("credits", "Credits")],
      allowKeyboard: false,
      size: "lg",
    }).display();
    if (option == "credits") {
      await this.showCredits();
    }
  }

  // Does not close the modal
  static async showCredits() {
    const body = `
      <div>
        <div>A game by Ams. Written by Ams and chord gang.</div>
        <div>Music by Tripp Mirror.</div>
        <div class="mt-2 font-size-20">Special thanks</div>
        <ul>
          <li>NSG Narrative contacts: Patrick Sklar and Ginevra Martin</li>
          <li>NSG Art contact: Conrad "Banknote" Kluckdw</li>
        </ul>
        <div class="mt-2 font-size-20">Art assets</div>
        <ul>
          <li>Card art used with NSG's permission by Benjamin Giletti, Júlio Rocha, and Zefanya Langkan Maega.</li>
          <li>Royalty free images taken from unsplash.com</li>
          <li>Royalty free sound effects taken from freesound.org</li>
        </ul>
        <div class="mt-2 font-size-20">Playtesters</div>
        <ul>
          <li>TBD</li>
        </ul>
      </div>
      `;
    const option = await new Modal(null, {
      header: "Credits",
      body: body,
      options: [new Option("", "Back"), new Option("about", "About")],
      allowKeyboard: false,
      size: "lg",
    }).display();
    if (option == "about") {
      await this.showAbout();
    }
  }
}

///////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  $("#menu-button").click((e) => {
    e.preventDefault();
    Menu.showInGameMenu();
  });
});
