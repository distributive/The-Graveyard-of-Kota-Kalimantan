function animate(obj, timeout = 100) {
  obj.addClass("animate");
  setTimeout(function () {
    obj.removeClass("animate");
  }, timeout);
}

function animateTurnBanner(side) {
  let isCorp = side == "corp";
  let obj = isCorp ? $("#corp-turn-banner") : $("#runner-turn-banner");
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
