const { src, dest, watch, series } = require('gulp');
const browserSync = require('browser-sync');
const server = browserSync.create();
const workbox = require('workbox-build');
const gulpLoadPlugins = require('gulp-load-plugins');
const cssnano = require('cssnano');

const $ = gulpLoadPlugins();

function makeSW(){
  return workbox.generateSW({
    swDest: './1-12-skeleton/sw.js',
    cacheId: 'app',
    globDirectory: './1-12-skeleton/',
    globPatterns: [
      '/images/*.{png, svg}',
      '/scripts/*.js',
      '/styles/*.css',
      'favicon.ico',
      '/*.html'
    ],
    clientsClaim: true,
    runtimeCaching: [{
      urlPattern: new RegExp('^https:\/\/publicdata-weather\.firebaseio\.com'),
      handler: 'CacheFirst',
      options: {
          cacheName: 'weatherPWA-datav3'
      }
    }]
  });
}

function startServer(){
  server.init({
    notify: false,
    ui: false,
    port: 9000,
    server: {
      baseDir: './1-12-skeleton',
      routes: {
          '/node_modules': 'node_modules'
      }
    }
  });
  watch(['./**/*.html',
          './**/**/*.js',
          './**/**/.css',]).on('change', server.reload);

};

function scripts() {
  return src('scripts/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(dest('scripts'));
};


function html(){
  return src('*.html')
    .pipe($.useref({searchPath: ['.']}))
    .pipe($.if(/\.html$/, $.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: {compress: {drop_console: true}},
      processConditionalComments: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))
    .pipe(dest('./'));
}

function images() {
  return src('images/*', { since: lastRun(images) })
    .pipe($.imagemin())
    .pipe(dest('images'));
};

let build = series(scripts, html, images);
let serve = series(makeSW, startServer);
exports.serve = serve;
exports.build = build;