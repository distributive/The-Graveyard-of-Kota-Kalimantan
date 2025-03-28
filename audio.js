const AUDIO_TRACK_LEVEL_1 = "./audio/track1.wav";
const AUDIO_TRACK_LEVEL_2 = "./audio/track2.wav";

const AUDIO_CREDIT = "./audio/credit.mp3";

const AUDIO_DRAW = "./audio/draw.mp3";
const AUDIO_SHUFFLE = "./audio/shuffle.mp3";
const AUDIO_PLAY = "./audio/play.mp3";
const AUDIO_TRASH = "./audio/trash.mp3";
const AUDIO_UNPLAYABLE = "./audio/cardUnplayable.mp3";

const AUDIO_FLICK_0 = "./audio/flick0.mp3";
const AUDIO_FLICK_1 = "./audio/flick1.mp3";
const AUDIO_FLICK_2 = "./audio/flick2.mp3";
const AUDIO_FLICK_3 = "./audio/flick3.mp3";
const AUDIO_FLICK_4 = "./audio/flick4.mp3";
const AUDIO_FLICK_5 = "./audio/flick5.mp3";
const AUDIO_FLICKS = [
  AUDIO_FLICK_0,
  AUDIO_FLICK_0,
  AUDIO_FLICK_0,
  AUDIO_FLICK_0,
  AUDIO_FLICK_0,
  AUDIO_FLICK_0,
  AUDIO_FLICK_0,
  AUDIO_FLICK_0,
  AUDIO_FLICK_1,
  AUDIO_FLICK_1,
  AUDIO_FLICK_1,
  AUDIO_FLICK_1,
  AUDIO_FLICK_1,
  AUDIO_FLICK_1,
  AUDIO_FLICK_1,
  AUDIO_FLICK_1,
  // AUDIO_FLICK_2,
  AUDIO_FLICK_3,
  AUDIO_FLICK_4,
  AUDIO_FLICK_5,
];

const AUDIO_MOVE_MEATSPACE = "./audio/walk_inside.mp3";
const AUDIO_MOVE_NETSPACE = "./audio/walk_netspace.mp3";
const AUDIO_MOVE_OUTSIDE = "./audio/walk_outside.mp3";

const AUDIO_SUCCESS = "./audio/success.mp3";
const AUDIO_FAIL = "./audio/fail.mp3";
const AUDIO_ROLL_0 = "./audio/roll0.mp3";
const AUDIO_ROLL_1 = "./audio/roll1.mp3";
const AUDIO_ROLLS = [AUDIO_ROLL_0, AUDIO_ROLL_1];

const AUDIO_ATTACK = "./audio/attack.mp3";
const AUDIO_ATTACK_RAT = "./audio/ratAttack.mp3";
const AUDIO_ATTACK_ARROW = "./audio/arrowAttack.mp3";
const AUDIO_ATTACK_BIRD = "./audio/birdAttack.mp3";
const AUDIO_ATTACK_BOSS = "./audio/bossAttack.mp3";
const AUDIO_ATTACK_BUG = "./audio/bugAttack.mp3";
const AUDIO_ATTACK_DESIGNER = "./audio/designerAttack.mp3";
const AUDIO_ATTACK_SPIDER = "./audio/spiderAttack.mp3";

const AUDIO_DEATH_BOSS = "./audio/bossDeath.mp3";

const AUDIO_PAIN = "./audio/pain.mp3";
const AUDIO_DEATH = "./audio/death.mp3";

const AUDIO_CLICK = "./audio/click.mp3";
const AUDIO_CHARACTER_SELECT = "./audio/characterSelect.mp3";

const AUDIO_VOICE_0 = "./audio/voice0.mp3";
const AUDIO_VOICE_1 = "./audio/voice1.mp3";
const AUDIO_VOICES = [AUDIO_VOICE_0, AUDIO_VOICE_1];

const AUDIO_VOICE_SAD_0 = "./audio/voiceSad0.mp3";
const AUDIO_VOICE_SAD_1 = "./audio/voiceSad1.mp3";
const AUDIO_VOICES_SAD = [AUDIO_VOICE_SAD_0, AUDIO_VOICE_SAD_1];

///////////////////////////////////////////////////////////////////////////////

