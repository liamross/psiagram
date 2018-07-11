'use strict';

const clean = require('./clean');

const PACKAGES_PATH = 'packages/';

// Add names of packages to clean.
const packages = [
  'psiagram',
  'psiagram-plugin-grid',
  'psiagram-plugin-mouse-events',
  'psiagram-plugin-routing',
];

const paths = packages.map(packageName => PACKAGES_PATH + packageName + '/lib');

clean('Cleaning Builds', paths);
