'use strict';

angular.module('ng-gulp-hapi')
  .controller('MainCtrl', function ($scope, $http, API_URL, authToken) {
  	$scope.user = authToken.getUser();;
  	$scope.test = function() {
  		$http.post(API_URL + 'test', { data: 'test' }).success(function(res) {
  			console.log('pin success');
  			console.log(res);
  		})
  		.error(function(err){
  			console.log(err.message);
  		});
  	};


  });
