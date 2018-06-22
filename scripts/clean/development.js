'use strict';

const clean = require('./clean');

// Add paths to items you wish to remove.
const paths = ['.cache', 'dist'];

clean('Cleaning caches and development files', paths);
