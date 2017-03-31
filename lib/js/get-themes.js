/**
 * Lodash. Obviously.
 */
const _ = require('lodash');

/**
 * Calling PHP.
 */
const spawnSync = require('child_process').spawnSync

/**
 * Path manipulation.
 */
const path = require('path');

module.exports = getThemes;

/**
 * Return an array of folders representing themes,from parent to child.
 *
 * Given a theme identifier (e.g. frontend/Magento/blank), it will give the
 * location of all themes that are parents of it, in tho order they need to
 * be rendered.
 */
function getThemes (childThemeIdentifier) {
  const allThemes = getAllThemes();
  const hierarchy = calculateThemeHierarchy(childThemeIdentifier, allThemes);

  return _.map(hierarchy, function (themeIdentifier) {
    return allThemes[themeIdentifier];
  });
}

let allThemes = null;

/**
 * Collect all themes from Magento.
 */
function getAllThemes () {
  if (!allThemes) {
    const process = spawnSync(
      'php',
      [`${path.dirname(__dirname)}/php/get_themes.php`]
    );

    allThemes = JSON.parse(process.stdout.toString());
  }

  return allThemes;
};

/**
 * Given a theme identifier, and list of themes, calculate the hierarchy.
 *
 * Returns an array of themes, from parent to child.
 *
 * @param theme
 * @param themes
 * @returns {*}
 */
function calculateThemeHierarchy(theme, themes) {
  if (theme === null) {
    return [];
  }

  return [
    ...calculateThemeHierarchy(
      themes[theme].parent,
      themes
    ),
    theme
  ];
}
