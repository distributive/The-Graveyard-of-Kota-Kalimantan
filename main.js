$(document).ready(function () {
  Location.resetMapOffset();
  Location.resetZoom();
  Stats.clicks = 0;

  const l0 = new Location(0, 0).setCurrentLocation();
  const l1 = new Location(0, 1);
  const l2 = new Location(1, 0);
  const l3 = new Location(0, -1);
  const l4 = new Location(-1, 0);

  const l5 = new Location(2, 0.5);
  const l6 = new Location(2, -0.5);
  const l7 = new Location(-2, 0.5);
  const l8 = new Location(-2, -0.5);

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

  let headerB = "Modal B";
  let bodyB = "The next modal.";
  let optionsB = [new Option("Close", "close")];
  let modalB = new Modal("b", headerB, bodyB, optionsB);

  let headerA = "Modal A";
  let bodyA = "This is a test modal.<br>Test<br>Test<br>Test";
  let optionsA = [
    new Option("Next", "b"),
    new Option("Next", modalB),
    new Option("Alert", function () {
      alert("!");
    }),
    new Option("Close", "close"),
  ];
  let modalA = new Modal("a", headerA, bodyA, optionsA);
  // modalA.display();

  let xs = [];
  for (let i = 0; i < 45; i++) {
    xs.push(0);
  }
  Cards.addToStack(xs);

  Cards.draw(3);
  Cards.install();
  Cards.install();
  Cards.install();
});
