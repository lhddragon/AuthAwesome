'use strict';

/**
 * All the endpoints for anything related to vehicle
 *
 * @type {exports}
 */

var startupController = require('./auth-ctrl');
var config = require('../../config/environment');

module.exports = [
  // {
  //   method: 'POST',
  //   path: '/auth/login',
  //   handler: {
      
  //   }
  // },
  {
    method: 'GET',
    path: '/api/auth/twitter',
    config: {
      auth: 'twitter', //<-- use our twitter strategy and let bell take over
      handler: function(request, reply) {
        console.log(request);
        if (!request.auth.isAuthenticated) {
          return reply(Boom.unauthorized('Authentication failed: ' + request.auth.error.message));
        }

        //Just store a part of the twitter profile information in the session as an example. You could do something
        //more useful here - like loading or setting up an account (social signup).
        const profile = request.auth.credentials.profile;

        request.auth.session.set({
          twitterId: profile.id,
          username: profile.username,
          displayName: profile.displayName
        });

        return reply.redirect('/');
      }
    }
  }
];
