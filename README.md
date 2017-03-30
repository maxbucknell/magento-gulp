# Redbox Gulp

A no-nonsense, compatibility oriented Gulp pipeline for front end development
with Magento 2.

By this, we mean that you don't have to change your code to use this. If you've
got a theme that works with `setup:static-content:deploy` or Magento's `grunt`
implementation, it will work with this, and probably be faster.

## Installation

### Dependencies

*	[Node][install-node]
*	[Composer][install-composer]

Install via Composer! (Packagist entry is coming)

```bash
composer global config repositories.gulp vcs https://github.com/maxbucknell/redbox-gulp.git
composer global config "minimum-stability" "dev"
composer global config "prefer-stable" "true"
composer global require redbox/gulp
```

## Getting Started

This will walk you through setting up Redbox Gulp, and having it work on your
theme.

Once installed, its NPM dependencies will need to be installed. From your root
directory:

```bash
cd vendor/redbox/gulp
npm install
```

That's all the set up you'll need to do. To try it out, the best command to run
is the `watch` command. It compiles everything, and then waits for changes.
Remaining inside the `vendor/redbox/gulp` directory, run:

```
# Feel free to change the theme name!
./node_modules/.bin/gulp watch \
  --theme="frontend/Magento/luma" \
  --locale="en_US"
```

>	For extra credit, install gulp as a global command to not have to write
>	`./node_modules/.bin/`: `sudo npm install -g gulp-cli`.

Once it's ready, you can load the site in your browser, and watch it load.

If you change a file, it will let you know in the console, and rebuild the
invalidated assets for you automatically.

## Task Reference

All tasks have two required arguments:

| Flag       | Description |
| :--------- | :---------- |
| `--theme`  | The theme to compile. |
| `--locale` | The locale to compile |

### `gulp flatten`

Resolve the theme hierarchy into a flat directory of unprocessed files.

This collects `lib/web`, all theme `web` directories, as well as the `web`
directories from all module view folders. `i18n` directories are also accounted
for.

### `gulp copy`

Copy everything from the flattened build directory into `pub/static`.

This is a sensible default for most static asset types.

### `gulp less`

Compile LESS stylesheets.

This will resolve all `@magento_import` directives, and then pass the files
through LESS, and spit out stylesheets.

#### What Gets Compiled?

All `.less` files in the `web/css` directory are treated as compilation targets,
and will get CSS files dumped in `pub/static`.

### `gulp deploy`

#### Pre-Requisites

*	`copy`
*	`less`

No-op.

### `gulp watch`

#### Pre-Requisites

*	`flatten`
*	`deploy`

Compile all assets and wait for changes, then recompile invalid targets.

## Technical Details

### Flattened Theme Directory

One of Magento's killer features is its theme hierarchy. Any particular asset
can be located in one of several places, and it's up to Magento to figure out
which one you want by a series of precedences.

This allows customisation with only minimal damage to upgradability, and a great
deal of other flexibility. Unfortunately, this can make it difficult to use
conventional build tools. In Magento 1, it was damn near impossible, and in
Magento 2, it is possible, but has either been slow or incompatible.

Magento's default implementation resolves this hierarchy and takes a similar
approach, and dumps its files into `var/view_preprocessed`. But by spending so
much time in PHP, they are giving up some performance benefits gained by using
such widely adopted tools as are found in the Node JS ecosystem.

Redbox Gulp takes a different approach: we resolve the theme hierarchy into
a directory entirely made of symlinks. What we found across our Magento
2 projects was that adding and removing files was a comparatively rare operation
as compared to changing existing files. By flattening the theme hierarchy into
a filesystem built of symlinks, we are easily able to track changes to files
that matter.

This flattened directory is then used as the source directory for Gulp and its
various plugins, to do a multitude of build related things.

### Choosing CSS Compilation Targets

This is done the same way as Magento: The XML layout tree is parsed, and the CSS
directives are extracted.

[install-node]: https://nodejs.org/
[install-composer]: https://getcomposer.org/download/
