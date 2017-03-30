const findParentDir = require('find-parent-dir');

/**
 * Find the root directory of the Magento 2 installation.
 */
function main (location) {
  return findParentDir.sync(location, 'bin/magento');
}

module.exports = main;
