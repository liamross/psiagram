'use strict';

const clean = require('./clean');

// Add paths to items you wish to remove.
const paths = ['coverage', '.cache'];

clean('Cleaning caches and test files', paths);
