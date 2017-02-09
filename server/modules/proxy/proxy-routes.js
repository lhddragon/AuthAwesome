'use strict';

/**
 * All the endpoints for anything related to vehicle
 *
 * @type {exports}
 */

var startupController = require('./proxy-ctrl');
var config = require('../../config/environment');


module.exports = [
  {
    method: 'POST',
    path: '/api/data/{param*}',
    handler: {
      proxy: {
      		host:config.LBS.ip,
      		port:9012,
      		protocol: 'http',
      		passThrough: true,
			localStatePassThrough: true,
			xforward: true
      }
    }
  },
  {
    method: 'GET',
    path: '/api/export/locale/{param*}',
    handler: {
      proxy: {
          host:'localise.biz',
          port:443,
          protocol: 'https'
          // passThrough: true,
          // localStatePassThrough: true,
          // xforward: false
      }
    }
  },
  {
    method: 'GET',
    path: '/geoserver/Gistic/{param*}',
    handler: {
      proxy: {
          host:'72.215.195.71',//192.168.0.22
          port:8188,
          protocol: 'http'
          // passThrough: true,
          // localStatePassThrough: true,
          // xforward: false
      }
    }
  }
];
