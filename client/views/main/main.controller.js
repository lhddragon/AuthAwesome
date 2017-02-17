'use strict';

angular.module('ng-gulp-hapi')
  .controller('MainCtrl', function ($scope, $http, API_URL, authToken, $auth, $location, $state) {
				// console.log($auth.getPayload());
  	$scope.user = $auth.getPayload().sub;
  	$scope.test = function() {
  		$http.post(API_URL + 'test', { data: 'test' }).success(function(res) {
  			console.log('pin success');
  			console.log(res);
  		})
  		.error(function(err){
  			console.log(err.message);
  		});
  	};

  	$scope.logout = function() {
  		if (!$auth.isAuthenticated()) { return; }
	    $auth.logout()
	      .then(function() {
	        $location.path('/login');
	        // $state.go('login');
  		});
    };

  });
