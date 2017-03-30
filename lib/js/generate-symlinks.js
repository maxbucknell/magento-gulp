/**
 * Make directories before we put stuff in them.
 */
const mkdirp = require('mkdirp');

/**
 * Path manipulation.
 */
const path = require('path');

/**
 * For making symlinks
 */
const fs = require('fs');

/**
 * Stream management.
 */
const through = require('through2');

module.exports = generateSymlinks;

function generateSymlinks (staticDir) {
  function process (file, encoding, cb) {
    const origin = file.path;
    const link = path.join(staticDir, file.staticLocation)

    const linkDir = path.dirname(link);
    const relativeOriginLocation = path.relative(linkDir, origin);

    mkdirp(linkDir, function (err) {
      if (err) cb(err);
      fs.symlink(
        relativeOriginLocation,
        link,
        function (err) {
          if (err) {
            // delete and retry
            fs.unlink(link, function (err) {
              if (err) cb(err);
              fs.symlink(relativeOriginLocation, link, cb);
            })
          }

          cb();
        });
    });
  }

  return through.obj(process);
}
