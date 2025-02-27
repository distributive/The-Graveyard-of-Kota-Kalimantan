$(document).ready(async function () {
  Location.resetMapOffset();
  Location.resetZoom();

  if (Serialisation.saveExists) {
    const success = await Serialisation.load();
    if (success) {
      Menu.hideMainBG(false);
    } else {
      Menu.showMainMenu();
    }
  } else {
    Menu.showMainMenu();
  }
});
