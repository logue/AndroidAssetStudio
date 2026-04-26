/*
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import gulp from 'gulp';
import gulpSassLib from 'gulp-sass';
import * as sassLib from 'sass';
import { deleteSync } from 'del';
import browserSync from 'browser-sync';
import merge from 'merge-stream';
import { injectManifest } from 'workbox-build';
import prettyBytes from 'pretty-bytes';
import webpack from 'webpack';
import autoprefixer from 'gulp-autoprefixer';

// CJS gulp plugins loaded via createRequire for compatibility
const require = createRequire(import.meta.url);
const changedModule = require('gulp-changed');
const changed = changedModule.default || changedModule;
const matter = require('gray-matter');
const { minify: minifyHtml } = require('html-minifier-terser');
const nunjucks = require('nunjucks');
const through2 = require('through2');
const sassGlob = require('gulp-sass-glob');
const gulpIf = require('gulp-if');
const csso = require('gulp-csso');
const tap = require('gulp-tap');
const replace = require('gulp-replace');
const ghPages = require('gh-pages');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sass = gulpSassLib(sassLib);
const bs = browserSync.create();
const reload = bs.reload.bind(bs);

const AUTOPREFIXER_BROWSERS = ['ff >= 30', 'chrome >= 34', 'safari >= 7'];

let DEV_MODE = false;
let BASE_HREF = DEV_MODE ? '/' : '/AndroidAssetStudio/';

let webpackInstance;

function renderNunjucksPages(templateRootPath) {
  const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(templateRootPath),
    { noCache: true }
  );

  return through2.obj((file, enc, cb) => {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new Error('Streaming is not supported for HTML templates.'));
      return;
    }

    try {
      const parsed = matter(file.contents.toString());
      const rendered = env.renderString(parsed.content, parsed.data);

      file.contents = Buffer.from(rendered);
      file.contextData = parsed.data;

      if (parsed.data.destination) {
        file.path = path.join(
          file.base,
          parsed.data.destination.replace(/^\//, '')
        );
      }

      cb(null, file);
    } catch (error) {
      cb(error);
    }
  });
}

function minifyHtmlFiles() {
  return through2.obj((file, enc, cb) => {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new Error('Streaming is not supported for HTML minification.'));
      return;
    }

    minifyHtml(file.contents.toString(), {
      collapseWhitespace: true,
      removeComments: true,
    })
      .then(output => {
        file.contents = Buffer.from(output);
        cb(null, file);
      })
      .catch(error => cb(error));
  });
}

function printWebpackStats(stats) {
  if (!stats) {
    console.error('Webpack finished without stats output.');
    return;
  }
  console.log(
    stats.toString({
      modules: false,
      colors: true,
    })
  );
}

function errorHandler(error) {
  if (error.fileName) {
    console.error(`Error in ${error.fileName}`);
  }
  console.error(error.stack);
  this.emit('end'); // http://stackoverflow.com/questions/23971388
}

// Lint JavaScript
gulp.task('webpack', async cb => {
  // force reload webpack config via cache-busted URL
  const webpackConfigUrl = new URL('./webpack.config.mjs', import.meta.url);
  webpackConfigUrl.searchParams.set('t', Date.now());
  const webpackConfigModule = await import(webpackConfigUrl.href);
  const webpackConfig = webpackConfigModule.default;
  webpackConfig.mode = DEV_MODE ? 'development' : 'production';
  webpackInstance = webpack(webpackConfig, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      cb(err);
      return;
    }
    printWebpackStats(stats);
    cb();
  });
});

// Optimize Images
gulp.task('res', () => {
  return gulp.src('app/res/**/*').pipe(gulp.dest('dist/res'));
});

