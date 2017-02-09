'use strict';
var path = require('path');

// Production specific configuration
// =================================
module.exports = {
  // Root path of server
  appRoot: path.normalize(__dirname + '/../../../../dist'),

  serviceUri: 'http://www.google.com'
};

