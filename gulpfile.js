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
 * Source maps
 */
const sourcemaps = require('gulp-sourcemaps');

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
  string: ['locale', 'theme', 'area'],
  boolean: ['help'],
  default: {
    locale: 'en_US',
    theme: 'Magento/luma',
    area: 'frontend',
  },
};

const argv = minimist(process.argv.slice(1), options);

/**
 * Configuration helpers.
 */
const getBaseDir = require('./lib/js/get-base-dir');
const isRtl = require('./lib/js/is-rtl');

/**
 * Gulp configuration.
 *
 * Pass certain environment configuration through the build system,
 * including:
 *
 *  - The Magento 2 root directory.
 *  - The location of intermediate build artefacts.
 *  - The locale, theme, and area currently under compilation.
 *  - Whether or not we should render right to left styles.
 */
const config = {
  baseDir: getBaseDir(__dirname),
  buildDir: 'var/redbox/flat',
  locale: argv.locale,
  theme: argv.theme,
  area: argv.area,
  rtl: isRtl(argv.locale),
};

/**
 * Flattened static directory.
 *
 * This is stored in the cache directory, but indexed by theme and
 * locale, similar to pub/static.
 *
 * This is where we store the symlinked flattened theme hierarchy.
 */
const staticDir = path.join(
  config.baseDir,
  config.buildDir,
  'static',
  config.area,
  config.theme,
  config.locale
);

/**
 * Flattened templates directory.
 *
 * This is stored in the cache directory, and contains all templates
 * that can be rendered by the selected theme.
 *
 * This is similar to the templates in `var/view_preprocessed`.
 */
const templateDir = path.join(
  config.baseDir,
  config.buildDir,
  'templates',
  config.area,
  config.theme,
  config.locale
);

const findStaticDirectories = require('./lib/js/find-static-directories');
const findFiles = require('./lib/js/find-files');
const generateSymlinks = require('./lib/js/generate-symlinks');

/**
 * Resolve the static asset theme hierarchy.
 *
 * This will give a flat directory of symlinks to source files representing
 * the "source" of the `pub/static` directory.
 *
 * It does this by collecting an ordered stream of directories reperesenting
 * the source directories in reverse order of prominence (that is to say, the
 * opposite of the order Magento will look in, so child theme at the end, and
 * `lib/web` at the beginning.
 *
 * These are globbed and symlinks are created. Identical files from later
 * directories will overwrite the previous file.
 */
gulp.task('flatten:static', function () {
  return gulp.src(config.baseDir)
    .pipe(findStaticDirectories(`${config.area}/${config.theme}`, config.locale))
    .pipe(findFiles())
    .pipe(generateSymlinks(staticDir));
});

/**
 * Clean theme cache.
 *
 * This will remove all the flattened theme source directories, and
 * start again.
 */
gulp.task('clean', function () {
  rimraf.sync(path.join(config.baseDir, config.buildDir));
});

/**
 * Catchall target.
 *
 * Copy all source files (most assets can be treated as-is, and then
 * compile stylesheets.
 */
gulp.task('deploy', ['copy', 'less', 'translations', 'requirejs-config']);

function getCopyBlobs () {
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
    'sass',
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

  return src;
}

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

  const src = getCopyBlobs();

  // Output directory.
  const dest = path.join(
    config.baseDir,
    'pub/static',
    config.area,
    config.theme,
    config.locale
  );

  return gulp.src(
    src,
    { cwd: staticDir }
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
    config.area,
    config.theme,
    config.locale,
    'css'
  );

  const maps = path.join(dest, 'maps');

  const postcssPlugins = [
    ...getRtlCss()
  ];

  return gulp.src(
    ['css/*.less', '!css/_*.less'],
    { cwd: staticDir }
  )
    .pipe(magentoImporter(path.join(staticDir, 'css')))
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(postcss(postcssPlugins))
    .pipe(sourcemaps.write('../maps/css'))
    .pipe(gulp.dest(dest));

  function getRtlCss() {
    if (config.rtl) {
      return [ rtlcss() ];
    }

    return [];
  }
});

/**
 * Find phrases in source files.
 */
const findPhrases = require('./lib/js/find-phrases');

/**
 * Translate a list of phrases.
 */
const buildTranslations = require('./lib/js/build-translations');

/**
 * Translations
 *
 * The Magento 2 front end has a system wherein phrases are pulled out of
 * static view files by regular expressions. These phrases are then translated
 * and poured into a JSON file.
 *
 * This is in contrast to Magento 1, where translatable phrases on the front
 * end had to be separately maintained inside an XML file.
 */
gulp.task('translations', function () {
  const dest = path.join(
    config.baseDir,
    'pub/static',
    config.area,
    config.theme,
    config.locale
  );

  return gulp.src(['**/*.js', '**/*.html'], { cwd: staticDir })
    .pipe(findPhrases())
    .pipe(buildTranslations(config))
    .pipe(gulp.dest(dest));
});

const findRequireJsConfigFiles = require('./lib/js/find-require-js-config-files');
const wrapRequireJsConfig = require('./lib/js/wrap-require-js-config');
const concat = require('gulp-concat');

/**
 * requirejs configuration.
 *
 * magento modules and themes allow configuration of amd modules inside files
 * named `requirejs-config.js`. these are collected, and merged, and stored in
 * a single file.
 */
gulp.task('requirejs-config', function () {
  const dest = path.join(
    config.baseDir,
    'pub/static/_requirejs',
    config.area,
    config.theme,
    config.locale
  );

  return gulp.src(config.baseDir)
    .pipe(findRequireJsConfigFiles(`${config.area}/${config.theme}`))
    .pipe(wrapRequireJsConfig())
    .pipe(concat('requirejs-config.js'))
    .pipe(gulp.dest(dest));
})

/**
 * Watching.
 *
 * Conditionally rebuild files as quickly as possible when they change.
 */
gulp.task('watch:static', function () {
  gulp.watch(
    ['**/*.less'],
    { cwd: staticDir },
    ['less']
  );

  gulp.watch(
    ['**/*.js', '**/*.html'],
    { cwd: staticDir },
    ['translations']
  );

  return gulp.watch(
    getCopyBlobs(),
    { cwd: staticDir },
    ['copy']
  );
});
