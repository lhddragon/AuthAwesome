'use strict';

angular.module('app.resources')
  .factory('StartupData', function (_, $resource) {

    var url = '/api/startup';

    return $resource(
      url,
      {
        get: {
          method: 'GET',
          cache: true,
          transformResponse: function (data) {
            var startupData = angular.fromJson(data);
            //TODO: modify key values on the backend or add new ones
            return startupData;
          }
        }
      });
  });
