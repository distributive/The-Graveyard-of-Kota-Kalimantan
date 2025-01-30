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

///////////////////////////////////////////////////////////////////////////////

async function wait(ms) {
  await new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}
