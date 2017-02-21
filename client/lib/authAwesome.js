/**
 * AuthAwesome 0.15.5
 * (c) 2016 Sahat Yalkabov 
 * License: MIT 
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.authAwesome = factory());
}(this, function () { 'use strict';

    var Config = (function () {
        function Config() {
            this.baseUrl = '/';
            this.loginUrl = '/auth/login';
            this.signupUrl = '/auth/register';
            this.unlinkUrl = '/auth/unlink/';
            this.tokenName = 'token';
            this.tokenPrefix = 'authAwesome';
            this.tokenHeader = 'Authorization';
            this.tokenType = 'Bearer';
            this.storageType = 'localStorage';
            this.tokenRoot = null;
            this.withCredentials = false;
            //////////////////////////////////////
            this.homePageState = 'main';
            this.customerAuthentication = false;
            this.routingType = 'ui-router'; // ui-router / ng-route ... 
            this.loginState = 'login';
            this.loginStateUrl = '/login';
            this.loginTemplate = 'login.html';
            this.registerState = 'register';
            this.registerStateUrl = '/register';
            this.registerTemplate = 'register.html';
            this.resetPasswordState = 'resetPassword';
            this.resetPasswordStateUrl = '/resetpassword';
            this.resetPasswordTemplate = 'resetPassword.html';
            //////////////////////////////////////
            this.providers = {
                facebook: {
                    name: 'facebook',
                    url: '/auth/facebook',
                    authorizationEndpoint: 'https://www.facebook.com/v2.5/dialog/oauth',
                    redirectUri: window.location.origin + '/',
                    requiredUrlParams: ['display', 'scope'],
                    scope: ['email'],
                    scopeDelimiter: ',',
                    display: 'popup',
                    oauthType: '2.0',
                    popupOptions: { width: 580, height: 400 }
                },
                google: {
                    name: 'google',
                    url: '/auth/google',
                    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
                    redirectUri: window.location.origin,
                    requiredUrlParams: ['scope'],
                    optionalUrlParams: ['display', 'state'],
                    scope: ['profile', 'email'],
                    scopePrefix: 'openid',
                    scopeDelimiter: ' ',
                    display: 'popup',
                    oauthType: '2.0',
                    popupOptions: { width: 452, height: 633 },
                    state: function () { return encodeURIComponent(Math.random().toString(36).substr(2)); }
                },
                github: {
                    name: 'github',
                    url: '/auth/github',
                    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
                    redirectUri: window.location.origin,
                    optionalUrlParams: ['scope'],
                    scope: ['user:email'],
                    scopeDelimiter: ' ',
                    oauthType: '2.0',
                    popupOptions: { width: 1020, height: 618 }
                },
                instagram: {
                    name: 'instagram',
                    url: '/auth/instagram',
                    authorizationEndpoint: 'https://api.instagram.com/oauth/authorize',
                    redirectUri: window.location.origin,
                    requiredUrlParams: ['scope'],
                    scope: ['basic'],
                    scopeDelimiter: '+',
                    oauthType: '2.0'
                },
                linkedin: {
                    name: 'linkedin',
                    url: '/auth/linkedin',
                    authorizationEndpoint: 'https://www.linkedin.com/uas/oauth2/authorization',
                    redirectUri: window.location.origin,
                    requiredUrlParams: ['state'],
                    scope: ['r_emailaddress'],
                    scopeDelimiter: ' ',
                    state: 'STATE',
                    oauthType: '2.0',
                    popupOptions: { width: 527, height: 582 }
                },
                twitter: {
                    name: 'twitter',
                    url: '/auth/twitter',
                    authorizationEndpoint: 'https://api.twitter.com/oauth/authenticate',
                    redirectUri: window.location.origin,
                    oauthType: '1.0',
                    popupOptions: { width: 495, height: 645 }
                },
                twitch: {
                    name: 'twitch',
                    url: '/auth/twitch',
                    authorizationEndpoint: 'https://api.twitch.tv/kraken/oauth2/authorize',
                    redirectUri: window.location.origin,
                    requiredUrlParams: ['scope'],
                    scope: ['user_read'],
                    scopeDelimiter: ' ',
                    display: 'popup',
                    oauthType: '2.0',
                    popupOptions: { width: 500, height: 560 }
                },
                live: {
                    name: 'live',
                    url: '/auth/live',
                    authorizationEndpoint: 'https://login.live.com/oauth20_authorize.srf',
                    redirectUri: window.location.origin,
                    requiredUrlParams: ['display', 'scope'],
                    scope: ['wl.emails'],
                    scopeDelimiter: ' ',
                    display: 'popup',
                    oauthType: '2.0',
                    popupOptions: { width: 500, height: 560 }
                },
                yahoo: {
                    name: 'yahoo',
                    url: '/auth/yahoo',
                    authorizationEndpoint: 'https://api.login.yahoo.com/oauth2/request_auth',
                    redirectUri: window.location.origin,
                    scope: [],
                    scopeDelimiter: ',',
                    oauthType: '2.0',
                    popupOptions: { width: 559, height: 519 }
                },
                bitbucket: {
                    name: 'bitbucket',
                    url: '/auth/bitbucket',
                    authorizationEndpoint: 'https://bitbucket.org/site/oauth2/authorize',
                    redirectUri: window.location.origin + '/',
                    requiredUrlParams: ['scope'],
                    scope: ['email'],
                    scopeDelimiter: ' ',
                    oauthType: '2.0',
                    popupOptions: { width: 1028, height: 529 }
                },
                spotify: {
                    name: 'spotify',
                    url: '/auth/spotify',
                    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
                    redirectUri: window.location.origin,
                    optionalUrlParams: ['state'],
                    requiredUrlParams: ['scope'],
                    scope: ['user-read-email'],
                    scopePrefix: '',
                    scopeDelimiter: ',',
                    oauthType: '2.0',
                    popupOptions: { width: 500, height: 530 },
                    state: function () { return encodeURIComponent(Math.random().toString(36).substr(2)); }
                }
            };
            this.httpInterceptor = function () { return true; };
        }
        Object.defineProperty(Config, "getConstant", {
            get: function () {
                return new Config();
            },
            enumerable: true,
            configurable: true
        });
        return Config;
    }());
    ;

    var loginDirective = function (){
        return {
            restrict: 'A',
            template: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="viewport" content="width=320,initial-scale=1"></head><body style="background:#e4e7ec;font-family:\'Open Sans\',sans-serif"><style type="text/css"></style><div class="container" id="auth"><div class="row"><div class="center-form panel" style="border-color:#cfd9D7;border-radius:2px;box-shadow:0 8px 17px rgba(0,0,0,.2);margin:12% auto;width:330px"><div class="panel-body"><h2 class="text-center" style="font-family:Montserrat,sans-serif;font-weight:700">Log in</h2><form method="post" ng-submit="login()" name="loginForm"><div class="form-group has-feedback"><input class="form-control input-lg" type="text" name="email" ng-model="email" placeholder="Email" required="" autofocus="" style="border-radius:0;padding-left:42.5px"> <span class="ion-at form-control-feedback" style="color:#555;font-size:1.2em;height:46px;left:0;line-height:46px;top:0;width:46px"></span></div><div class="form-group has-feedback"><input class="form-control input-lg" type="password" name="password" ng-model="password" placeholder="Password" required="" style="border-radius:0;padding-left:42.5px"> <span class="ion-key form-control-feedback" style="color:#555;font-size:1.2em;height:46px;left:0;line-height:46px;top:0;width:46px"></span></div><button ng-click="auth.login()" ng-disabled="loginForm.$invalid" class="btn btn-lg btn-block btn-success" style="background-color:#0f9d58;border-radius:2px;box-shadow:0 2px 5px 0 rgba(0,0,0,.26);font-size:14px;font-weight:700">Log in</button><br><p class="text-center text-muted" style="color:#90939a"><small>Don\'t have an account yet? <a href="/#/register" style="color:#000">Sign up</a></small></p><div class="signup-or-separator" style="background:0 0;height:34px;position:relative;text-align:center"><h6 class="text" style="background-color:#fff;display:inline-block;font-family:Montserrat,sans-serif;font-weight:700;margin:0;padding:8px">or</h6><hr style="border-top:1px solid #dce0e0;margin:-16px auto 10px auto;width:90%"></div></form><button class="btn btn-block btn-facebook" ng-click="authenticate(\'facebook\')" style="background-color:#3b5998;border:1px solid #335190;border-radius:2px;box-shadow:0 2px 5px 0 rgba(0,0,0,.26);color:#fff;font-weight:700"><i class="ion-social-facebook" style="font-size:1.2em;margin-right:5px"></i> Sign in with Facebook</button> <button class="btn btn-block btn-google-plus" ng-click="auth.authenticate(\'google\')" style="background-color:#dd4b39;border:1px solid #d54331;border-radius:2px;box-shadow:0 2px 5px 0 rgba(0,0,0,.26);color:#fff;font-weight:700"><span class="ion-social-googleplus" style="font-size:1.2em;margin-right:5px"></span>Sign in with Google</button> <button class="btn btn-block btn-linkedin" ng-click="authenticate(\'linkedin\')" style="background-color:#007bb6;border:1px solid #0073ae;border-radius:2px;box-shadow:0 2px 5px 0 rgba(0,0,0,.26);color:#fff;font-weight:700"><i class="ion-social-linkedin" style="font-size:1.2em;margin-right:5px"></i> Sign in with LinkedIn</button> <button class="btn btn-block btn-twitter" ng-click="authenticate(\'twitter\')" style="background-color:#00aced;border:1px solid #009fdb;border-radius:2px;box-shadow:0 2px 5px 0 rgba(0,0,0,.26);color:#fff;font-weight:700"><i class="ion-social-twitter" style="font-size:1.2em;margin-right:5px"></i> Sign in with Twitter</button> <button class="btn btn-block btn-github" ng-click="authenticate(\'github\')" style="background-color:#444;border:1px solid #3b3b3b;border-radius:2px;box-shadow:0 2px 5px 0 rgba(0,0,0,.26);color:#fff;font-weight:700"><i class="ion-social-github" style="font-size:1.2em;margin-right:5px"></i> Sign in with GitHub</button></div></div></div></div></body></html>',
            controllerAs: 'auth',
            controller: function($rootScope, $scope, $state, $auth, AuthAwesome) {
                $scope.email = 'test@test.com';
                $scope.password = '1234';

                function handleError(err) {
                    console.log(err.data.message);
                }

                function handleSuccess(res) {
                    console.log(res);
                    $auth.setToken(res.data.token);
                    $state.go(AuthAwesome.homePageState);
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
            }
        }
    };

    var registerDirective = function (){
        return {
            restrict: 'A',
            template: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="viewport" content="width=320,initial-scale=1"></head><body style="background:#e4e7ec;font-family:\'Open Sans\',sans-serif"><style type="text/css"></style><div class="container"><div class="row"><div class="center-form panel" style="border-color:#cfd9D7;border-radius:2px;box-shadow:0 8px 17px rgba(0,0,0,.2);margin:12% auto;width:330px"><div class="panel-body"><h2 class="text-center" style="font-family:Montserrat,sans-serif;font-weight:700">Sign up</h2><form method="post" ng-submit="signup()" name="signupForm"><div class="form-group has-feedback" ng-class="{ \'has-error\' : signupForm.displayName.$invalid && signupForm.displayName.$dirty }"><input class="form-control input-lg" type="text" name="displayName" ng-model="user.displayName" placeholder="Name" required="" autofocus="" style="border-radius:0;padding-left:42.5px"> <span class="ion-person form-control-feedback" style="color:#555;font-size:1.2em;height:46px;left:0;line-height:46px;top:0;width:46px"></span><div class="help-block text-danger" ng-if="signupForm.displayName.$dirty" ng-messages="signupForm.displayName.$error"><div ng-message="required">You must enter your name.</div></div></div><div class="form-group has-feedback" ng-class="{ \'has-error\' : signupForm.email.$invalid && signupForm.email.$dirty }"><input class="form-control input-lg" type="email" id="email" name="email" ng-model="user.email" placeholder="Email" required="" style="border-radius:0;padding-left:42.5px"> <span class="ion-at form-control-feedback" style="color:#555;font-size:1.2em;height:46px;left:0;line-height:46px;top:0;width:46px"></span><div class="help-block text-danger" ng-if="signupForm.email.$dirty" ng-messages="signupForm.email.$error"><div ng-message="required">Your email address is required.</div><div ng-message="pattern">Your email address is invalid.</div></div></div><div class="form-group has-feedback" ng-class="{ \'has-error\' : signupForm.password.$invalid && signupForm.password.$dirty }"><input password-strength="" class="form-control input-lg" type="password" name="password" ng-model="user.password" placeholder="Password" required="" style="border-radius:0;padding-left:42.5px"> <span class="ion-key form-control-feedback" style="color:#555;font-size:1.2em;height:46px;left:0;line-height:46px;top:0;width:46px"></span><div class="help-block text-danger" ng-if="signupForm.password.$dirty" ng-messages="signupForm.password.$error"><div ng-message="required">Password is required.</div></div></div><div class="form-group has-feedback" ng-class="{ \'has-error\' : signupForm.confirmPassword.$invalid && signupForm.confirmPassword.$dirty }"><input password-match="user.password" class="form-control input-lg" type="password" name="confirmPassword" ng-model="confirmPassword" placeholder="Confirm Password" style="border-radius:0;padding-left:42.5px"> <span class="ion-key form-control-feedback" style="color:#555;font-size:1.2em;height:46px;left:0;line-height:46px;top:0;width:46px"></span><div class="help-block text-danger" ng-if="signupForm.confirmPassword.$dirty" ng-messages="signupForm.confirmPassword.$error"><div ng-message="compareTo">Password must match.</div></div></div><p class="text-center text-muted" style="color:#90939a"><small>By clicking on Sign up, you agree to <a href="#" style="color:#000">terms &amp;amp; conditions</a> and <a href="#" style="color:#000">privacy policy</a></small></p><button type="submit" ng-disabled="signupForm.$invalid" class="btn btn-lg btn-block btn-primary" style="background-color:#4285f4;border-radius:2px;box-shadow:0 2px 5px 0 rgba(0,0,0,.26);font-size:14px;font-weight:700">Sign up</button><br><p class="text-center text-muted" style="color:#90939a">Already have an account? <a href="/#/login" style="color:#000">Log in now</a></p></form></div></div></div></div></body></html>',
            // controllerAs: 'auth',
            controller: function($rootScope, $scope, $state, $auth, AuthAwesome) {
                $scope.signup = function() {
                    $auth.signup($scope.user).then(function(response) {
                      $auth.setToken(response);
                      $rootScope.$broadcast('auth:user-register-success', response);
                    })
                    .catch(function(response, toastr) {
                      $rootScope.$broadcast('auth:user-register-failed', response);
                    });
                };
            }
        }
    };

    var AuthProvider = (function () {
        function AuthProvider(AuthAwesome) {
            this.AuthAwesome = AuthAwesome;
        }
        Object.defineProperty(AuthProvider.prototype, "baseUrl", {
            get: function () { return this.AuthAwesome.baseUrl; },
            set: function (value) { this.AuthAwesome.baseUrl = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "loginUrl", {
            get: function () { return this.AuthAwesome.loginUrl; },
            set: function (value) { this.AuthAwesome.loginUrl = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "signupUrl", {
            get: function () { return this.AuthAwesome.signupUrl; },
            set: function (value) { this.AuthAwesome.signupUrl = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "unlinkUrl", {
            get: function () { return this.AuthAwesome.unlinkUrl; },
            set: function (value) { this.AuthAwesome.unlinkUrl = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "tokenRoot", {
            get: function () { return this.AuthAwesome.tokenRoot; },
            set: function (value) { this.AuthAwesome.tokenRoot = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "tokenName", {
            get: function () { return this.AuthAwesome.tokenName; },
            set: function (value) { this.AuthAwesome.tokenName = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "tokenPrefix", {
            get: function () { return this.AuthAwesome.tokenPrefix; },
            set: function (value) { this.AuthAwesome.tokenPrefix = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "tokenHeader", {
            get: function () { return this.AuthAwesome.tokenHeader; },
            set: function (value) { this.AuthAwesome.tokenHeader = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "tokenType", {
            get: function () { return this.AuthAwesome.tokenType; },
            set: function (value) { this.AuthAwesome.tokenType = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "withCredentials", {
            get: function () { return this.AuthAwesome.withCredentials; },
            set: function (value) { this.AuthAwesome.withCredentials = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "storageType", {
            get: function () { return this.AuthAwesome.storageType; },
            set: function (value) { this.AuthAwesome.storageType = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "httpInterceptor", {
            get: function () { return this.AuthAwesome.httpInterceptor; },
            set: function (value) {
                if (typeof value === 'function') {
                    this.AuthAwesome.httpInterceptor = value;
                }
                else {
                    this.AuthAwesome.httpInterceptor = function () { return value; };
                }
            },
            enumerable: true,
            configurable: true
        });
        AuthProvider.prototype.facebook = function (options) {
            angular.extend(this.AuthAwesome.providers.facebook, options);
        };
        AuthProvider.prototype.google = function (options) {
            angular.extend(this.AuthAwesome.providers.google, options);
        };
        AuthProvider.prototype.github = function (options) {
            angular.extend(this.AuthAwesome.providers.github, options);
        };
        AuthProvider.prototype.instagram = function (options) {
            angular.extend(this.AuthAwesome.providers.instagram, options);
        };
        AuthProvider.prototype.linkedin = function (options) {
            angular.extend(this.AuthAwesome.providers.linkedin, options);
        };
        AuthProvider.prototype.twitter = function (options) {
            angular.extend(this.AuthAwesome.providers.twitter, options);
        };
        AuthProvider.prototype.twitch = function (options) {
            angular.extend(this.AuthAwesome.providers.twitch, options);
        };
        AuthProvider.prototype.live = function (options) {
            angular.extend(this.AuthAwesome.providers.live, options);
        };
        AuthProvider.prototype.yahoo = function (options) {
            angular.extend(this.AuthAwesome.providers.yahoo, options);
        };
        AuthProvider.prototype.bitbucket = function (options) {
            angular.extend(this.AuthAwesome.providers.bitbucket, options);
        };
        AuthProvider.prototype.spotify = function (options) {
            angular.extend(this.AuthAwesome.providers.spotify, options);
        };
        AuthProvider.prototype.oauth1 = function (options) {
            this.AuthAwesome.providers[options.name] = angular.extend(options, {
                oauthType: '1.0'
            });
        };
        AuthProvider.prototype.oauth2 = function (options) {
            this.AuthAwesome.providers[options.name] = angular.extend(options, {
                oauthType: '2.0'
            });
        };
        AuthProvider.prototype.$get = function (AuthAwesomeShared, AuthAwesomeLocal, AuthAwesomeOAuth) {
            return {
                login: function (user, options) { return AuthAwesomeLocal.login(user, options); },
                signup: function (user, options) { return AuthAwesomeLocal.signup(user, options); },
                logout: function () { return AuthAwesomeShared.logout(); },
                authenticate: function (name, data) { return AuthAwesomeOAuth.authenticate(name, data); },
                link: function (name, data) { return AuthAwesomeOAuth.authenticate(name, data); },
                unlink: function (name, options) { return AuthAwesomeOAuth.unlink(name, options); },
                isAuthenticated: function () { return AuthAwesomeShared.isAuthenticated(); },
                getPayload: function () { return AuthAwesomeShared.getPayload(); },
                getToken: function () { return AuthAwesomeShared.getToken(); },
                setToken: function (token) { return AuthAwesomeShared.setToken({ access_token: token }); },
                removeToken: function () { return AuthAwesomeShared.removeToken(); },
                setStorageType: function (type) { return AuthAwesomeShared.setStorageType(type); }
            };
        };
        AuthProvider.$inject = ['AuthAwesome'];
        return AuthProvider;
    }());
    AuthProvider.prototype.$get.$inject = ['AuthAwesomeShared', 'AuthAwesomeLocal', 'AuthAwesomeOAuth'];

    function joinUrl(baseUrl, url) {
        if (/^(?:[a-z]+:)?\/\//i.test(url)) {
            return url;
        }
        var joined = [baseUrl, url].join('/');
        var normalize = function (str) {
            return str
                .replace(/[\/]+/g, '/')
                .replace(/\/\?/g, '?')
                .replace(/\/\#/g, '#')
                .replace(/\:\//g, '://');
        };
        return normalize(joined);
    }
    function getFullUrlPath(location) {
        var isHttps = location.protocol === 'https:';
        return location.protocol + '//' + location.hostname +
            ':' + (location.port || (isHttps ? '443' : '80')) +
            (/^\//.test(location.pathname) ? location.pathname : '/' + location.pathname);
    }
    function parseQueryString(str) {
        var obj = {};
        var key;
        var value;
        angular.forEach((str || '').split('&'), function (keyValue) {
            if (keyValue) {
                value = keyValue.split('=');
                key = decodeURIComponent(value[0]);
                obj[key] = angular.isDefined(value[1]) ? decodeURIComponent(value[1]) : true;
            }
        });
        return obj;
    }
    function decodeBase64(str) {
        var buffer;
        if (typeof module !== 'undefined' && module.exports) {
            try {
                buffer = require('buffer').Buffer;
            }
            catch (err) {
            }
        }
        var fromCharCode = String.fromCharCode;
        var re_btou = new RegExp([
            '[\xC0-\xDF][\x80-\xBF]',
            '[\xE0-\xEF][\x80-\xBF]{2}',
            '[\xF0-\xF7][\x80-\xBF]{3}'
        ].join('|'), 'g');
        var cb_btou = function (cccc) {
            switch (cccc.length) {
                case 4:
                    var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                        | ((0x3f & cccc.charCodeAt(1)) << 12)
                        | ((0x3f & cccc.charCodeAt(2)) << 6)
                        | (0x3f & cccc.charCodeAt(3));
                    var offset = cp - 0x10000;
                    return (fromCharCode((offset >>> 10) + 0xD800)
                        + fromCharCode((offset & 0x3FF) + 0xDC00));
                case 3:
                    return fromCharCode(((0x0f & cccc.charCodeAt(0)) << 12)
                        | ((0x3f & cccc.charCodeAt(1)) << 6)
                        | (0x3f & cccc.charCodeAt(2)));
                default:
                    return fromCharCode(((0x1f & cccc.charCodeAt(0)) << 6)
                        | (0x3f & cccc.charCodeAt(1)));
            }
        };
        var btou = function (b) {
            return b.replace(re_btou, cb_btou);
        };
        var _decode = buffer ? function (a) {
            return (a.constructor === buffer.constructor
                ? a : new buffer(a, 'base64')).toString();
        }
            : function (a) {
                return btou(atob(a));
            };
        return _decode(String(str).replace(/[-_]/g, function (m0) {
            return m0 === '-' ? '+' : '/';
        })
            .replace(/[^A-Za-z0-9\+\/]/g, ''));
    }

    var Shared = (function () {
        function Shared($q, $window, AuthAwesome, AuthAwesomeStorage) {
            this.$q = $q;
            this.$window = $window;
            this.AuthAwesome = AuthAwesome;
            this.AuthAwesomeStorage = AuthAwesomeStorage;
            var _a = this.AuthAwesome, tokenName = _a.tokenName, tokenPrefix = _a.tokenPrefix;
            this.prefixedTokenName = tokenPrefix ? [tokenPrefix, tokenName].join('_') : tokenName;
        }
        Shared.prototype.getToken = function () {
            return this.AuthAwesomeStorage.get(this.prefixedTokenName);
        };
        Shared.prototype.getPayload = function () {
            var token = this.AuthAwesomeStorage.get(this.prefixedTokenName);
            if (token && token.split('.').length === 3) {
                try {
                    var base64Url = token.split('.')[1];
                    var base64 = base64Url.replace('-', '+').replace('_', '/');
                    return JSON.parse(decodeBase64(base64));
                }
                catch (e) {
                }
            }
        };
        Shared.prototype.setToken = function (response) {
            var tokenRoot = this.AuthAwesome.tokenRoot;
            var tokenName = this.AuthAwesome.tokenName;
            var accessToken = response && response.access_token;
            var token;
            if (accessToken) {
                if (angular.isObject(accessToken) && angular.isObject(accessToken.data)) {
                    response = accessToken;
                }
                else if (angular.isString(accessToken)) {
                    token = accessToken;
                }
            }
            if (!token && response) {
                var tokenRootData = tokenRoot && tokenRoot.split('.').reduce(function (o, x) { return o[x]; }, response.data);
                token = tokenRootData ? tokenRootData[tokenName] : response.data && response.data[tokenName];
            }
            if (token) {
                this.AuthAwesomeStorage.set(this.prefixedTokenName, token);
            }
        };
        Shared.prototype.removeToken = function () {
            this.AuthAwesomeStorage.remove(this.prefixedTokenName);
        };
        Shared.prototype.isAuthenticated = function () {
            var token = this.AuthAwesomeStorage.get(this.prefixedTokenName);
            if (token) {
                if (token.split('.').length === 3) {
                    try {
                        var base64Url = token.split('.')[1];
                        var base64 = base64Url.replace('-', '+').replace('_', '/');
                        var exp = JSON.parse(this.$window.atob(base64)).exp;
                        if (typeof exp === 'number') {
                            return Math.round(new Date().getTime() / 1000) < exp;
                        }
                    }
                    catch (e) {
                        return true; // Pass: Non-JWT token that looks like JWT
                    }
                }
                return true; // Pass: All other tokens
            }
            return false; // Fail: No token at all
        };
        Shared.prototype.logout = function () {
            this.AuthAwesomeStorage.remove(this.prefixedTokenName);
            return this.$q.when();
        };
        Shared.prototype.setStorageType = function (type) {
            this.AuthAwesome.storageType = type;
        };
        Shared.$inject = ['$q', '$window', 'AuthAwesome', 'AuthAwesomeStorage'];
        return Shared;
    }());

    var Local = (function () {
        function Local($http, AuthAwesome, AuthAwesomeShared) {
            this.$http = $http;
            this.AuthAwesome = AuthAwesome;
            this.AuthAwesomeShared = AuthAwesomeShared;
        }
        Local.prototype.login = function (user, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            options.url = options.url ? options.url : joinUrl(this.AuthAwesome.baseUrl, this.AuthAwesome.loginUrl);
            options.data = user || options.data;
            options.method = options.method || 'POST';
            options.withCredentials = options.withCredentials || this.AuthAwesome.withCredentials;
            return this.$http(options).then(function (response) {
                _this.AuthAwesomeShared.setToken(response);
                return response;
            });
        };
        Local.prototype.signup = function (user, options) {
            if (options === void 0) { options = {}; }
            options.url = options.url ? options.url : joinUrl(this.AuthAwesome.baseUrl, this.AuthAwesome.signupUrl);
            options.data = user || options.data;
            options.method = options.method || 'POST';
            options.withCredentials = options.withCredentials || this.AuthAwesome.withCredentials;
            return this.$http(options);
        };
        Local.$inject = ['$http', 'AuthAwesome', 'AuthAwesomeShared'];
        return Local;
    }());

    var Popup = (function () {
        function Popup($interval, $window, $q) {
            this.$interval = $interval;
            this.$window = $window;
            this.$q = $q;
            this.popup = null;
            this.defaults = {
                redirectUri: null
            };
        }
        Popup.prototype.stringifyOptions = function (options) {
            var parts = [];
            angular.forEach(options, function (value, key) {
                parts.push(key + '=' + value);
            });
            return parts.join(',');
        };
        Popup.prototype.open = function (url, name, popupOptions, redirectUri, dontPoll) {
            var width = popupOptions.width || 500;
            var height = popupOptions.height || 500;
            var options = this.stringifyOptions({
                width: width,
                height: height,
                top: this.$window.screenY + ((this.$window.outerHeight - height) / 2.5),
                left: this.$window.screenX + ((this.$window.outerWidth - width) / 2)
            });
            var popupName = this.$window['cordova'] || this.$window.navigator.userAgent.indexOf('CriOS') > -1 ? '_blank' : name;
            this.popup = this.$window.open(url, popupName, options);
            if (this.popup && this.popup.focus) {
                this.popup.focus();
            }
            if (dontPoll) {
                return;
            }
            if (this.$window['cordova']) {
                return this.eventListener(redirectUri);
            }
            else {
                if (url === 'about:blank') {
                    this.popup.location = url;
                }
                return this.polling(redirectUri);
            }
        };
        Popup.prototype.polling = function (redirectUri) {
            var _this = this;
            return this.$q(function (resolve, reject) {
                var redirectUriParser = document.createElement('a');
                redirectUriParser.href = redirectUri;
                var redirectUriPath = getFullUrlPath(redirectUriParser);
                var polling = _this.$interval(function () {
                    if (!_this.popup || _this.popup.closed || _this.popup.closed === undefined) {
                        _this.$interval.cancel(polling);
                        reject(new Error('The popup window was closed'));
                    }
                    try {
                        var popupWindowPath = getFullUrlPath(_this.popup.location);
                        if (popupWindowPath === redirectUriPath) {
                            if (_this.popup.location.search || _this.popup.location.hash) {
                                var query = parseQueryString(_this.popup.location.search.substring(1).replace(/\/$/, ''));
                                var hash = parseQueryString(_this.popup.location.hash.substring(1).replace(/[\/$]/, ''));
                                var params = angular.extend({}, query, hash);
                                if (params.error) {
                                    reject(new Error(params.error));
                                }
                                else {
                                    resolve(params);
                                }
                            }
                            else {
                                reject(new Error('OAuth redirect has occurred but no query or hash parameters were found. ' +
                                    'They were either not set during the redirect, or were removed—typically by a ' +
                                    'routing library—before AuthAwesome could read it.'));
                            }
                            _this.$interval.cancel(polling);
                            _this.popup.close();
                        }
                    }
                    catch (error) {
                    }
                }, 500);
            });
        };
        Popup.prototype.eventListener = function (redirectUri) {
            var _this = this;
            return this.$q(function (resolve, reject) {
                _this.popup.addEventListener('loadstart', function (event) {
                    if (event.url.indexOf(redirectUri) !== 0) {
                        return;
                    }
                    var parser = document.createElement('a');
                    parser.href = event.url;
                    if (parser.search || parser.hash) {
                        var query = parseQueryString(parser.search.substring(1).replace(/\/$/, ''));
                        var hash = parseQueryString(parser.hash.substring(1).replace(/[\/$]/, ''));
                        var params = angular.extend({}, query, hash);
                        if (params.error) {
                            reject(new Error(params.error));
                        }
                        else {
                            resolve(params);
                        }
                        _this.popup.close();
                    }
                });
                _this.popup.addEventListener('loaderror', function () {
                    reject(new Error('Authorization failed'));
                });
                _this.popup.addEventListener('exit', function () {
                    reject(new Error('The popup window was closed'));
                });
            });
        };
        Popup.$inject = ['$interval', '$window', '$q'];
        return Popup;
    }());

    var OAuth1 = (function () {
        function OAuth1($http, $window, AuthAwesome, AuthAwesomePopup) {
            this.$http = $http;
            this.$window = $window;
            this.AuthAwesome = AuthAwesome;
            this.AuthAwesomePopup = AuthAwesomePopup;
            this.defaults = {
                name: null,
                url: null,
                authorizationEndpoint: null,
                scope: null,
                scopePrefix: null,
                scopeDelimiter: null,
                redirectUri: null,
                requiredUrlParams: null,
                defaultUrlParams: null,
                oauthType: '1.0',
                popupOptions: { width: null, height: null }
            };
        }
        ;
        OAuth1.prototype.init = function (options, userData) {
            var _this = this;
            angular.extend(this.defaults, options);
            var name = options.name, popupOptions = options.popupOptions;
            var redirectUri = this.defaults.redirectUri;
            // Should open an empty popup and wait until request token is received
            if (!this.$window['cordova']) {
                this.AuthAwesomePopup.open('about:blank', name, popupOptions, redirectUri, true);
            }
            return this.getRequestToken().then(function (response) {
                return _this.openPopup(options, response).then(function (popupResponse) {
                    return _this.exchangeForToken(popupResponse, userData);
                });
            });
        };
        OAuth1.prototype.openPopup = function (options, response) {
            var url = [options.authorizationEndpoint, this.buildQueryString(response.data)].join('?');
            var redirectUri = this.defaults.redirectUri;
            if (this.$window['cordova']) {
                return this.AuthAwesomePopup.open(url, options.name, options.popupOptions, redirectUri);
            }
            else {
                this.AuthAwesomePopup.popup.location = url;
                return this.AuthAwesomePopup.polling(redirectUri);
            }
        };
        OAuth1.prototype.getRequestToken = function () {
            var url = this.AuthAwesome.baseUrl ? joinUrl(this.AuthAwesome.baseUrl, this.defaults.url) : this.defaults.url;
            return this.$http.post(url, this.defaults);
        };
        OAuth1.prototype.exchangeForToken = function (oauthData, userData) {
            var payload = angular.extend({}, userData, oauthData);
            var exchangeForTokenUrl = this.AuthAwesome.baseUrl ? joinUrl(this.AuthAwesome.baseUrl, this.defaults.url) : this.defaults.url;
            return this.$http.post(exchangeForTokenUrl, payload, { withCredentials: this.AuthAwesome.withCredentials });
        };
        OAuth1.prototype.buildQueryString = function (obj) {
            var str = [];
            angular.forEach(obj, function (value, key) {
                str.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            });
            return str.join('&');
        };
        OAuth1.$inject = ['$http', '$window', 'AuthAwesome', 'AuthAwesomePopup'];
        return OAuth1;
    }());

    var OAuth2 = (function () {
        function OAuth2($http, $window, $timeout, $q, AuthAwesome, AuthAwesomePopup, AuthAwesomeStorage) {
            this.$http = $http;
            this.$window = $window;
            this.$timeout = $timeout;
            this.$q = $q;
            this.AuthAwesome = AuthAwesome;
            this.AuthAwesomePopup = AuthAwesomePopup;
            this.AuthAwesomeStorage = AuthAwesomeStorage;
            this.defaults = {
                name: null,
                url: null,
                clientId: null,
                authorizationEndpoint: null,
                redirectUri: null,
                scope: null,
                scopePrefix: null,
                scopeDelimiter: null,
                state: null,
                requiredUrlParams: null,
                defaultUrlParams: ['response_type', 'client_id', 'redirect_uri'],
                responseType: 'code',
                responseParams: {
                    code: 'code',
                    clientId: 'clientId',
                    redirectUri: 'redirectUri'
                },
                oauthType: '2.0',
                popupOptions: { width: null, height: null }
            };
        }
        OAuth2.camelCase = function (name) {
            return name.replace(/([\:\-\_]+(.))/g, function (_, separator, letter, offset) {
                return offset ? letter.toUpperCase() : letter;
            });
        };
        OAuth2.prototype.init = function (options, userData) {
            var _this = this;
            return this.$q(function (resolve, reject) {
                angular.extend(_this.defaults, options);
                var stateName = _this.defaults.name + '_state';
                var _a = _this.defaults, name = _a.name, state = _a.state, popupOptions = _a.popupOptions, redirectUri = _a.redirectUri, responseType = _a.responseType;
                if (typeof state === 'function') {
                    _this.AuthAwesomeStorage.set(stateName, state());
                }
                else if (typeof state === 'string') {
                    _this.AuthAwesomeStorage.set(stateName, state);
                }
                var url = [_this.defaults.authorizationEndpoint, _this.buildQueryString()].join('?');
                _this.AuthAwesomePopup.open(url, name, popupOptions, redirectUri).then(function (oauth) {
                    if (responseType === 'token' || !url) {
                        return resolve(oauth);
                    }
                    if (oauth.state && oauth.state !== _this.AuthAwesomeStorage.get(stateName)) {
                        return reject(new Error('The value returned in the state parameter does not match the state value from your original ' +
                            'authorization code request.'));
                    }
                    resolve(_this.exchangeForToken(oauth, userData));
                }).catch(function (error) { return reject(error); });
            });
        };
        OAuth2.prototype.exchangeForToken = function (oauthData, userData) {
            var _this = this;
            var payload = angular.extend({}, userData);
            angular.forEach(this.defaults.responseParams, function (value, key) {
                switch (key) {
                    case 'code':
                        payload[value] = oauthData.code;
                        break;
                    case 'clientId':
                        payload[value] = _this.defaults.clientId;
                        break;
                    case 'redirectUri':
                        payload[value] = _this.defaults.redirectUri;
                        break;
                    default:
                        payload[value] = oauthData[key];
                }
            });
            if (oauthData.state) {
                payload.state = oauthData.state;
            }
            var exchangeForTokenUrl = this.AuthAwesome.baseUrl ?
                joinUrl(this.AuthAwesome.baseUrl, this.defaults.url) :
                this.defaults.url;
            return this.$http.post(exchangeForTokenUrl, payload, { withCredentials: this.AuthAwesome.withCredentials });
        };
        OAuth2.prototype.buildQueryString = function () {
            var _this = this;
            var keyValuePairs = [];
            var urlParamsCategories = ['defaultUrlParams', 'requiredUrlParams', 'optionalUrlParams'];
            angular.forEach(urlParamsCategories, function (paramsCategory) {
                angular.forEach(_this.defaults[paramsCategory], function (paramName) {
                    var camelizedName = OAuth2.camelCase(paramName);
                    var paramValue = angular.isFunction(_this.defaults[paramName]) ? _this.defaults[paramName]() : _this.defaults[camelizedName];
                    if (paramName === 'redirect_uri' && !paramValue) {
                        return;
                    }
                    if (paramName === 'state') {
                        var stateName = _this.defaults.name + '_state';
                        paramValue = encodeURIComponent(_this.AuthAwesomeStorage.get(stateName));
                    }
                    if (paramName === 'scope' && Array.isArray(paramValue)) {
                        paramValue = paramValue.join(_this.defaults.scopeDelimiter);
                        if (_this.defaults.scopePrefix) {
                            paramValue = [_this.defaults.scopePrefix, paramValue].join(_this.defaults.scopeDelimiter);
                        }
                    }
                    keyValuePairs.push([paramName, paramValue]);
                });
            });
            return keyValuePairs.map(function (pair) { return pair.join('='); }).join('&');
        };
        OAuth2.$inject = ['$http', '$window', '$timeout', '$q', 'AuthAwesome', 'AuthAwesomePopup', 'AuthAwesomeStorage'];
        return OAuth2;
    }());

    var OAuth = (function () {
        function OAuth($http, $window, $timeout, $q, AuthAwesome, AuthAwesomePopup, AuthAwesomeStorage, AuthAwesomeShared, AuthAwesomeOAuth1, AuthAwesomeOAuth2) {
            this.$http = $http;
            this.$window = $window;
            this.$timeout = $timeout;
            this.$q = $q;
            this.AuthAwesome = AuthAwesome;
            this.AuthAwesomePopup = AuthAwesomePopup;
            this.AuthAwesomeStorage = AuthAwesomeStorage;
            this.AuthAwesomeShared = AuthAwesomeShared;
            this.AuthAwesomeOAuth1 = AuthAwesomeOAuth1;
            this.AuthAwesomeOAuth2 = AuthAwesomeOAuth2;
        }
        OAuth.prototype.authenticate = function (name, userData) {
            var _this = this;
            return this.$q(function (resolve, reject) {
                var provider = _this.AuthAwesome.providers[name];
                var oauth = null;
                switch (provider.oauthType) {
                    case '1.0':
                        oauth = new OAuth1(_this.$http, _this.$window, _this.AuthAwesome, _this.AuthAwesomePopup);
                        break;
                    case '2.0':
                        oauth = new OAuth2(_this.$http, _this.$window, _this.$timeout, _this.$q, _this.AuthAwesome, _this.AuthAwesomePopup, _this.AuthAwesomeStorage);
                        break;
                    default:
                        return reject(new Error('Invalid OAuth Type'));
                }
                return oauth.init(provider, userData).then(function (response) {
                    if (provider.url) {
                        _this.AuthAwesomeShared.setToken(response);
                    }
                    resolve(response);
                }).catch(function (error) {
                    reject(error);
                });
            });
        };
        OAuth.prototype.unlink = function (provider, httpOptions) {
            if (httpOptions === void 0) { httpOptions = {}; }
            httpOptions.url = httpOptions.url ? httpOptions.url : joinUrl(this.AuthAwesome.baseUrl, this.AuthAwesome.unlinkUrl);
            httpOptions.data = { provider: provider } || httpOptions.data;
            httpOptions.method = httpOptions.method || 'POST';
            httpOptions.withCredentials = httpOptions.withCredentials || this.AuthAwesome.withCredentials;
            return this.$http(httpOptions);
        };
        OAuth.$inject = [
            '$http',
            '$window',
            '$timeout',
            '$q',
            'AuthAwesome',
            'AuthAwesomePopup',
            'AuthAwesomeStorage',
            'AuthAwesomeShared',
            'AuthAwesomeOAuth1',
            'AuthAwesomeOAuth2'
        ];
        return OAuth;
    }());

    var Storage = (function () {
        function Storage($window, AuthAwesome) {
            this.$window = $window;
            this.AuthAwesome = AuthAwesome;
            this.memoryStore = {};
        }
        Storage.prototype.get = function (key) {
            try {
                return this.$window[this.AuthAwesome.storageType].getItem(key);
            }
            catch (e) {
                return this.memoryStore[key];
            }
        };
        Storage.prototype.set = function (key, value) {
            try {
                this.$window[this.AuthAwesome.storageType].setItem(key, value);
            }
            catch (e) {
                this.memoryStore[key] = value;
            }
        };
        Storage.prototype.remove = function (key) {
            try {
                this.$window[this.AuthAwesome.storageType].removeItem(key);
            }
            catch (e) {
                delete this.memoryStore[key];
            }
        };
        Storage.$inject = ['$window', 'AuthAwesome'];
        return Storage;
    }());

    var Interceptor = (function () {
        function Interceptor(AuthAwesome, AuthAwesomeShared, AuthAwesomeStorage) {
            var _this = this;
            this.AuthAwesome = AuthAwesome;
            this.AuthAwesomeShared = AuthAwesomeShared;
            this.AuthAwesomeStorage = AuthAwesomeStorage;
            this.request = function (config) {
                if (config['skipAuthorization']) {
                    return config;
                }
                if (_this.AuthAwesomeShared.isAuthenticated() && _this.AuthAwesome.httpInterceptor()) {
                    var tokenName = _this.AuthAwesome.tokenPrefix ?
                        [_this.AuthAwesome.tokenPrefix, _this.AuthAwesome.tokenName].join('_') : _this.AuthAwesome.tokenName;
                    var token = _this.AuthAwesomeStorage.get(tokenName);
                    if (_this.AuthAwesome.tokenHeader && _this.AuthAwesome.tokenType) {
                        token = _this.AuthAwesome.tokenType + ' ' + token;
                    }
                    config.headers[_this.AuthAwesome.tokenHeader] = token;
                }
                return config;
            };
        }
        Interceptor.Factory = function (AuthAwesome, AuthAwesomeShared, AuthAwesomeStorage) {
            return new Interceptor(AuthAwesome, AuthAwesomeShared, AuthAwesomeStorage);
        };
        Interceptor.$inject = ['AuthAwesome', 'AuthAwesomeShared', 'AuthAwesomeStorage'];
        return Interceptor;
    }());
    Interceptor.Factory.$inject = ['AuthAwesome', 'AuthAwesomeShared', 'AuthAwesomeStorage'];

    var HttpProviderConfig = (function () {
        function HttpProviderConfig($httpProvider) {
            this.$httpProvider = $httpProvider;
            $httpProvider.interceptors.push(Interceptor.Factory);
        }
        HttpProviderConfig.$inject = ['$httpProvider'];
        return HttpProviderConfig;
    }());

    angular.module('authAuwesome', [])
        .provider('$auth', ['AuthAwesome', function (AuthAwesome) { return new AuthProvider(AuthAwesome); }])
        .constant('AuthAwesome', Config.getConstant)
        .service('AuthAwesomeShared', Shared)
        .service('AuthAwesomeLocal', Local)
        .service('AuthAwesomePopup', Popup)
        .service('AuthAwesomeOAuth', OAuth)
        .service('AuthAwesomeOAuth2', OAuth2)
        .service('AuthAwesomeOAuth1', OAuth1)
        .service('AuthAwesomeStorage', Storage)
        .service('AuthAwesomeInterceptor', Interceptor)
        .directive('authAwesomeLogin', loginDirective)
        .directive('authAwesomeRegister', registerDirective)
        .config(['$httpProvider', function ($httpProvider) { return new HttpProviderConfig($httpProvider); }]);
    var ng1 = 'authAwesome';

    return ng1;

}));
//# sourceMappingURL=authAwesome.js.map
