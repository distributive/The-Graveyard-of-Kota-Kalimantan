$(document).ready(function () {
  Broadcast.disable();

  Location.resetMapOffset();
  Location.resetZoom();

  const l0 = new Location("room", 0, 0).setCurrentLocation(true);
  const l1 = new Location("room", 0, 1);
  const l2 = new Location("room", 1, 0);
  const l3 = new Location("room", 0, -1);
  const l4 = new Location("room", -1, 0);

  const l5 = new Location("room", 2, 0.5);
  const l6 = new Location("room", 2, -0.5);
  const l7 = new Location("room", -2, 0.5);
  const l8 = new Location("room", -2, -0.5);

  l0.addNeighbour(l1);
  l0.addNeighbour(l2);
  l0.addNeighbour(l3);
  l0.addNeighbour(l4);

  l1.addNeighbour(l2);
  l2.addNeighbour(l3);
  l3.addNeighbour(l4);
  l4.addNeighbour(l1);

  l2.addNeighbour(l5);
  l2.addNeighbour(l6);
  l4.addNeighbour(l7);
  l4.addNeighbour(l8);

  let enemy = new Enemy("example", l5);
  new Enemy("example", l5).setDamage(1);
  new Enemy("example", l0).setDamage(1);
  // setTimeout(() => enemy.moveTo(l2), 1 * 800);
  // setTimeout(() => enemy.moveTo(l0), 2 * 800);
  // setTimeout(() => enemy.moveTo(l4), 3 * 800);
  // setTimeout(() => enemy.moveTo(l8), 4 * 800);

  let headerB = "Modal B";
  let bodyB = "The next modal.";
  let optionsB = [new Option("close", "Close", "close")];
  let modalB = new Modal("b", headerB, bodyB, optionsB);

  let headerA = "Modal A";
  let bodyA = "This is a test modal.<br>Test<br>Test<br>Test";
  let optionsA = [
    new Option("nextString", "Next", "b"),
    new Option("nextReference", "Next", modalB),
    new Option("alert", "Alert", function () {
      alert("!");
    }),
    new Option("close", "Close", "close"),
  ];
  let modalA = new Modal("a", headerA, bodyA, optionsA);
  // modalA.display();

  Broadcast.enable();

  Game.initGameState();
  setTimeout(function () {
    Game.startTurn();
  }, 500);
});