class Audio {
  // MUSIC
  static #audioMusic;

  static playMusic(track, loop = true) {
    // Cancel previous track
    this.stopMusic();

    // Play new track
    this.#audioMusic = document.createElement("audio");
    this.#audioMusic.setAttribute("src", track);
    this.#audioMusic.muted = this.musicMuted;
    this.#audioMusic.addEventListener("canplay", function () {
      this.play();
    });
    if (loop) {
      this.#audioMusic.addEventListener(
        "ended",
        function () {
          this.play();
        },
        false
      );
    }
  }

  static stopMusic() {
    if (this.#audioMusic) {
      this.#audioMusic.setAttribute("src", "");
      this.#audioMusic.remove();
    }
  }

  // delay is in ms
  static async fadeOutMusic(delay) {
    if (!this.#audioMusic) {
      return;
    }
    if (delay > 0) {
      const steps = delay / 50;
      for (let i = 0; i < steps; i++) {
        this.#audioMusic.volume = 1 - i / steps;
        await wait(50);
      }
    }
    this.stopMusic();
  }
  static async fadeInMusic(track, delay, loop = true) {
    this.playMusic(track, loop);
    if (delay > 0) {
      this.#audioMusic.volume = 0;
      const steps = delay / 50;
      for (let i = 0; i < steps; i++) {
        this.#audioMusic.volume = i / steps;
        await wait(50);
      }
      this.#audioMusic.volume = 1;
    }
  }

  static async transitionMusic(
    track,
    outroLength,
    delay,
    introLength,
    loop = true
  ) {
    if (this.#audioMusic) {
      await this.fadeOutMusic(outroLength);
    }
    await wait(delay);
    await this.fadeInMusic(track, introLength, loop);
  }

  // SFX
  static playEffect(effect, force = false) {
    if (this.sfxMuted && !force) {
      return;
    }
    const audio = document.createElement("audio");
    audio.setAttribute("src", effect);
    audio.addEventListener("canplay", function () {
      this.play();
    });
    audio.addEventListener(
      "ended",
      function () {
        this.remove();
      },
      false
    );
  }

  // SETTINGS
  static toggleMusic() {
    Serialisation.saveSetting("music-muted", !this.musicMuted);
    if (this.#audioMusic) {
      this.#audioMusic.muted = this.musicMuted;
    }
  }
  static toggleSfx() {
    Serialisation.saveSetting("sfx-muted", !this.sfxMuted);
  }
  static toggleButtons() {
    Serialisation.saveSetting("buttons-muted", !this.buttonsMuted);
  }

  static get musicMuted() {
    const muted = Serialisation.loadSetting("music-muted");
    return muted ? muted == "true" : false;
  }
  static get sfxMuted() {
    const muted = Serialisation.loadSetting("sfx-muted");
    return muted ? muted == "true" : false;
  }
  static get buttonsMuted() {
    const muted = Serialisation.loadSetting("buttons-muted");
    return muted ? muted == "true" : false;
  }
}

///////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  let debounce = false;
  $("body").on("click", function () {
    if (debounce) {
      return;
    }
    debounce = true;
    if (Menu.isInMainMenu) {
      // Audio.playMusic(AUDIO_TRACK_MAIN);
    } else if (!Story.isInNetspace) {
      Audio.fadeInMusic(AUDIO_TRACK_LEVEL_1, 3000);
    } else {
      Audio.fadeInMusic(AUDIO_TRACK_LEVEL_2, 3000);
    }

    // Set up the audio listeners once the player has interacted with the page
    $("body").on("click", "button:not(.modal-option)", function () {
      if (!Audio.buttonsMuted) {
        Audio.playEffect(AUDIO_CLICK, true);
      }
    });
    $("body").on("click", "input[type='checkbox']", function () {
      if (!Audio.buttonsMuted) {
        Audio.playEffect(AUDIO_CLICK, true);
      }
    });
    $("body").on("mouseenter", "button:not(.character-button)", function () {
      if (!Audio.buttonsMuted) {
        Audio.playEffect(AUDIO_FLICK_0, true);
      }
    });
    $("body").on("mouseenter", ".selectable", function () {
      if (!Audio.buttonsMuted) {
        Audio.playEffect(AUDIO_FLICK_0, true);
      }
    });
  });
});
