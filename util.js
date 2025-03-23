function shuffle(array) {
  for (let i = 0; i < array.length; i++) {
    let randomIndex = Math.floor(Math.random() * array.length);
    [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
  }
  return array;
}

///////////////////////////////////////////////////////////////////////////////

// min is inclusive; max is exclusive
function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

function randomIndex(array) {
  return Math.floor(Math.random() * array.length);
}

function randomElement(array) {
  return array[randomIndex(array)];
}

// Look, okay, JavaScript doesn't natively allow you to seed random numbers, and this is not worth building a custom RNG for, so if you find this and use it to rig your rolls, good for you
function randomElementSeeded(array, seed) {
  return array[seed % array.length];
}

///////////////////////////////////////////////////////////////////////////////

Object.defineProperty(String.prototype, "toTitleCase", {
  value: function (param) {
    return this.replace(
      /\w\S*/g,
      (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
  },
});

///////////////////////////////////////////////////////////////////////////////

async function wait(ms) {
  await new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}
