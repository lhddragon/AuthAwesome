'use strict';

angular.module('ng-gulp-hapi')
  .factory('httpInterceptor', ['$injector', function ($injector) {
    return {

      request: function(config) {
            var $auth = $injector.get('$auth');
            var token = $auth.getToken();

            if (token) {
                config.headers.Authorization = 'Bearer ' + token;
            }
               
            return config;
        },
        response: function(response) {
            return response;
        }
    };

  }]);
