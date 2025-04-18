const ANIMATED_JQUERY_OBJECTS = new Set();

function animate(jObj, timeout = 100) {
  if (ANIMATED_JQUERY_OBJECTS.has(jObj)) {
    return;
  }
  ANIMATED_JQUERY_OBJECTS.add(jObj);
  jObj.addClass("animate");
  setTimeout(function () {
    ANIMATED_JQUERY_OBJECTS.delete(jObj);
    jObj.removeClass("animate");
  }, timeout);
}

function animateTurnBanner(phase) {
  let obj =
    phase == "enemy"
      ? $("#enemy-turn-banner")
      : phase == "encounter"
      ? $("#encounter-turn-banner")
      : $("#runner-turn-banner");
  obj.show();
  setTimeout(function () {
    obj.addClass("animate-in");
  }, 1);
  setTimeout(function () {
    obj.removeClass("animate-in").addClass("animate-out");
  }, 1000);
  setTimeout(function () {
    obj.removeClass("animate-out");
    obj.hide();
  }, 1400);
}
