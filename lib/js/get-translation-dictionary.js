const spawnSync = require('child_process').spawnSync
const dirname = require('path').dirname;

module.exports = getTranslationDictionary;

/**
 * Get entire translation dictionary from Magento.
 */
function getTranslationDictionary (config) {
  const process = spawnSync(
    'php',
    [
      `${dirname(__dirname)}/php/get_translation_dictionary.php`,
      `${config.area}/${config.theme}`,
      config.locale
    ]
  );

  const result = process.stdout.toString();
  return JSON.parse(result);
};
