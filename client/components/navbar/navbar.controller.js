'use strict';

angular.module('ng-gulp-hapi')
  .controller('NavbarCtrl', function (_, $scope, $state, navItems) {

    $scope.logout = function() {
        debugger
        $state.go('logout');
    };

    //if the requested route is matched but not in the current navItems we don't want to go to there.
    //$scope.$on('$stateChangeStart', function (e, toState, toParams, fromState) {
    //  if (!_.includes(navItems, toState.name)) {
    //    e.preventDefault();
    //    $state.go(fromState.name);
    //  }r
    //});

    
  });
