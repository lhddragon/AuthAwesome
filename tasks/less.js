'use strict';

/**
 * Compile less
 */

var gulp          = require('gulp');
var plumber       = require('gulp-plumber');
var less          = require('gulp-less');
var autoprefixer  = require('gulp-autoprefixer');


module.exports = function () {
  return gulp.src([
    'client/app.less'
  ])
    .pipe(plumber())
    .pipe(less())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('client/styles/css'));
};
