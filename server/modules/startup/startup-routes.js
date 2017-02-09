'use strict';

/**
 * All the endpoints for anything related to vehicle
 *
 * @type {exports}
 */

var startupController = require('./startup-ctrl');
var config = require('../../config/environment');


module.exports = [
  {
    method: 'GET',
    path: config.baseApiRoute + '/startup',
    config: {
      description: 'exectutes method call on byo-web server',
      handler: startupController.getStartupData
    }
  }
];
