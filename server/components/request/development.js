/**
 * Created by GZ0DMH on 3/11/2015.
 */

var request = require('request');
var config = require('../../config/environment');
module.exports = request.defaults({'proxy': config.proxy});
