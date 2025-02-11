$(document).ready(function () {
  Broadcast.disable();

  Location.resetMapOffset();
  Location.resetZoom();

  const l0 = new Location(LocationEntrance, 0, 0).setCurrentLocation(true);
  const l1 = new Location(LocationUnknownNet, 0, 1);
  const l2 = new Location(LocationUnknownNet, 1, 0);
  const l3 = new Location(LocationUnknownNet, 0, -1);
  const l4 = new Location(LocationUnknownNet, -1, 0);

  // const l5 = new Location(LocationUnknownNet, 2, 0.5);
  // const l6 = new Location(LocationUnknownNet, 2, -0.5);
  // const l7 = new Location(LocationUnknownNet, -2, 0.5);
  // const l8 = new Location(LocationUnknownNet, -2, -0.5);

  l0.addNeighbour(l1);
  l0.addNeighbour(l2);
  l0.addNeighbour(l3);
  l0.addNeighbour(l4);

  // l1.addNeighbour(l2);
  // l2.addNeighbour(l3);
  // l3.addNeighbour(l4);
  // l4.addNeighbour(l1);

  // l2.addNeighbour(l5);
  // l2.addNeighbour(l6);
  // l4.addNeighbour(l7);
  // l4.addNeighbour(l8);

  // let enemy = await Enemy.spawn(EnemyExample, l5);
  // await Enemy.spawn(EnemyExample, l5).setDamage(1);
  // await Enemy.spawn(EnemyExample, l0).setDamage(1);
  // setTimeout(() => enemy.moveTo(l2), 1 * 800);
  // setTimeout(() => enemy.moveTo(l0), 2 * 800);
  // setTimeout(() => enemy.moveTo(l4), 3 * 800);
  // setTimeout(() => enemy.moveTo(l8), 4 * 800);

  Broadcast.enable();

  Game.initGameState();
  setTimeout(function () {
    Game.startTurn();
  }, 500);
});
