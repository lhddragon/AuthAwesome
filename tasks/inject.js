'use strict';

/**
 * Inject css/js files in index.html
 */

var gulp       = require('gulp');
var bowerFiles = require('main-bower-files');
var inject     = require('gulp-inject');
var sort       = require('gulp-sort');
var order      = require('gulp-order');
var rename     = require('gulp-rename');

var toInject   = require('./config/filesToInject');
var toExclude  = require('./config/bowerFilesToExclude');

module.exports = function () {
  var modules = gulp.src([
    //'client/lib/**/*.js',
    'client/directives/directives.module.js',
    'client/filters/filters.module.js',
    'client/resources/resources.module.js',
    'client/services/services.module.js',
    'client/services/core.module.js'
  ], { read: false }).pipe(sort());
  var sources = gulp.src(toInject, { read: false }).pipe(sort());
  var bowerSources = gulp.src(bowerFiles(), { read: false }).pipe(order([
    '*matchMedia.js',
    '*lodash.js',
    '*jquery.js',
    '*jquery-ui.js',
    '*angular.js',
    '*angular-*.js',
    '*bootstrap*'
  ]));

  return gulp.src('client/.index.html')
    .pipe(inject(bowerSources, {
      name: 'bower',
      relative: 'true',
      ignorePath: toExclude
    }))
    .pipe(inject(modules,  {
      name: 'modules',
      relative: 'true',
      ignorePath: toExclude
    }))
    .pipe(inject(sources, { relative: true }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('client'));
};
