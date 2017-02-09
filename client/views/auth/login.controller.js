'use strict';

angular.module('ng-gulp-hapi')
	.controller('LoginCtrl', ['$scope', '$state', function($scope, $state) {

		this.login = function() {
			$state.go('main');
		};
	}]);