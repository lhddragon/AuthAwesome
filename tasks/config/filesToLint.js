/**
 * Files injected into index.html by gulp-inject
 * used by tasks inject & watch
 */

module.exports = [
  'client/app.js',

  //'client/components/**/*.js',
  'client/directives/**/*.js',
  'client/filters/**/*.js',
  'client/resources/**/*.js',
  'client/services/**/*.js',
  'client/views/**/*.js',
  '!client/**/*.spec.js'
];
