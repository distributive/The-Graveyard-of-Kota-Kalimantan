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
  obj.addClass("animate-in");
  setTimeout(function () {
    obj.removeClass("animate-in").addClass("animate-out");
  }, 500);
  setTimeout(function () {
    obj.removeClass("animate-out");
    obj.hide();
  }, 700);
}
