'use strict';

angular.module('ng-gulp-hapi').config(function ($stateProvider) {
  $stateProvider.state('modal', {
    parent: 'main',
    url: 'modal',
    params: {
      fromState: 'main'
    },
    onEnter: function ($state, $stateParams, $modal) {
      this.$modalInstance = $modal.open({
        templateUrl: 'views/main/modal/modal.html',
        controller: 'ModalCtrl',
        controllerAs: 'modal'
      });
      this.$modalInstance.result.finally(function () {
        $state.go($stateParams.fromState);
      });
    },
    onExit: function () {
      if (!this.$modalInstance.result.$$state.status) {
        this.$modalInstance.dismiss();
      }
    }
  });
});
