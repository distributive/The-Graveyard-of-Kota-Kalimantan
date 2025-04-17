let ending_i = 0;
const ENDING_SKIP_GAME = ending_i++;
const ENDING_BAD_ACT_ONE = ending_i++;
const ENDING_BAD_ACT_TWO = ending_i++;
const ENDING_BAD_ACT_THREE = ending_i++;
const ENDING_NEUTRAL = ending_i++;
const ENDING_GOOD = ending_i++;

///////////////////////////////////////////////////////////////////////////////

class Ending {
  static show(ending, resetProgress = true) {
    Audio.fadeOutMusic(1000);
    $("#ending-window").removeClass("show");
    $("#ending-text-box").removeClass("show");
    $("#ending-text-box").empty();

    // Story
    let text = "";
    switch (ending) {
      case ENDING_SKIP_GAME:
        text = ENDING_SKIP_GAME_TEXT;
        break;
      case ENDING_BAD_ACT_ONE:
        text = ENDING_BAD_ACT_ONE_TEXT;
        break;
      case ENDING_BAD_ACT_TWO:
        text = ENDING_BAD_ACT_TWO_TEXT;
        break;
      case ENDING_BAD_ACT_THREE:
        text = ENDING_BAD_ACT_THREE_TEXT;
        break;
      case ENDING_NEUTRAL:
        text = ENDING_NEUTRAL_TEXT;
        break;
      case ENDING_GOOD:
        text = ENDING_GOOD_TEXT;
        break;
    }
    text = text.replace(
      "{image}",
      `<div class="ending-image-container"><img class="ending-image" src="img/card/back/anarch.png" /></div>`
    );
    $("#ending-text-box").html(text);
    $("#ending-window").scrollTop(0);
    setTimeout(function () {
      $("#ending-window").scrollTop(0);
    }, 500);

    // Back button
    const button = $(`
      <div class="position-relative w-100">
        <div id="ending-options" class="modal-options w-100">
          <button class="modal-option">Return to menu</button>
        </div>
      </div>
    `);
    button.find("#ending-options").fadeOut(1);
    $("#ending-text-box").append(button);
    button.on("click", function () {
      $("#ending-window").removeClass("show");
      $("#ending-text-box").removeClass("show");
      $("#ending-text-box").empty();
      Audio.playEffect(AUDIO_CLICK);
      Menu.showMainMenu();
    });

    // Card reveal
    setTimeout(function () {
      $("#ending-window").addClass("show");
    }, 1);
    setTimeout(function () {
      $("#ending-text-box").addClass("show");
    }, 1000);
    let debounce = false;
    setTimeout(function () {
      $(".ending-image").addClass("face-down");
      $(".ending-image-container")
        .on("mouseenter", function () {
          if (!debounce) {
            Audio.playEffect(AUDIO_FLICK_0);
          }
        })
        .on("click", async function () {
          if (debounce) {
            return;
          }
          debounce = true;
          Audio.playEffect(AUDIO_FLICK_5);
          $(this)
            .find(".ending-image")
            .addClass("flipping")
            .removeClass("face-down");
          await wait(1500);
          $(this)
            .find(".ending-image")
            .removeClass("flipping")
            .attr("src", "img/game/scoop.png");
          // Wipe save once they interact with the scoop
          if (resetProgress) {
            Serialisation.deleteSave();
          }
          // Show menu button
          await wait(3000);
          button.find("#ending-options").fadeIn(3000);
        });
    }, 5000);
  }
}

///////////////////////////////////////////////////////////////////////////////

const ENDING_SKIP_GAME_TEXT = `
<p>You turn off your PAD, ignoring the job. You don’t need to waste time with such frivolities.</p>
<p>The next morning, someone is at your door. They sheepishly introduce themselves as the client of the job you rejected last night.</p>
<p><em>"We were really counting on you to show up. The whole building had been prepared and everything. We were there all night waiting. I was told to give you this."</em></p>
<p class="mb-0">They hand you a business card, and you turn it over to see the latest Anarch killer from the hit card game Netrunner.</p>
<br>
{image}
<br>
<p>This is the canon ending.</p>
`;

