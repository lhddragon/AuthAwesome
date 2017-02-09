'use strict';

/**
 * Build task
 */

var gulp                     = require('gulp');
var path                     = require('path');
var sq                       = require('streamqueue');
var runSequence              = require('run-sequence');
var del                      = require('del');
var plumber                  = require('gulp-plumber');
var usemin                   = require('gulp-usemin');
var autoprefixer             = require('gulp-autoprefixer');
var minifyCss                = require('gulp-minify-css');
var angularTemplatecache     = require('gulp-angular-templatecache');
var concat                   = require('gulp-concat');
var ngAnnotate               = require('gulp-ng-annotate');
var uglify                   = require('gulp-uglify');
var replace                  = require('gulp-replace');
var revAll                   = require('gulp-rev-all');
var revToExclude             = require('./config/revFilesToExclude');
var sort                     = require('gulp-sort');
var argv                     = require('yargs')
                                .default('minify', 'true')
                                .default('output', 'dist')
                                .default('contextPath', '.')
                                .argv;

var output = argv.output;
var minify = (argv.minify === 'true');
var contextPath = getContextPath(argv.contextPath);

var toDelete = [];

module.exports = function (done) {
  runSequence(
    'jshint',
    ['clean:dist', 'less'],
    ['usemin', 'copy:dist'],
    ['scripts', 'cssmin'],
    // 'replace',
    'rev',
    'clean:finish',
    done);
};

gulp.task('clean:dist', function (done) {
  del([output + '/**',
    '!' + output
  ], {force: true}, done);
});

gulp.task('clean:finish', function (done) {
  del([
    '.tmp/**',
    output + '/app.{css,js}'
  ].concat(toDelete), {force: true}, done);
});

gulp.task('copy:dist', function () {
  var assets = gulp.src([
    'client/styles/fonts/**/*',
    'client/styles/css/*.css',
    '!client/styles/css/app.css',
    'client/assets/**/*',
    //'!client/assets/**/*.less',
    '!client/assets/**/*.less'
  ], {base: 'client'});

  return sq({objectMode: true}, assets)
    .pipe(gulp.dest(output + '/'));
});

gulp.task('usemin', ['inject'], function () {
  return gulp.src('client/index.html')
    .pipe(plumber())
    .pipe(usemin({css: ['concat']}))
    .pipe(gulp.dest(output + '/'));
});

gulp.task('cssmin', function () {
  var returnValue = gulp.src(output + '/app.css').pipe(autoprefixer());
  if (minify) {
    returnValue = returnValue.pipe(minifyCss());
  }
  return returnValue.pipe(gulp.dest(output + '/'));
});

gulp.task('scripts', function () {
  var views = gulp.src('client/views/**/*.html')
    .pipe(sort())
    .pipe(angularTemplatecache({
      root: 'views',
      module: 'ng-gulp-hapi'
    }));

  var directives = gulp.src('client/directives/**/*.html')
    .pipe(sort())
    .pipe(angularTemplatecache({
      root: 'directives',
      module: 'app.directives'
    }));

  var components = gulp.src('client/components/**/*.html')
    .pipe(sort())
    .pipe(angularTemplatecache({
      root: 'components',
      module: 'ng-gulp-hapi'
    }));

  var modals = gulp.src('client/modals/**/*.html')
    .pipe(sort())
    .pipe(angularTemplatecache({
      root: 'modals',
      module: 'ng-gulp-hapi'
    }));

  var app = gulp.src(output + '/app.js');

  var returnValue = sq({objectMode: true}, app, directives, components, views, modals)
    .pipe(concat('app.js'))
    .pipe(ngAnnotate());
  if (minify) {
    returnValue = returnValue.pipe(uglify());
  }
  return returnValue.pipe(gulp.dest(output + '/'));
});

// gulp.task('replace', function () {
//   gulp.src(output + '/app.js')
//     .pipe(replace('servicesPath: \'/api', 'servicesPath: \'' + contextPath + '/services'))
//     .pipe(gulp.dest(output));

//   gulp.src(output + '/app.css')
//   .pipe(replace('/assets', contextPath + '/assets'))
//   .pipe(replace('/styles', contextPath + '/styles'))
//   .pipe(gulp.dest(output));

//   gulp.src(output + '/styles/css/*.css')
//   .pipe(replace('/assets', contextPath + '/assets'))
//   .pipe(replace('/styles', contextPath + '/styles'))
//   .pipe(gulp.dest(output + '/styles/css' ));

// });

gulp.task('rev', function () {

  var rev = new revAll({
    dontSearchFile: ['app.js'],
    transformPath: function (rev) {
      return contextPath + '/' + rev;
    },
    transformFilename: function (file, hash) {
      var filename = path.basename(file.path);
      if (revToExclude.indexOf(filename) !== -1) {
        return filename;
      }
      toDelete.push(path.resolve(file.path));
      var ext = path.extname(file.path);
      var version = getVersion(argv.version, hash.substring(0, 8));
      var fullpath = path.basename(file.path, ext) + '.' + version + ext;
      return fullpath;
    }
  });

  return gulp.src([
    output + '/**',
    '!' + output + '/assets/**',
    '!' + output + '/styles/fonts/**/*'
  ])
    .pipe(rev.revision())
    .pipe(gulp.dest(output + '/'));
});

function getContextPath(provided) {
	if (provided.toUpperCase() === 'ROOT') {
		return '';
	}
	if (provided.toUpperCase() === 'RUNTIME') {
		return '${@runtime.context.path}';
	}
	return provided;
}

function getVersion(version,hash) {
	if (isEmpty(version)) {
		return hash;
	} else {
		return removeEnd(version,'-SNAPSHOT');
	}
}

function endsWith(str,suffix) {
	if (isEmpty(str) || isEmpty(suffix)) {
		return false;
	} else {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}
}

function removeEnd(str,remove) {
	if (isEmpty(str) || isEmpty(remove)) {
	  return str;
	}
	if (endsWith(str,remove)) {
      return str.substring(0, str.length - remove.length);
	}
	return str;
}

function isEmpty(str) {
    return (!str || 0 === str.length);
}

