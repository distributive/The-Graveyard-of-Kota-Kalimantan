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
    setTimeout(function () {
      $("#ending-window").addClass("show");
    }, 1);
    setTimeout(function () {
      $("#ending-text-box").addClass("show");
    }, 1000);
    let debounce = false;
    setTimeout(function () {
      $(".ending-image").addClass("face-down");
      $(".ending-image-container").on("click", async function () {
        if (debounce) {
          return;
        }
        debounce = true;
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
<p class="mb-0">On the floor surrounding the space they found you are scrawlings of lines and shapes. Spheres within spheres and spiderwebs and spirals. In the centre of it all: a figure, pointing. Your mind no longer belongs to you, but it.</p>
<br>
<br>
{image}
`;

///////////////////////////////////////////////////////////////////////////////

const ENDING_NEUTRAL_TEXT = `
UNWRITTEN
<br>
<br>
{image}
`;

///////////////////////////////////////////////////////////////////////////////

const ENDING_GOOD_TEXT = `
UNWRITTEN
<br>
<br>
{image}
`;
