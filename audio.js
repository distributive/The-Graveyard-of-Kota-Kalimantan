AUDIO_TRACK_TEST = "./audio/temp.mp3";

AUDIO_CREDIT = "./audio/credit.mp3";

AUDIO_DRAW = "./audio/draw.mp3";
AUDIO_SHUFFLE = "./audio/shuffle.mp3";
AUDIO_PLAY = "./audio/play.mp3";
AUDIO_TRASH = "./audio/trash.mp3";

AUDIO_MOVE_MEATSPACE = "./audio/walk_inside.mp3";
AUDIO_MOVE_NETSPACE = "./audio/walk_netspace.mp3";
AUDIO_MOVE_OUTSIDE = "./audio/walk_outside.mp3";

AUDIO_SUCCESS = "./audio/success.mp3";
AUDIO_FAIL = "./audio/fail.mp3";

AUDIO_ATTACK = "./audio/attack.mp3";
AUDIO_ATTACK_RAT = "./audio/ratAttack.mp3";
AUDIO_ATTACK_ARROW = "./audio/arrowAttack.mp3";
AUDIO_ATTACK_BIRD = "./audio/birdAttack.mp3";
AUDIO_ATTACK_BOSS = "./audio/bossAttack.mp3";
AUDIO_ATTACK_BUG = "./audio/bugAttack.mp3";
AUDIO_ATTACK_DESIGNER = "./audio/designerAttack.mp3";
AUDIO_ATTACK_SPIDER = "./audio/spiderAttack.mp3";

AUDIO_DEATH_BOSS = "./audio/bossDeath.mp3";

AUDIO_PAIN = "./audio/pain.mp3";
AUDIO_DEATH = "./audio/death.mp3";

AUDIO_CLICK = "./audio/click.mp3";
AUDIO_CHARACTER_SELECT = "./audio/characterSelect.mp3";

///////////////////////////////////////////////////////////////////////////////

class Audio {
  static #audioMusic;
  static #musicMuted;
  static #sfxMuted;

  static playMusic(track, loop = true) {
    // Cancel previous track
    this.stopMusic();

    // Play new track
    this.#audioMusic = document.createElement("audio");
    this.#audioMusic.setAttribute("src", track);
    this.#audioMusic.muted = this.#musicMuted;
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

  static playEffect(effect) {
    if (this.#sfxMuted) {
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

  static toggleMusic() {
    this.#musicMuted = !this.#musicMuted;
    this.#audioMusic.muted = this.#musicMuted;
  }
  static toggleSfx() {
    this.#sfxMuted = !this.#sfxMuted;
  }

  static get musicMuted() {
    return this.#musicMuted;
  }
  static get sfxMuted() {
    return this.#sfxMuted;
  }

  static serialise() {
    return {
      music: this.#musicMuted,
      sfx: this.#sfxMuted,
    };
  }
  static deserialise(json) {
    this.#musicMuted = json.music;
    this.#sfxMuted = json.sfx;
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
    Audio.playMusic(AUDIO_TRACK_TEST);
  });
  $("html").on("click", "button", function () {
    console.log("!");
    Audio.playEffect(AUDIO_CLICK);
  });
});
