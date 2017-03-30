const fs = require('fs');
const path = require('path');
const through = require('through2');
const _ = require('lodash');
const gulpUtil = require('gulp-util');

const PluginError = gulpUtil.PluginError;
const getModules = require('./get-modules');

module.exports = magentoImporter;

/**
 * Process @magento_import directives.
 *
 * Magento LESS files have a wildcard importer to import all module stylesheet
 * files. This doesn't work by default in LESS, so we have to compile it
 * separately.
 *
 * We grep for the pattern, then we find all possible stylesheets matching those
 * parameters, and replace the directive with stock @imports.
 */
function magentoImporter(cwd) {
  function process(file, encoding, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new PluginError('gulp-less', 'Streaming not supported'));
    }

    const str = file.contents.toString();

    const result = str.replace(
      /\/\/@magento_import '(.*)';/g,
      function flattenImport(match, include) {
        const modules = Object.keys(getModules());
        const includes =  _.chain(modules)
          .map((module) => `../${module}/css/${include}`)
          .filter((fn) => fs.existsSync(path.join(cwd, fn)))
          .map((fn) => `@import '${fn}';`)
          .value();

        const files = [];

        if (fs.existsSync(path.join(cwd, include))) {
          files.push(`@import '${include}';`);
        }

        return [
          ...includes,
          ...files,
        ].join('\n');
      }
    );

    file.contents = Buffer.from(result);

    return cb(null, file);
  }

  return through.obj(process);
}
