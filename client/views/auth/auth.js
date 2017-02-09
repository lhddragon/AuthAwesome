'use strict';

angular.module('ng-gulp-hapi')
  .config(function ($stateProvider, appResolverProvider) {
    $stateProvider
      .state('auth', {
        url: '/login',
        views: {
          '': {
            templateUrl: 'views/auth/login.html',
            controller: 'LoginCtrl',
            controllerAs: 'auth',
            resolve: appResolverProvider.auth
          }
        }
      });
  });
