/** effect values:
 * - "close" - closes the modal
 * - any other string - attempts to find the modal with that ID and displays it
 * - modal object - displays that modal
 * - function - runs the function
 */
class Option {
  constructor(text, effect, classes) {
    this.text = text;
    this.effect = effect;
    this.classes = classes;
  }
}
