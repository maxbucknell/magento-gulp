/**
 * Stream processing.
 */
const through = require('through2');

module.exports = wrapRequireJsConfig;

/**
 * Wrap the config file in a closure and pass it as config.
 */
function wrapRequireJsConfig () {
  function process (file, encoding, cb) {
    if (file.isNull() || file.isStream()) {
      return cb();
    }

    const contents = file.contents.toString();

    const newContents = `
(function() {
  // Made by Max.
  ${contents}
  require.config(config);
})();  
    `;

    file.contents = Buffer.from(newContents);

    this.push(file);

    cb();
  }
  return through.obj(process);
}
