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
AUDIO_ROLL_0 = "./audio/roll0.mp3";
AUDIO_ROLL_1 = "./audio/roll1.mp3";
AUDIO_ROLLS = [AUDIO_ROLL_0, AUDIO_ROLL_1];

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

AUDIO_VOICE_0 = "./audio/voice0.mp3";
AUDIO_VOICE_1 = "./audio/voice1.mp3";
AUDIO_VOICES = [AUDIO_VOICE_0, AUDIO_VOICE_1];

AUDIO_VOICE_SAD_0 = "./audio/voiceSad0.mp3";
AUDIO_VOICE_SAD_1 = "./audio/voiceSad1.mp3";
AUDIO_VOICES_SAD = [AUDIO_VOICE_SAD_0, AUDIO_VOICE_SAD_1];

///////////////////////////////////////////////////////////////////////////////

class Audio {
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

  static toggleMusic() {
    Serialisation.saveSetting("music-muted", !this.musicMuted);
    this.#audioMusic.muted = this.musicMuted;
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
    Audio.playMusic(AUDIO_TRACK_TEST);
  });
  $("body").on("click", "button", function () {
    if (!Audio.buttonsMuted) {
      Audio.playEffect(AUDIO_CLICK, true);
    }
  });
});
