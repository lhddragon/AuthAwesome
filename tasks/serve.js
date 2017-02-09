'use strict';

/**
 * Serve app. For dev purpose.
 */

var gulp       = require('gulp');
var fs         = require('fs');
var nodemon    = require('gulp-nodemon');
var open       = require('gulp-open');
var bwsrsync   = require('browser-sync').create();
var os         = require('os');

var config = require('../server/config/environment');

var openOpts = {
  url: 'http://localhost:' + config.port,
  app: os.platform() === 'win32' ? 'chrome' : 'Google Chrome',
  already: false
};

function _waitForHapi (cb) {
  var id;

  id = setInterval(function () {
    fs.readFile('.server-refresh', 'utf-8', function (err, status) {
      if (err) {
        if (err.code === 'ENOENT') {
          clearTimeout(id);
          return fs.writeFileSync('.server-refresh', 'waiting');
        }
        throw err;
      }
      if (status === 'done') {
        fs.unlink('.server-refresh', function (err) {
          if (err) { throw err; }
          clearTimeout(id);
          cb();
        });
      }
    });
  }, 100);
}

module.exports = {
  waitForHapi: _waitForHapi,
  nodemon: function () {
    return nodemon({
        script: 'server/server.js',
        ext: 'js',
        ignore: ['client', 'dist', 'node_modules', 'gulpfile.js']
      })
      .on('start', function () {
        fs.writeFileSync('.server-refresh', 'waiting');

        if (!openOpts.already) {
          openOpts.already = true;
          _waitForHapi(function () {
            gulp.src('client/index.html')
              .pipe(open('', openOpts));
          });
        } else {
          _waitForHapi(bwsrsync.reload);
        }
      });
  }

};
