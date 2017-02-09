'use strict';

/**
 * Inject less files in app.less
 */

var gulp = require('gulp');
var _ = require('lodash');
var inject = require('gulp-inject');
var sort = require('gulp-sort');

module.exports = function () {

  var bowerSources = gulp.src([
    'client/bower_components/font-awesome/less/font-awesome.less',
    'client/bower_components/bootstrap/less/bootstrap.less'
  ], {read: false});

  var bowerOpts = {
    relative: true,
    transform: function (filePath) {
      return '@import \'' + filePath + '\';';
    },
    starttag: '// inject:bower',
    endtag: '// end:bower'
  };

  var lessSources = gulp.src([
    'client/components/**/*.less',
    'client/views/**/*.less',
    'client/directives/**/*.less',
    'client/modals/**/*.less'
  ], {read: false}).pipe(sort());

  var lessOpts = {
    relative: true,
    transform: function (filePath) {
      return '@import \'' + filePath + '\';';
    },
    starttag: '// inject:less',
    endtag: '// end:less'
  };

  return gulp.src('client/app.less')
    .pipe(inject(bowerSources, bowerOpts))
    .pipe(inject(lessSources, lessOpts))
    .pipe(gulp.dest('client'));
};
