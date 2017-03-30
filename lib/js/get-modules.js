const spawnSync = require('child_process').spawnSync
const dirname = require('path').dirname;

module.exports = function getModules () {
  const process = spawnSync(
    'php',
    [`${dirname(__dirname)}/php/get_modules.php`]
  );

  const result = process.stdout.toString();
  return JSON.parse(result);
};
