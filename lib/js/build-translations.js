const _ = require('lodash');
const through = require('through2');
const Vinyl = require('vinyl');
const getTranslationDictionary = require('./get-translation-dictionary');

module.exports = function (config) {
  const backendDictionary = getTranslationDictionary(config);
  const frontendDictionary = {};

  function process (file, encoding, cb) {
    const phrase = file.contents.toString();
    const translation = backendDictionary[phrase]

    if (translation) {
      frontendDictionary[phrase] = translation;
    }

    cb();
  }

  function finish (cb) {
    this.push(new Vinyl({
      contents: Buffer.from(JSON.stringify(frontendDictionary)),
      path: 'js-translation.json'
    }));

    cb();
  }

  return through.obj(process, finish);
}