///////////////////////////////////////////////////////////////////////////////

const ENDING_BAD_ACT_ONE_TEXT = `
<p>Oh, uh. You died in the first act? I guess a rat bit you or something. That sucks.</p>
<p class="mb-0">Here’s a scoop.</p>
<br>
{image}
`;

///////////////////////////////////////////////////////////////////////////////

const ENDING_BAD_ACT_TWO_TEXT = `
<p>Oh, uh. You died in the second act? I guess a rat bit you or something. That sucks.</p>
<p class="mb-0">Here’s a scoop.</p>
<br>
{image}
`;

///////////////////////////////////////////////////////////////////////////////

const ENDING_BAD_ACT_THREE_TEXT = `
<p>Everything goes dark.</p>
<p>No, not dark. Your brain was overloaded with signals and shut off. Slowly, your vision returns. But it’s not vision as you know it.</p>
<p>You can see the network of tunnels in netspace you previously occupied. You also see the abandoned hallway where this started. You see all the rooms in that building. Your vision occupies a three-dimensional space, spilling into each open area.</p>
<p>You look around, but your line of sight is now a sphere stretching out forever in every direction. You can look up, down, left, right, side-to-side, and inwards. As you do, you see your skin, then muscles, then skeleton pop into view. You see your entire body and all its layers all as one. You feel your body and its total essence fill out to fill the new dimension you occupy. No longer are you a single form, but part of a greater whole. A whole that is greater in size than anything you could have previously imagined.</p>
<p>Shadows form volumes you can walk around. You can peer behind the world to see every space, every moment, all as one. You scream, but your voice is trapped in a body you can no longer hear.</p>
<br>
<p>And suddenly. It stops.</p>
<br>
<p>You fall to your knees and look around. You feel the cool evening breeze and breathe in a cloud of dust as you reach around to find your bearings, kicking the particles into the air. You’re back in the real world now, but it looks wrong.</p>
<p>Your vision is flat, like a PAD screen. You reach out your hands to grab it and flail feebly into the empty space in front of you.</p>
<p>Without moving, you try to look behind the room you are in, but walls block what just a moment ago you could trivially see.</p>
<p>You feel blind. The world feels like a line. Your mind tells you your body occupies no space at all and yet as you try to stand, you are unable to support this flimsy form.</p>
<br>
<p>Hours or days later, someone finds you curled up on the floor. The same floor where you awoke from an irrelevant amount of time ago. As they try to raise you to your feet, you mutter something illegible.</p>
<p class="mb-0">On the floor surrounding the space they found you are scrawlings of lines and shapes. Spheres within spheres and spiderwebs and spirals. In the centre of it all: a figure, pointing. Your mind is no longer your own. You brought someone back with you.</p>
<br>
<br>
{image}
`;

///////////////////////////////////////////////////////////////////////////////

const ENDING_NEUTRAL_TEXT = `
<p>You run, and hide, and run, and hide, and run, and hide. You know how to jack out, you’ve done it a million times. You executed the command on instinct the moment she arrived. And yet you’re still here, in her domain, where time moves at whatever pace she chooses. And she’s here too, careening towards you faster than your avatar could dream of, teeth bared, hair parting, eyes burning with insatiable hunger.</p>
<p>You drop to your knees. You always figured you’d die on your feet.</p>
<br>
<p>And then you’re back. In your physical body, in your apartment, in Kota Kalimantan, at the foot of the last great space elevator. As you wiggle your fingers and toes, reacclimatising to meatspace, a smell that you can’t place fills your nose. Your vision slides back into focus. A wilted purple flower lies on your chest.</p>
<br>
<p>You see her every night in your dreams. Those eyes, those terrible eyes she conceals under all that matted hair, stay with you through each waking moment. It’s almost enough to make you want to go back. After all, you got out once. What’s one more visit?</p>
<p>No. You’ve toiled, sacrificed, rode your luck and committed an unspeakable act or two to build this life for yourself. You’re not going to throw it all away for some ghost in your computer. And yet, those eyes…</p>
<p>Your solution is an elegant one. Using some of your ill-gotten gains you reach out to a whole host of specialists in your network. Netchitects, codeweavers, circuit breakers and the like. You’re careful to give each of them just a piece of the full picture, lest they catch on to what you’re doing and try to take her for themselves.</p>
<br>
<p>One month later you receive a ping from your renderboy. It’s done. An almost perfect replica of the real thing, primed to tear through corpo defenses like she tore through your mind.</p>
<p>Almost perfect. They couldn’t get the eyes right. How could they, unless they had seen what you’ve seen?</p>
<br>
<p>Over time your fixation recedes, buried under the waves of upheaval and opportunity that each fresh day in Kota Kalimantan brings. But you know, deep down, that a day will come when you will meet her again.</p>
<br>
<br>
{image}
`;

