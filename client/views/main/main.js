'use strict';

angular.module('ng-gulp-hapi')
  .config(function ($stateProvider, appResolverProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        views: {
          '': {
            templateUrl: 'views/main/main.html',
            controller: 'MainCtrl',
            controllerAs: 'main',
            resolve: appResolverProvider.main
          },
          'navbar': {
            templateUrl: 'components/navbar/navbar.html',
            controller: 'NavbarCtrl',
            resolve: appResolverProvider.navbar
          },
          'map-panel@lbe': {
            templateUrl: 'components/mapPanel/mapPanel.html',
            controller: 'MapPanelCtrl',
            controllerAs: 'mapPanel'
          }
        }
      });
  });
