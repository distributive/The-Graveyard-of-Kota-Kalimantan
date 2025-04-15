class Menu {
  static #inMainMenu = true;

  static get isInMainMenu() {
    return this.#inMainMenu;
  }

  static enableInGameMenuButton() {
    $("#menu-button").attr("disabled", false);
  }
  static disableInGameMenuButton() {
    $("#menu-button").attr("disabled", true);
  }

  // Main menu
  static async showMainMenu() {
    this.showMainBG();
    // Audio.transitionMusic(AUDIO_TRACK_MAIN, 2000, 0, 0);
    Audio.fadeOutMusic(2000);

    const modal = new Modal({
      body: `
        <h1 class="text-center font-fancy font-size-36 text-decoration-underline">The Graveyard of Kota Kalimantan</h1>
        <h2 class="text-center font-scifi font-size-24">A Netrunner scenario</h2>
      `,
      options: [
        new Option("options", "Options", "secondary"),
        new Option("play", "Play"),
        new Option("about", "About", "secondary"),
      ],
      allowKeyboard: false,
      size: "xl",
    });

    // Remain in the main menu until the player chooses to play
    let inMenu = true;
    while (inMenu) {
      const option = await modal.display();
      if (option == "options") {
        await this.showOptionsMenu(false);
      } else if (option == "about") {
        await this.showAbout();
      } else if (option == "play") {
        inMenu = false;
      }
    }

    // Determine if there is a save to be loaded
    if (Serialisation.saveExists) {
      const saveFoundModal = new Modal({
        body: `An existing save has been found. Do you wish to resume or restart the scenario?`,
        options: [
          new Option("resume", "Resume"),
          new Option("restart", "Restart"),
        ],
        allowKeyboard: false,
        size: "md",
      });
      const confirmModal = new Modal({
        body: `Are you sure you want to restart?`,
        options: [new Option("y", "Yes"), new Option("n", "No")],
        allowKeyboard: false,
        size: "md",
      });
      const failModal = new Modal({
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
            Audio.fadeInMusic(AUDIO_TRACK_LEVEL_1, 3000);
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
    const characterModal = new Modal({
      body: `<div class="w-100 text-center font-size-20">Choose your character</div>`,
      options: [
        new Option("topan", "", "character-button topan-select"),
        new Option("baz", "", "character-button baz-select"),
        new Option(
          "catalyst",
          "",
          Tutorial.catalystIsUnlocked
            ? "character-button catalyst-select"
            : "character-button catalyst-select disabled"
        ),
      ],
      allowKeyboard: false,
      size: "xl",
    });

    // Set images and add listeners for the mouseover animations
    setTimeout(function () {
      $(".topan-select").append(
        $(`
          <div id="topan-image" class="card-image-container character-selection-image">
            <img class="card-image w-100" src="img/card/identity/topanFull.png" />
          </div>
        `)
      );
      $(".baz-select").append(
        $(`
          <div id="baz-image" class="card-image-container character-selection-image">
            <img class="card-image w-100" src="img/card/identity/bazFull.png" />
          </div>
        `)
      );
      $(".catalyst-select").append(
        $(`
          <div id="catalyst-image" class="card-image-container character-selection-image">
            <img class="card-image w-100" src="img/card/identity/theCatalystFull.png" />
          </div>
        `)
      );
      $("#topan-image").hover(
        function () {
          $(this)
            .find(".card-image")
            .attr("src", "img/card/identity/topan.png");
          Audio.playEffect(AUDIO_CHARACTER_SELECT);
          Cards.populateData($(this), CardTopan, "1.4em");
        },
        function () {
          $(this)
            .find(".card-image")
            .attr("src", "img/card/identity/topanFull.png");
          $(this).find(".card-text").remove();
        }
      );
      $("#baz-image").hover(
        function () {
          $(this).find(".card-image").attr("src", "img/card/identity/baz.png");
          Audio.playEffect(AUDIO_CHARACTER_SELECT);
          Cards.populateData($(this), CardBaz, "1.4em");
        },
        function () {
          $(this)
            .find(".card-image")
            .attr("src", "img/card/identity/bazFull.png");
          $(this).find(".card-text").remove();
        }
      );
      $("#catalyst-image").hover(
        function () {
          $(this)
            .find(".card-image")
            .attr("src", "img/card/identity/theCatalyst.png");
          Audio.playEffect(AUDIO_CHARACTER_SELECT);
          Cards.populateData($(this), CardTheCatalyst, "1.4em");
        },
        function () {
          $(this)
            .find(".card-image")
            .attr("src", "img/card/identity/theCatalystFull.png");
          $(this).find(".card-text").remove();
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

    // Once the player has gone this far, it's probably safe to wipe their previous save
    Serialisation.deleteSave();

    // If they previously wiped all local data but then got this far, mark them as a returning player again
    Serialisation.saveSetting("returning", true);

    // Offer to skip the tutorial if it has already been completed
    let tutorialActive = true;
    if (Tutorial.catalystIsUnlocked) {
      const skipTutorialModal = new Modal({
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

    // Lore cutscene
    await new Modal({
      body: INTRO_1,
      options: [new Option("", "Continue")],
      allowKeyboard: false,
      size: "md",
    }).display();
    const branch = await new Modal({
      body: INTRO_2,
      options: [
        new Option("a", `"Let’s get to work"`),
        new Option("b", `"…job?"`),
        new Option("c", `"I'm Baz"`),
      ],
      image: "img/character/sahasrara.png",
      allowKeyboard: false,
      slowRoll: true,
      size: "lg",
    }).display();

    // Choice for skipping
    let choice = "skip";

    // Irrelevant branching
    if (branch == "a") {
      choice = await new Modal({
        body: INTRO_3_ACCEPT,
        options: [
          new Option("", `"Alright, let’s go"`),
          new Option("skip", `"I just want to see the scoop"`),
        ],
        image: "img/character/sahasraraHappy.png",
        allowKeyboard: false,
        slowRoll: true,
        size: "lg",
      }).display();
    } else if (branch == "b") {
      choice = await new Modal({
        body: INTRO_3_CONFUSION,
        options: [
          new Option("", `"Alright, let’s go"`),
          new Option("skip", `"I just want to see the scoop"`),
        ],
        image: "img/character/sahasraraPensive.png",
        allowKeyboard: false,
        slowRoll: true,
        size: "lg",
      }).display();
    } else {
      await new Modal({
        body: identity == CardBaz ? `That's right!` : `Babe, no.`,
        options: [new Option("", `Continue`)],
        image:
          identity == CardBaz
            ? "img/character/sahasraraHappy.png"
            : "img/character/sahasraraPensive.png",
        allowKeyboard: false,
        slowRoll: true,
        size: "lg",
      }).display();
      choice = await new Modal({
        body: INTRO_3_BAZ,
        options: [
          new Option("", `"Alright, let’s go"`),
          new Option("skip", `"I just want to see the scoop"`),
        ],
        image: "img/character/sahasrara.png",
        allowKeyboard: false,
        slowRoll: true,
        size: "lg",
      }).display();
    }

    // Skip cutscene (giving the player the opportunity to skip straight to the end)
    const skipCutscenes = [
      new Modal({
        body: `Oh, uh. You do?`,
        options: [
          new Option("skip", `"Yes"`),
          new Option("", `"Just kidding!"`),
        ],
        image: "img/character/sahasraraPensive.png",
        allowKeyboard: false,
        slowRoll: true,
        rollSpeed: 40,
        size: "lg",
      }),
      new Modal({
        body: `We uh, spent a lot of time working on this.<br><br>Are you sure you don't want to try it?`,
        options: [
          new Option("", `"Oh okay"`),
          new Option("skip", `"Scoop please"`),
        ],
        image: "img/character/sahasrara.png",
        allowKeyboard: false,
        slowRoll: true,
        rollSpeed: 70,
        size: "lg",
      }),
      new Modal({
        body: `ok`,
        options: [
          new Option("skip", `"Scoop"`),
          new Option("", `"I'll try your game"`),
        ],
        image: "img/character/sahasraraSad.png",
        allowKeyboard: false,
        slowRoll: true,
        voices: [AUDIO_VOICE_SAD_1],
        size: "lg",
      }),
    ];
    if (choice == "skip") {
      for (let i = 0; i < skipCutscenes.length && choice == "skip"; i++) {
        choice = await skipCutscenes[i].display();
      }
      if (choice == "skip") {
        Ending.show(ENDING_SKIP_GAME);
        Modal.hide();
        return;
      }
    }

    // Intro cutscene
    await new Modal({
      body: `<p>Splendid!</p><p>Our benefactor left us the key with the address.</p>`,
      options: [new Option("", "Begin")],
      image: "img/character/sahasraraHappy.png",
      allowKeyboard: false,
      slowRoll: true,
      size: "lg",
    }).display();

    Modal.hide();
    await Game.initGameState(identity, tutorialActive);
    await wait(500);
    this.hideMainBG();
    Audio.fadeInMusic(AUDIO_TRACK_LEVEL_1, 3000);
  }

  static showMainBG() {
    this.#inMainMenu = true;
    $("#main-menu-bg").addClass("show");
    $("#main-menu-bg").show();
  }
  static hideMainBG(doAnimate = true) {
    this.#inMainMenu = false;
    $("#main-menu-bg").removeClass("show");
    if (!doAnimate) {
      $("#main-menu-bg").hide();
    }
  }

  // Options menu
  static async showOptionsMenu(inGame = true) {
    let inMenu = true;
    while (inMenu) {
      const options = [];
      if (inGame) {
        options.push(new Option("", "Resume"));
        options.push(null);
        options.push(new Option("main", "Main Menu"));
      } else {
        options.push(new Option("", "Back"));
      }
      options.push(null);
      options.push(
        new Option("music", `Music volume (${Audio.musicVolume * 100}%)`)
      );
      options.push(new Option("sfx", `SFX volume (${Audio.sfxVolume * 100}%)`));
      options.push(
        new Option(
          "buttons",
          `UI SFX (${Audio.buttonsMuted ? "Muted" : "Unmuted"})`
        )
      );
      options.push(
        new Option(
          "slowRoll",
          `Text animation (${Modal.slowRollDisabled ? "Disabled" : "Enabled"})`
        )
      );
      if (inGame) {
        options.push(null);
        options.push(new Option("about", "About"));
        options.push(new Option("credits", "Credits"));
      } else {
        options.push(null);
        options.push(new Option("reset", "Reset save data"));
        options.push(new Option("delete", "Delete all data"));
      }
      const modal = new Modal({
        body: `<div class="text-center font-size-32">Options</div>`,
        options: options,
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
      } else if (option == "buttons") {
        Audio.toggleButtons();
      } else if (option == "slowRoll") {
        Modal.toggleSlowRoll();
      } else if (option == "reset") {
        const confirm = await new Modal({
          body: `This will delete your current game progress.`,
          options: [new Option("confirm", "Confirm"), new Option("", "Cancel")],
          allowKeyboard: false,
          size: "md",
        }).display();
        if (confirm == "confirm") {
          Serialisation.deleteSave();
          inMenu = false;
        }
      } else if (option == "delete") {
        const confirm = await new Modal({
          body: `This will delete all local game data, including your current game progress and any settings.`,
          options: [new Option("confirm", "Confirm"), new Option("", "Cancel")],
          allowKeyboard: false,
          size: "md",
        }).display();
        if (confirm == "confirm") {
          Serialisation.deleteSave();
          Serialisation.deleteAllSettings();
          inMenu = false;
        }
      } else {
        inMenu = false;
      }
    }

    if (inGame) {
      Modal.hide();
    }
  }

  // Does not close the modal
  static async showAbout() {
    const body = `
      <div>
        <div>This single-player card game is based on the mechanics of Arkham Horror LCG and was made in support of the release of Null Signal Games' next set: <em>Elevation.</em></div>
        <div>Although it was made with the help of members of NSG, it is not an official NSG product nor is it endorsed as such.</div>
        <div class="mt-2 font-size-20">Content warnings</div>
        <ul>
          <li>Mild horror themes</li>
          <li>Unreality</li>
          <li>Hand-drawn depictions of rats, snakes, and bugs (including a spider)</li>
        </ul>
        <div>
          There are no jumpscares, flashing lights, or sudden noises.
        </div>
      </div>
      `;
    const option = await new Modal({
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
        <div>A game by Ams.</div>
        
        <div class="container mt-2">
          <div class="row">
            <div class="col-4 px-2">
              <div class="mt-2 font-size-20">Writing</div>
              <ul>
                <li>chord gang</li>
                <li>Ams</li>
              </ul>
            </div>
            <div class="col-4 px-2">
              <div class="mt-2 font-size-20">Music</div>
              <ul>
                <li>Tripp Mirror</li>
              </ul>
            </div>
            <div class="col-4 px-2">
              <div class="mt-2 font-size-20">Additional art</div>
              <ul>
                <li>Lish</li>
                <li>PiCat</li>
              </ul>
            </div>
          </div>
        </div>
        <div>
          <div class="font-size-20">Special thanks</div>
          <ul>
            <li>NSG Narrative contacts: Patrick Sklar and Ginevra Martin</li>
            <li>NSG Visual contact: Conrad "Banknote" Kluck</li>
          </ul>
          <div class="mt-2 font-size-20">Art assets</div>
          <ul>
            <li>Card art used with NSG's permission by Benjamin Giletti, Júlio Rocha, and Zefanya Langkan Maega</li>
            <li>Royalty free images taken from unsplash.com</li>
            <li>Royalty free sound effects taken from freesound.org</li>
            <li><em>To view a card's illustrator, double click or mousewheel click it</em></li>
          </ul>
          <div class="mt-2 font-size-20">Playtesters</div>
          <div class="container">
            <div class="row px-4">
              <ul class="col-3">
                <li>Mandoline</li>
                <li>LLBlumire</li>
              </ul>
              <ul class="col-3">
                <li>Hello</li>
                <li>rielle</li>
              </ul>
              <ul class="col-3">
                <li>Mezzie</li>
                <li>-</li>
              </ul>
              <ul class="col-3">
                <li>DeeR</li>
                <li>-</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      `;
    const option = await new Modal({
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
    Menu.showOptionsMenu(true);
  });
});

///////////////////////////////////////////////////////////////////////////////

const INTRO_1 = `
<p>Her claws racing down your back.</p>
<br>
<p>Her fetid breath upon your neck.</p>
<br>
<p>Her dreadful teeth, sinking deep into your-</p>
`;

const INTRO_2 = `
<p>Hey, hey wake up! It’s time!</p>
<p>It gets lonely, y’know, being stuck in your PAD with no-one else to talk to. Plus, the window of opportunity for this job is real narrow. I was worried you were gonna sleep right through it!</p>
`;

const INTRO_3_ACCEPT = `
<p>Great!</p>
<p>As you know, last week we were pinged by someone calling themselves Sh1rl3yH4cks0n.</p>
<p>They asked us to loot a server farm on the outskirts of town. Only they didn’t call it a server farm. They called it a net graveyard. Went on and on about net entities too dangerous to be kept under corp control but too precious to be purged.</p>
<p>They’re offering a particularly scrumptious bounty for one particular entity. Apparently we’ll know her by her white dress, long dark hair and … <em>haunting beauty</em>.</p>
<p>Sounds like someone’s got a crush. It's me. Anyway, the money’s good and the building is unguarded. What could go wrong?</p>
`;

const INTRO_3_CONFUSION = `
<p>Wow, must have been a heavy sleep. Let me jog your memory.</p>
<p>Last week we were pinged by someone calling themselves Sh1rl3yH4cks0n.</p>
<p>They asked us to loot a server farm on the outskirts of town. Only they didn’t call it a server farm. They called it a net graveyard. Went on and on about net entities too dangerous to be kept under corp control but too precious to be purged.</p>
<p>They’re offering a particularly scrumptious bounty for one particular entity. Apparently we’ll know her by her white dress, long dark hair and … <em>haunting beauty</em>.</p>
<p>Sounds like someone’s got a crush. It's me. Anyway, the money’s good and the building is unguarded. What could go wrong?</p>
`;

const INTRO_3_BAZ = `
<p>Last week we were pinged by someone calling themselves Sh1rl3yH4cks0n.</p>
<p>They asked us to loot a server farm on the outskirts of town. Only they didn’t call it a server farm. They called it a net graveyard. Went on and on about net entities too dangerous to be kept under corp control but too precious to be purged.</p>
<p>They’re offering a particularly scrumptious bounty for one particular entity. Apparently we’ll know her by her white dress, long dark hair and … <em>haunting beauty</em>.</p>
<p>Sounds like someone’s got a crush. It's me. Anyway, the money’s good and the building is unguarded. What could go wrong?</p>
`;
