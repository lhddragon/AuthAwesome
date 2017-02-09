'use strict';

/**
 * Test tasks
 */

var gulp       = require('gulp');
var chalk      = require('chalk');
var karma      = require('karma').server;

/**
 * Log. With options.
 *
 * @param {String} msg
 * @param {Object} options
 */
function log (msg, options) {
  options = options || {};
  console.log(
    (options.padding ? '\n' : '') +
    chalk.yellow(' > ' + msg) +
    (options.padding ? '\n' : '')
  );
}

exports.tdd = function (done) {
  process.env.NODE_ENV = 'test';
  log('Running client tests...', { padding: true });

  return karma.start({
    configFile: __dirname + '/../karma.conf.js',
    autoWatch: true,
    singleRun: false
  }, done());
};
