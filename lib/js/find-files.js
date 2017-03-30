/**
 * Lodash. Obviously.
 */
const _ = require('lodash');

/**
 * Stream manipulation.
 */
const through = require('through2');

/**
 * Globbing
 */
const glob = require('glob');

/**
 * Path manipulation.
 */
const path = require('path');

/**
 * File objects.
 */
const Vinyl = require('vinyl');

module.exports = findFiles;

/**
 * Given a stream of directories, find all source files.
 *
 * Rather than publish a file each time we find it, we add it to an index and
 * publish them all at the end. The reason for this is that there are source
 * files that have the same public path, but are in different locations. Only
 * one of these can be actually used, we iterate through each directory in the
 * order of precedence.
 */
function findFiles () {
  const files = {};

  function process(file, encoding, cb) {
    const directory = file.path;
    const buildDir = file.buildDir;

    glob(
      '**/*',
      { cwd: directory, nodir: true },
      function (err, matches) {
        _.each(matches, function (match) {
          const staticLocation = path.join(buildDir, match);
          files[staticLocation] = new Vinyl({
            path: path.join(directory, match),
            staticLocation,
          });
        });

        cb();
      }
    );
  }

  function finish (cb) {
    const filesList = _.values(files);

    _.each(filesList, function (file) {
      this.push(file);
    }.bind(this))

    cb();
  }

  return through.obj(process, finish);
}
