'use strict';

angular.module('ng-gulp-hapi')
	.controller('LoginCtrl', ['$scope', '$state', '$auth', '$http', function($scope, $state, $auth, $http) {

		$scope.email = 'asdf@fsdf.com';
		$scope.password = 'asdfa';

		function authSuccessful(res) {
			console.log(res.token);
			$state.go('main');
		}

		this.login = function (email, password) {
			return $http.post('http://localhost:3000/' + 'login', {
				user: {
					email: email,
					password: password
				}
			}).success(authSuccessful);
		}

		// this.login = function() {
		// 	// $state.go('auth.twitter');
		// 	$state.go('main');
		// };

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