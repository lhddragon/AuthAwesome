'use strict';

angular.module('ng-gulp-hapi')
	.controller('LoginCtrl', ['$scope', '$state', '$auth', function($scope, $state, $auth) {

		this.login = function() {
			// $state.go('auth.twitter');
			$state.go('main');
		};

		this.twitterLogin = function() {
			$auth.authenticate('twitter')
				.then(function(resp) {
		          // handle success
		          console.log(resp);
		        })
		        .catch(function(resp) {
		          // handle errors
		        });
			};
	}]);