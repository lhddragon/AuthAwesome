'use strict';
/**
 * Hapi.js server.
 *
 * @type {exports}
 */

var Hapi = require('hapi');
var _ = require('lodash');
var modules = require('./modules');
var chalk = require('chalk');
var config = require('./config/environment');

var swig = require('swig');

swig.setDefaults({varControls: ['%{', '}%']});

// Instantiate the server
var server = new Hapi.Server();

server.connection({port: config.port});
/**
 * The hapijs plugins that we want to use and their configs
 */
 var plugins = [
//   {
//     plugin: require('lout')
//   }
 ];


/**
 * Setup the server with plugins
 */
server.register(plugins, function(err) {

  // If there is an error on server startup
  if(err) {
    throw err;
  }

  /**
   * Make sure if this script is being required as a module by another script, we don't start the server.
   */
  if(!module.parent) {

    /**
     * Starts the server
     */

    server.start(function () {
      chalk.yellow('\nHapi server started @', server.info.uri);
      chalk.yellow(config.appRoot);
      if (config.env === 'development') {
        require('fs').writeFileSync('.server-refresh', 'done');
      }
    });

    // server.views({
    //   path: config.appRoot,
    //   engines: {
    //     html: swig
    //   }
    // });

    // var indexView = function(request, reply) {
    //   reply.view('index', {hostname: request.headers.host});
    // };

    // server.route({
    //   method: 'GET',
    //   path: '/',
    //   handler: indexView
    // });

    // server.route({
    //   method: 'GET',
    //   path: '/index.html',
    //   handler: indexView
    // });

    server.route({
      method: 'GET',
      path: '/{param*}',
      handler:  {
        directory: {
          path: config.appRoot,
          listing: true,
          index: ['index.html']
        }
      }
    });

  }
});

/**
 * Add all the modules within the modules folder
 */
_.each(modules, function(element) {
 server.route(element);
});
//

/**
 * Expose the server's methods when used as a require statement
 *
 * @type {exports.server}
 */
module.exports = server;
