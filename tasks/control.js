'use strict';

/**
 * Control things.
 */

var gulp        = require('gulp');
var fs          = require('fs');
var _           = require('lodash');
var async       = require('async');
var jshint      = require('gulp-jshint');
module.exports = function (done) {

  function getConfig (file) {
    return _.merge(
      JSON.parse(fs.readFileSync('./.jshintrc', 'utf-8')),
      JSON.parse(fs.readFileSync(file, 'utf-8'))
    );
  }

  function control (paths, conf) {
    return function () {
      gulp.src(paths)
        .pipe(jshint(conf))
        .pipe(jshint.reporter('jshint-stylish'));
    };
  }

  async.series([
    control(['client/**/*.js', '!client/bower_components/**'], getConfig('./client/.jshintrc')),
    control(['server/**/*.js'], getConfig('./server/.jshintrc')),
    control(['gulpfile.js', 'tasks/**/*.js'], getConfig('./server/.jshintrc'))
  ], done);

};
