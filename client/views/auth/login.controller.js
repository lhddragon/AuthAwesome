'use strict';

angular.module('ng-gulp-hapi')
	.controller('LoginCtrl', ['$scope', '$state', '$auth', 'authToken', function($scope, $state, $auth, authToken) {

		$scope.email = 'test@test.com';
		$scope.password = '1234';

		// function authSuccessful(res) {
		// 	console.log(res.token);
		// 	$state.go('main');
		// }

		// this.login = function () {
		// 	var user = {
		// 		email: $scope.email,
		// 		password: $scope.password
		// 	};
		// 	$http.post('http://localhost:3000/login', user).success(function(res){
		// 		console.log(res);
		// 	}).error(function(err){
		// 		console.log(err.message);
		// 	});
		// };
		function handleError(err) {
			console.log(err.data.message);
		}

		function handleSuccess(res) {
			console.log(res);
			$auth.setToken(res.data.token);
			$state.go('main');
		}

		this.login = function () {
			$auth.login({
				email: $scope.email,
				password: $scope.password
			}).then(function (res) {
				handleSuccess(res);
			}).catch(handleError);
		};

		this.authenticate = function (provider) {
			$auth.authenticate(provider).then(function (res) {
				handleSuccess(res);
			}, handleError);
		};

	}]);