'use strict';

const clean = require('./clean');

const PACKAGES_PATH = 'packages/';

// Add names of packages to clean.
const packages = ['psiagram', 'psiagram-plugin-mouse-events'];

const paths = packages.map(packageName => PACKAGES_PATH + packageName + '/lib');

clean('Cleaning Builds', paths);
