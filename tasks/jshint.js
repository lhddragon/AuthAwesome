'use strict';

var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');
var gulp   = require('gulp');
var toLint   = require('./config/filesToLint');


module.exports = function() {
  return gulp.src(toLint)
    .pipe(jshint({
      lookup: true
    }))
    .pipe(jshint.reporter(jshintStylish))
    .pipe(jshint.reporter('fail'));
};
