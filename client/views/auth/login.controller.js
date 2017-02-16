'use strict';

angular.module('ng-gulp-hapi')
	.controller('LoginCtrl', ['$scope', 'auth', '$auth', function($scope, auth, $auth) {

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

		this.login = function () {
			auth.login($scope.email, $scope.password).then(function (res) {
				console.log(res);
			}).catch(handleError);
		};

		this.authenticate = function (provider) {
			auth.googleAuth().then(function (res) {
				console.log(res);
			}, handleError);
		};

	}]);