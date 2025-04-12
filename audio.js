const AUDIO_TRACK_LEVEL_1 = "./audio/track1.mp3";
const AUDIO_TRACK_LEVEL_2 = "./audio/track2.mp3";

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

const AUDIO_VOICE_DYING_A_0 = "./audio/voiceDyingA0.mp3";
const AUDIO_VOICE_DYING_A_1 = "./audio/voiceDyingA1.mp3";
const AUDIO_VOICES_DYING_A = [AUDIO_VOICE_DYING_A_0, AUDIO_VOICE_DYING_A_1];

const AUDIO_VOICE_DYING_B_0 = "./audio/voiceDyingB0.mp3";
const AUDIO_VOICE_DYING_B_1 = "./audio/voiceDyingB1.mp3";
const AUDIO_VOICES_DYING_B = [AUDIO_VOICE_DYING_B_0, AUDIO_VOICE_DYING_B_1];

const AUDIO_VOICE_DYING_C_0 = "./audio/voiceDyingC0.mp3";
const AUDIO_VOICE_DYING_C_1 = "./audio/voiceDyingC1.mp3";
const AUDIO_VOICES_DYING_C = [AUDIO_VOICE_DYING_C_0, AUDIO_VOICE_DYING_C_1];

const AUDIO_VOICE_DEAD_0 = "./audio/voiceDead0.mp3";
const AUDIO_VOICE_DEAD_1 = "./audio/voiceDead1.mp3";
const AUDIO_VOICES_DEAD = [AUDIO_VOICE_DEAD_0, AUDIO_VOICE_DEAD_1];

const AUDIO_FLOWER_DEATH = "./audio/flowerDeath.mp3";

const AUDIO_EMP = "./audio/emp.mp3";

///////////////////////////////////////////////////////////////////////////////

class Audio {
  // MUSIC
  static #audioMusic;

  static #volumeStep; // Change in volume each interval
  static #volumeIntervalID; // Interval runs every 50ms

  static playMusic(track, loop = true) {
    // Cancel previous track
    this.stopMusic();

    // Play new track
    this.#audioMusic = document.createElement("audio");
    this.#audioMusic.setAttribute("src", track);
    this.#audioMusic.volume = this.musicVolume;
    this.#audioMusic.muted = this.#audioMusic.volume == 0;
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

  // Should never be called if there is a running routine already (it does not check)
  // Currently assumes it will only be set to target 0 or 1
  static startVolumeRoutine() {
    this.#volumeIntervalID = setInterval(
      function (audioMusic, volumeStep) {
        const newVolume = audioMusic.volume + volumeStep;
        if (newVolume < 0) {
          audioMusic.volume = 0;
          Audio.stopVolumeRoutine();
          Audio.stopMusic(); // We're assuming this is wanted
        } else if (newVolume > 1) {
          audioMusic.volume = 1;
          Audio.stopVolumeRoutine();
        } else {
          audioMusic.volume = newVolume;
        }
      },
      50,
      this.#audioMusic,
      this.#volumeStep
    );
  }
  static stopVolumeRoutine() {
    if (this.#volumeIntervalID) {
      clearInterval(this.#volumeIntervalID);
    }
  }

  // delay is in ms
  static async fadeOutMusic(delay) {
    if (!this.#audioMusic) {
      return;
    }
    this.stopVolumeRoutine();

    if (delay > 0) {
      this.#volumeStep = -50 / delay;
      this.startVolumeRoutine();
    }
  }
  static async fadeInMusic(track, delay, loop = true) {
    this.playMusic(track, loop);
    if (delay > 0) {
      this.stopVolumeRoutine();
      this.#audioMusic.volume = 0;

      this.#volumeStep = 50 / delay;
      this.startVolumeRoutine();
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
  static playEffect(effect) {
    const volume = this.sfxVolume;
    if (volume == 0) {
      return;
    }
    const audio = document.createElement("audio");
    audio.setAttribute("src", effect);
    audio.addEventListener("canplay", function () {
      this.volume = volume;
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
    const volume =
      (this.musicVolumeIndex + 1) % Object.keys(this.#volumeIndices).length;
    Serialisation.saveSetting("music-volume", volume);
    if (this.#audioMusic) {
      this.#audioMusic.volume = this.#volumeIndices[volume];
      this.#audioMusic.muted = this.#volumeIndices[volume] == 0;
    }
  }
  static toggleSfx() {
    const volume =
      (this.sfxVolumeIndex + 1) % Object.keys(this.#volumeIndices).length;
    Serialisation.saveSetting("sfx-volume", volume);
  }
  static toggleButtons() {
    Serialisation.saveSetting("buttons-muted", !this.buttonsMuted);
  }

  static get musicVolume() {
    return this.#volumeIndices[this.musicVolumeIndex];
  }
  static get musicVolumeIndex() {
    const raw = Serialisation.loadSetting("music-volume");
    return isNaN(raw) ? 2 : parseInt(raw); // Default to 50%
  }
  static get sfxVolume() {
    return this.#volumeIndices[this.sfxVolumeIndex];
  }
  static get sfxVolumeIndex() {
    const raw = Serialisation.loadSetting("sfx-volume");
    return isNaN(raw) ? 0 : parseInt(raw); // Default to 100%
  }
  static get buttonsMuted() {
    const muted = Serialisation.loadSetting("buttons-muted");
    return muted ? muted == "true" : false;
  }

  // Volumes are saved as an index rather than a percentage
  static #volumeIndices = {
    0: 1,
    1: 0.75,
    2: 0.5,
    3: 0.25,
    4: 0,
  };
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
        Audio.playEffect(AUDIO_CLICK);
      }
    });
    $("body").on("click", "input[type='checkbox']", function () {
      if (!Audio.buttonsMuted) {
        Audio.playEffect(AUDIO_CLICK);
      }
    });
    $("body").on("mouseenter", "button:not(.character-button)", function () {
      if (!Audio.buttonsMuted) {
        Audio.playEffect(AUDIO_FLICK_0);
      }
    });
    $("body").on("mouseenter", ".selectable", function () {
      if (!Audio.buttonsMuted) {
        Audio.playEffect(AUDIO_FLICK_0);
      }
    });
  });
});
