'use strict';

angular.module('ng-gulp-hapi')
  .factory('httpInterceptor', function ($injector) {
    return {

      response: function (resp) {
        //use or modify parts of every response, such as storing i18n strings
        $injector.get('gettextCatalog').setStrings('en', resp.i18n);
        return resp;
      },

      responseError: function (response) {
        // a global network exception handler
        // maybe present a notification or redirect to login if session expired etc...
        return response;
      }
    };

  });
