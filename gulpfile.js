const { watch, series } = require('gulp');
const browserSync = require('browser-sync');
const server = browserSync.create();
const workbox = require('workbox-build');

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

let serve = series(makeSW, startServer);
exports.serve = serve;