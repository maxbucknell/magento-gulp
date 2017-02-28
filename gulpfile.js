/**
 * Standard Library
 */
const path = require('path');

/**
 * The star attraction.
 */
const gulp = require('gulp');

/**
 * Recursive deletion.
 */
const rimraf = require('rimraf');

/**
 * Lodash. Obviously.
 */
const _ = require('lodash');

/**
 * Stylesheets
 */
const less = require('gulp-less');

const postcss = require('gulp-postcss');
const rtlcss = require('rtlcss');

/**
 * Command line flag parsing.
 */
const minimist = require('minimist');

const options = {
  string: ['locale', 'theme'],
  default: {
    locale: 'en_US'
  },
};

const argv = minimist(process.argv.slice(1), options);

/**
 * Gulp configuration.
 *
 * Pass certain environment configuration through the build system,
 * including:
 *
 *  - The Magento 2 root directory.
 *  - The chosen cache directory for intermediate assets.
 *  - The theme and locale compilation targets.
 */
const config = {
  baseDir: path.dirname(__dirname),
  themeCache: 'var/redbox/flat/static',
  locale: argv.locale,
  theme: argv.theme,
  rtl: argv.locale.indexOf('ar') === 0,
};

/**
 * Flattened directory.
 *
 * This is stored in the cache directory, but indexed by theme and
 * locale, similar to pub/static.
 *
 * This is where we store the symlinked flattened theme hierarchy.
 */
const flatDir = path.join(
  config.baseDir,
  config.themeCache,
  config.theme,
  config.locale
);

/**
 * Resolve the theme hierarchy into one source directory.
 */
const flatten = require('./lib/js/flatten');
gulp.task('flatten', ['clean'], flatten.bind(null, config));

/**
 * Clean theme cache.
 *
 * This will remove all the flattened theme source directories, and
 * start again.
 */
gulp.task('clean', function () {
  rimraf.sync(path.join(config.baseDir, config.themeCache));
});

/**
 * Catchall target.
 *
 * Copy all source files (most assets can be treated as-is, and then
 * compile stylesheets.
 *
 * @todo JS processing
 */
gulp.task('deploy', ['copy', 'less']);

/**
 * Copy all source files.
 *
 * Most assets *can* be treated as they are, including JavaScript,
 * images, audio, and HTML partials.
 *
 * That's not to say they should, but it's not a hard dependency the
 * same way that stylesheets are. We will add appropriate processing for
 * all files.
 */
gulp.task('copy', function () {
  // Accepted static file types.
  const fileTypes = [
    'css',
    'csv',
    'eot',
    'gif',
    'htc',
    'htm',
    'html',
    'ico',
    'jbf',
    'jpg',
    'js',
    'json',
    'less',
    'map',
    'md',
    'png',
    'scss',
    'svg',
    'swf',
    'ttf',
    'txt',
    'woff',
    'woff2',
  ];

  // All possible globs.
  const src = _.map(fileTypes, (ext) => `**/*.${ext}`);

  // Output directory.
  const dest = path.join(
    config.baseDir,
    'pub/static',
    config.theme,
    config.locale
  );

  gulp.src(
    src,
    { cwd: flatDir }
  )
    .pipe(gulp.dest(dest));
});

/**
 * Resolve @magento_import
 *
 * Magento added a new LESS directive, @magento_import, which will look
 * in all module view directories for stylesheets, kind of like a smart
 * glob. This needs to be processed before being passed to LESS for
 * actual compilation.
 *
 * Behold, a custom gulp pipeline.
 */
const magentoImporter = require('./lib/js/magento-importer');

/**
 * Stylesheet compilation.
 */
gulp.task('less', function () {
  const dest = path.join(
    config.baseDir,
    'pub/static',
    config.theme,
    config.locale,
    'css'
  );

  const postcssPlugins = [
    ...getRtlCss()
  ];

  gulp.src(
    ['css/*.less', '!css/_*.less'],
    { cwd: flatDir }
  )
    .pipe(magentoImporter(path.join(flatDir, 'css')))
    .pipe(less())
    .pipe(postcss(postcssPlugins))
    .pipe(gulp.dest(dest));

  function getRtlCss() {
    if (config.rtl) {
      return [ rtlcss() ];
    }

    return [];
  }
});

/**
 * Watching.
 *
 * Conditionally rebuild files as quickly as possible when they change.
 */
gulp.task('watch', ['flatten', 'deploy'], function () {
  gulp.watch(
    path.join(
      flatDir,
      '**/*'
    ),
    function (e) {
      console.log(`Change of type "${e.type}" for file "${e.path}"`);
    }
  );
});

