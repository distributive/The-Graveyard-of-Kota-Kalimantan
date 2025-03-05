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
    if (!Serialisation.loadSetting("returning")) {
      await new Modal(null, {
        header: "Notice",
        body: "This game uses local storage to automatically save your progress.",
        options: [new Option("", "Accept")],
        allowKeyboard: false,
        size: "lg",
      }).display();
      Serialisation.saveSetting("returning", true);
    }
    Menu.showMainMenu();
  }
});
