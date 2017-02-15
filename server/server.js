'use strict';
/**
 * Hapi.js server.
 *
 * @type {exports}
 */

var Hapi = require('hapi');
var _ = require('lodash');
const Boom = require('boom');
var modules = require('./modules');
var chalk = require('chalk');
var config = require('./config/environment');

var swig = require('swig');

swig.setDefaults({varControls: ['%{', '}%']});

// Instantiate the server
var server = new Hapi.Server({ debug: { request: ['error'] } });

server.connection({port: config.port});
/**
 * The hapijs plugins that we want to use and their configs
 */
 var plugins = [
    // require('hapi-auth-cookie'), 
    // require('bell')
 ];


/**
 * Setup the server with plugins
 */
server.register(plugins, function(err) {

  // If there is an error on server startup
  if(err) {
    throw err;
  }

  // Declare an authentication strategy using the bell scheme
    // with the name of the provider, cookie encryption password,
    // and the OAuth client credentials.
  // server.auth.strategy('twitter', 'bell', {
  //       provider: 'twitter',
  //       password: 'cookie_encryption_password_secure',
  //       clientId: 'zlHDmxbFYgPQXWu5mYuysTCDU',
  //       clientSecret: 'TuEpuW5apYR8JlQap1aZlc7GTfwwQXdegFGA8hn6mBHh4NBUwC',
  //       isSecure: false     // Terrible idea but required if not using HTTPS especially if developing locally
  //   });

  // server.auth.strategy('base', 'cookie', {
  //   password: 'supersecretpassword', // cookie secret
  //   cookie: 'app-cookie', // Cookie name,
  //   // redirectTo: '/auth/twitter',
  //   ttl: 24 * 60 * 60 * 1000 // Set session to 1 day
  // });

  //Setup the session strategy
  // server.auth.strategy('session', 'cookie', {
  //   password: 'secret_cookie_encryption_password', //Use something more secure in production
  //   // redirectTo: '/login', //If there is no session, redirect here
  //   isSecure: false //Should be set to true (which is the default) in production
  // });



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
      config: {
        // auth: 'session', //<-- require a session for this, so we have access to the twitter profile
        // handler: function(request, reply) {

        //   //Return a message using the information from the session
        //   return reply(request.auth.credentials.displayName);
        // }
        // auth: {
        //   strategy: 'base'
        // },
        handler:  {
          directory: {
            path: config.appRoot,
            listing: true,
            index: ['index.html']
          }
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