// Copy All Files At The Root Level (app) and lib
gulp.task('copy', () => {
  const streams = [
    gulp
      .src(['app/favicon.ico', 'app/sw.js'], { dot: true, nodir: true })
      .pipe(gulp.dest('dist')),
  ];

  if (existsSync('older-version')) {
    streams.push(
      gulp
        .src('older-version/**/*', { dot: true })
        .pipe(gulp.dest('dist/older-version'))
    );
  }

  return merge(...streams);
});

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', () => {
  // For best performance, don't add Sass partials to `gulp.src`
  return (
    gulp
      .src('app/app.entry.scss')
      .pipe(changed('styles', { extension: '.scss' }))
      .pipe(sassGlob())
      .pipe(
        sass({
          style: 'expanded',
          precision: 10,
          quiet: true,
        }).on('error', errorHandler)
      )
      .pipe(autoprefixer({ overrideBrowserslist: AUTOPREFIXER_BROWSERS }))
      // Concatenate And Minify Styles
      .pipe(gulpIf(!DEV_MODE, csso()))
      .pipe(
        tap(file => (file.path = file.path.replace(/\.entry\.css$/, '.css')))
      )
      .pipe(gulp.dest('dist'))
  );
});

gulp.task('html', () => {
  return gulp
    .src(['app/**/*.html', '!app/**/_*.html'])
    .pipe(renderNunjucksPages(['app']))
    .pipe(replace(/%%BASE_HREF%%/g, BASE_HREF))
    .pipe(gulpIf(!DEV_MODE, minifyHtmlFiles()))
    .pipe(
      tap((file, t) => {
        if (file.contextData.destination) {
          file.path = path.join('./app', file.contextData.destination);
        }
      })
    )
    .pipe(gulp.dest('dist'));
});

// Clean Output Directory
gulp.task('clean', cb => {
  deleteSync(['.tmp', 'dist']);
  cb();
});

const setDevMode = cb => {
  DEV_MODE = true;
  cb();
};

// Watch Files For Changes & Reload
gulp.task(
  'serve',
  gulp.series(setDevMode, 'copy', 'styles', 'html', async () => {
    bs.init({
      notify: false,
      // Run as an https by uncommenting 'https: true'
      // Note: this uses an unsigned certificate which on first access
      //       will present a certificate warning in the browser.
      // https: true,
      server: {
        baseDir: ['.tmp', 'dist', 'app'],
      },
      port: 3000,
    });

    let r = cb => {
      reload();
      cb();
    };
    gulp.watch(['app/**/*.html'], gulp.series('html', r));
    gulp.watch(['app/**/*.{scss,css}'], gulp.series('styles', r));
    gulp.watch(['app/res/**/*'], gulp.series('res', r));

    const webpackConfigUrl = new URL('./webpack.config.mjs', import.meta.url);
    webpackConfigUrl.searchParams.set('t', Date.now());
    const webpackConfigModule = await import(webpackConfigUrl.href);
    const webpackConfig = webpackConfigModule.default;
    webpackConfig.mode = 'development';

    webpackInstance = webpack(webpackConfig);
    webpackInstance.watch({}, (err, stats) => {
      if (err) {
        console.error(err.stack || err);
        return;
      }
      printWebpackStats(stats);
      reload();
    });
  })
);

gulp.task('service-worker', async () => {
  const obj = await injectManifest({
    swSrc: path.join('app', 'sw-prod.js'),
    swDest: path.join('dist', 'sw.js'),
    globDirectory: 'dist',
    globIgnores: ['older-version/**/*'],
    globPatterns: ['*.html', '**/*.svg', '**/*.js', '**/*.css'],
  });
  obj.warnings.forEach(warning => console.warn(warning));
  console.log(
    `A service worker was generated to precache ${obj.count} files ` +
      `totalling ${prettyBytes(obj.size)}`
  );
});

// Build Production Files, the Default Task
gulp.task(
  'default',
  gulp.series(
    'clean',
    'styles',
    gulp.parallel('webpack', 'html', 'res', 'copy'),
    'service-worker'
  )
);

// Build and serve the output from the dist build
gulp.task(
  'serve:dist',
  gulp.series('default', () => {
    bs.init({
      notify: false,
      server: 'dist',
      port: 3001,
    });
  })
);

// Deploy to GitHub pages
gulp.task('deploy', cb => {
  ghPages.publish('dist', cb);
});
