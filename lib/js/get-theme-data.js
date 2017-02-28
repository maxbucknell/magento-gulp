const spawnSync = require('child_process').spawnSync
const dirname = require('path').dirname;

module.exports = function getThemeData (theme) {
  const process = spawnSync(
    'php',
    [`${dirname(__dirname)}/php/get_themes.php`]
  );

  return JSON.parse(process.stdout.toString());
};
