'use strict';

angular.module('ng-gulp-hapi').factory('authToken', function($window) {
    var storage = $window.localStorage;
    var cachedToken;
    var userToken = 'userToken';
    var isAuthenticated = false;
    var user = null;
    var authToken = {
        setToken: function(token) {
            cachedToken = token;
            storage.setItem(userToken, token);
            isAuthenticated = true;
        },
        getToken: function() {
            if (!cachedToken) {
                cachedToken = storage.getItem(userToken);
            }

            return cachedToken;
        },
        isAuthenticated: function() {
            return !!authToken.getToken();
        },
        removeToken: function() {
            cachedToken = null;
            storage.removeItem(userToken);
            isAuthenticated = false;
        },
        setUser: function(name) {
            user = name;
            isAuthenticated = true;
        },
        getUser: function() {
            return user;
        }
    };

    return authToken;
});