///////////////////////////////////////////////////////////////////////////////

const ENDING_GOOD_TEXT = `
<p>You rain blow after blow down upon the hantu, undeterred by its gruesome appearance and wicked strength. You don’t care how many punches it takes. You’re getting out of here alive.</p>
<p>You’re down. One swipe of her hand and you’ve turned from assailant to prey, head hitting the cold hard cybercrete. An awful shrill sound — a scream? a laugh?— rings through your ears, and you roll onto your side to buy the smallest amount of distance. It starts to hit you that after everything you’ve been through you’re going to meet your end here, in a netspace warehouse, at the hands of a ghost. You wonder if the other victims felt as stupid as you do right now.</p>
<p>And then you spot it. A few feet away, glowing at your eye level, an object, tiny, flickering in and out of existence. A glitch? Out of options, you pull yourself towards the shimmer, the creature bearing down on you. As it bares its fangs you stretch out your arm and close your hand around the anomaly.
<p>It’s sharp. That’s something.</p>
<p>It’s on top of you now, pinning you, teeth closing in. You dig deep, and plunge the object into her neck.</p>
<br>
<p>You thought you’d heard the worst of her screams. How wrong you were. This wail, like a thousand dying birds falling from the sky, is almost enough to make you drop your weapon. The harder you push down the more dreadful it becomes. As the scream grows the room starts to fill with a blinding light. You close your eyes, ready for it all to end, then-</p>
<br>
<p>The light fades. You’re back in the warehouse, or at least what you thought was one, and you’re not alone. A humanoid figure in a white dress lies crumpled in a heap next to you, nail sticking from their neck. She rises, far slower than before, diminished somehow. She doesn’t attack. She looks to you inquisitively, as if awaiting instruction. You beckon her toward the exit.</p>
<br>
<p>No follow-up communication from your client ever comes. Who were they? A rival runner playing a prank? A creative sysop looking to make a name for themselves by taking out a leading light of the Kota Kalimantan underground? A cyber-cultist trying to keep their pet ghoul fed? Whatever. You brought something far more valuable than credits back with you.</p>
<p>It doesn’t take much rejigging to turn the code you pulled from that place into something useful. The next time you go into battle against those who run the world you’ll have something from beyond the world at your side.</p>
<br>
<p>Over time the hantu, or what’s left of it, proves a deadly tool in your arsenal. You’ve coded a leash for it with just the right amount of slack, one which gives it enough freedom to tear through your adversaries but not enough to tear through you. This program might be capable of even more if unshackled, but for once in your life you err on the side of caution. You’ve seen the gashes she’s left in the ice you put her up against. You’ve felt the heat from her eyes, the fury you imagine she would love to direct at her captor if given half a chance.</p>
<p>A part of you wonders whether you’re tempting fate. Whether this net-demon has the capacity to hold a grudge, to overcome her programming and take revenge on the runner who tore her from her realm. But you need all the power you can get your hands on. The stakes are far too high for you to let a strength this potent go to waste.</p>
<p>Plus, she had it coming. Nobody kills your favourite flower and comes out unscathed.</p>
<br>
<br>
{image}
`;
