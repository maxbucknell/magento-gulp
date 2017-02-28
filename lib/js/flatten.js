const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const glob = require('glob');
const mkdirp = require('mkdirp');

const getThemeData = require('./get-theme-data');
const getModules = require('./get-modules');

module.exports = function flattenThemeHierarchy(config) {
  const theme = config.theme;
  const themeData = getThemeData();
  const themeHierarchy = calculateThemeHierarchy(theme, themeData);
  const modules = getModules();

  const pathMaps = [
    [path.join(config.baseDir, 'lib/web'), '/'],
    ..._.flatMap(modules, getModulesPathMap.bind(null, config)),
    ..._.flatMap(themeHierarchy, getThemePathMap.bind(null, config, Object.keys(modules), themeData)),
  ];

  const symlinks = _.fromPairs(_.flatMap(pathMaps, findFiles));

  _.forEach(symlinks, makeSymlink.bind(null, config, theme));
}

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

function getThemePathMap(config, modules, themes, theme) {
  return [
    [
      path.join(
        themes[theme].location,
        'web'
      ),
      '/'
    ],
    [
      path.join(
        themes[theme].location,
        `web/i18n/${config.locale}`
      ),
      '/'
    ],
    ..._.map(modules, (module) => [
      path.join(
        themes[theme].location,
        `${module}/web`
      ),
      `/${module}`
    ]),
    ..._.map(modules, (module) => [
      path.join(
        themes[theme].location,
        `web/i18n/${config.locale}/${module}`
      ),
      `/${module}`
    ]),
  ];
}

function getModulesPathMap(config, location, module) {
  return [
    [
      path.join(
        location,
        'view/base/web'
      ),
      `/${module}`
    ],
    [
      path.join(
        location,
        'view/frontend/web'
      ),
      `/${module}`
    ],
  ];
}

function findFiles(map) {
  const source = map[0];
  const dest = map[1];

  const results = glob.sync(
    '**/*',
    {
      cwd: source,
      nodir: true
    }
  );

  return _.map(results, (p) => [
    path.join(dest, p),
    path.join(source, p)
  ]);
}

function makeSymlink(config, theme, source, destination) {
  const target = path.join(
    config.baseDir,
    config.themeCache,
    theme,
    config.locale,
    destination
  );

  const targetDir = path.dirname(target);
  const relativeSource = path.relative(targetDir, source);

  mkdirp.sync(targetDir);
  fs.symlinkSync(relativeSource, target);
}
