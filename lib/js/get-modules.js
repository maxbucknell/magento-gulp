const spawnSync = require('child_process').spawnSync
const dirname = require('path').dirname;

let modules = null;

module.exports = function getModules () {
  if (!modules) {
    const process = spawnSync(
      'php',
      [`${dirname(__dirname)}/php/get_modules.php`]
    );

    modules = JSON.parse(process.stdout.toString());
  }

  return modules;
};
