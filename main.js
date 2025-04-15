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
      // Warn mobile users against small screens
      if (
        window.matchMedia(
          "only screen and ((max-width: 991px) or (max-height: 699px))"
        ).matches
      ) {
        await new Modal({
          header: "Mobile devices",
          body: "This game is not supported for play on mobile devices or smaller monitors. Continue at your own risk.",
          options: [new Option("", "Continue")],
          allowKeyboard: false,
          size: "lg",
        }).display();
      }
      // Warn users of the ideal browser
      const isFirefox = typeof InstallTrigger !== "undefined";
      const isEdge = !!window.StyleMedia;
      const isChrome = /chrome/.test(navigator.userAgent.toLowerCase());
      if (!isFirefox && !isEdge && !isChrome) {
        await new Modal({
          header: "Browser",
          body: "This game was optimised for play in Chrome, Firefox, or Edge. It is recommended you play with one of these browsers if able.",
          options: [new Option("", "Continue")],
          allowKeyboard: false,
          size: "lg",
        }).display();
      }
      // Local storage disclaimer
      await new Modal({
        header: "Notice",
        body: "This game uses local storage to automatically save your progress.<br><br>You can delete all local data at any time in the Options menu.<br><br>If you encounter any issues while playing, you can refresh the page to reload the game, which may solve the problem.",
        options: [new Option("", "Accept")],
        allowKeyboard: false,
        size: "lg",
      }).display();
      // Warn user of content warnings
      await new Modal({
        header: "Content warnings",
        body: "This game has content warnings which can be viewed before or during the game in the 'About' section.",
        options: [new Option("", "Continue")],
        allowKeyboard: false,
        size: "lg",
      }).display();
      // Mark user as returning
      Serialisation.saveSetting("returning", true);
    }
    Menu.showMainMenu();
  }

  // Clean up noscript
  $("noscript").remove();
});
