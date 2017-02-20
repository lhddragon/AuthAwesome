'use strict';

angular.module('ng-gulp-hapi')
	.controller('RegisterCtrl', ['$scope', '$state', '$auth', function($scope, $state, $auth) {

		$scope.signup = function() {
	      $auth.signup($scope.user)
	        .then(function(response) {
	          $auth.setToken(response);
	          // $state.go('main');
	          toastr.info('Register success! Please check you email and verify before login!');
	        })
	        .catch(function(response) {
	          toastr.error(response.data.message);
	        });
	    };

	}]);