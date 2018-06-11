'use strict';

const rimraf = require('rimraf');

const errorFunction = (path, index) => err => {
  console.log('Number:', index);
  console.log('Deleting:', path);
  if (err) console.log('Error:', err);
  else console.log('Success!');
};

async function clean(title, paths) {
  console.log('===============================');
  console.log(title);
  console.log('-------------------------------');
  for (let path of paths) {
    const index = paths.indexOf(path);
    await rimraf(path, errorFunction(path, index + 1));
  }
}

module.exports = clean;
