const spawnSync = require('child_process').spawnSync
const dirname = require('path').dirname;

module.exports = getTranslationDictionary;

let translationDictionary = null;

/**
 * Get entire translation dictionary from Magento.
 */
function getTranslationDictionary (config) {
  if (!translationDictionary) {
    const process = spawnSync(
      'php',
      [
        `${dirname(__dirname)}/php/get_translation_dictionary.php`,
        `${config.area}/${config.theme}`,
        config.locale
      ]
    );

    translationDictionary = JSON.parse(process.stdout.toString());
  }

  return translationDictionary;
};
