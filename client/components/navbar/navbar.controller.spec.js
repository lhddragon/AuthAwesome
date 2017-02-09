'use strict';


describe('Controller: NavbarCtrl', function () {

  // load the controller's module
  beforeEach(module('ng-gulp-hapi'));

  var NavbarCtrl, scope, navItemsMock, state, location, rootScope;

  beforeEach(function() {

  });

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, _$state_, _$location_) {
    //rootScope = $rootScope;
    //scope = $rootScope.$new();
    //state = _$state_;
    //location = _$location_;
    ////state.current.name = 'foo';
    //scope.menu=navItemsMock;
    //
    //spyOn(state, 'go');
    //NavbarCtrl = $controller('NavbarCtrl', {
    //  $scope: scope,
    //  $state: state,
    //  $rootScope: rootScope,
    //  navItems: navItemsMock
    //});
  }));

  describe('On exception', function () {
    //it('check the if condition', function() {
    //  state.current.name = 'TEST';
    //  expect(state.go).toHaveBeenCalled();
    //  expect(state.go).toHaveBeenCalledWith('main');
    //});
  });

});
