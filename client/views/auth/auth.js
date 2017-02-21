'use strict';

angular.module('ng-gulp-hapi')
  .config(function ($stateProvider, appResolverProvider) {
    /**
     * Helper auth functions
     */
    var skipIfLoggedIn = ['$q', '$auth', function($q, $auth) {
      console.log($auth.isAuthenticated());
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        deferred.reject();
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    }];

    var loginRequired = ['$q', '$location', '$auth', function($q, $location, $auth) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        deferred.resolve();
      } else {
        $location.path('/login');
      }
      return deferred.promise;
    }];

    $stateProvider
      .state('auth', {
        url: '/login',
        views: {
          '': {
            template: '<div auth-awesome-login></div>'
          }
        }
      })
      .state('register', {
        url: '/register',
        views: {
          '': {
            template: '<div auth-awesome-register></div>'
          }
        }
      })
      .state('auth.twitter', {
          url: '/auth/twitter'
      });
  });