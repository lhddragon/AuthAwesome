'use strict';

angular.module('ng-gulp-hapi')
  .provider('appResolver', function AppResolverProvider() {

    this.$get = ['appResolverService', function() {
      return new AppResolverProvider();
    }];

    this.main = {
      example: function(){
        return 'example';
      }
    };

    this.auth = {
      example: function(){
        return 'example';
      }
    };

    this.navbar = {
      navItems: ['_', function() {

      }]
    };

  });
