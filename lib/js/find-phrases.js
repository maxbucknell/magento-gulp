/**
 * Lodash. Obviously.
 */
const _ = require('lodash');

/**
 * Stream processing.
 */
const through = require('through2');

/**
 * Virtual file creation
 */
const Vinyl = require('vinyl');

module.exports = findPhrases;

/**
 * Find translatable phrases inside static assets.
 *
 * Given a stream of static assets, find all phrases and emit a stream of
 * phrases. Phrases are de-duplicated and emitted as Vinyl objects.
 *
 * Phrases are matched on patterns based on Magento's.
 */
function findPhrases () {
  const patterns = [
    /\$t\((['"])(.+)\1\)/, // $t('hello, world')
    /\$\.mage\.__\((['"])(.+)\1\)/, // $.mage.__('hello, world')
    /translate=("')([^']+)'"/, // translate="'hello, world'"
    /i18n:\s*(['"])(.+)\1/, // i18n: 'hello, world'
  ];

  let phrases = [];

  function process (file, encoding, cb) {
    if (file.isNull()) {
      return cb();
    }

    _.each(
      patterns,
      _.partial(findPhrasesForPattern, phrases, file)
    );

    cb();
  }

  function finish (cb) {
    _.uniq(phrases).forEach((phrase) => this.push(phrase));
    cb();
  }

  function findPhrasesForPattern (phrases, file, pattern) {
    const contents = file.contents.toString();
    const matches = contents.match(new RegExp(pattern, 'g'));

    if (!matches) {
      return;
    }

    matches.map(extractPhrase).forEach(pushPhrase);

    function extractPhrase (match) {
      return match.match(pattern)[2];
    }

    function pushPhrase (phrase) {
      phrases.push(new Vinyl({
        contents: Buffer.from(phrase),
        path: '/'
      }));
    }
  }

  return through.obj(process, finish);
};
