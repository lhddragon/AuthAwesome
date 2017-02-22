'use strict';

angular.module('ng-gulp-hapi', [
  'app.directives',
  'app.filters',
  'app.resources',
  'app.services',
  'ngSanitize',
  'ui.bootstrap',
  'ui.router',
  'ui.lodash',
  'gettext',
  'ui.i18n',
  'ui.sortable',
  'ngPopup',
  'ngDock',
  'angular-jwt',
  'authAuwesome'
])
  .config(function ($urlRouterProvider, $httpProvider, $animateProvider, $authProvider, API_URL, $stateProvider) {
    $urlRouterProvider.otherwise('/login');

    $httpProvider.interceptors.push('httpInterceptor');

    $httpProvider.defaults.headers.post  = {'Content-Type': 'application/json; charset=utf-8'};

    $animateProvider.classNameFilter(/anim-/);

    $authProvider.loginUrl = API_URL + 'auth/login';
    $authProvider.signupUrl = API_URL + 'auth/register';

    $authProvider.google({
      clientId: '476692673943-stuidcbr8i88aog942rn3dm6ui9604i2.apps.googleusercontent.com',
      url: API_URL + 'auth/google'
    });

    $authProvider.facebook({
      clientId: '698580886903269',
      url: API_URL + 'auth/facebook'
    });

    $authProvider.existingStateProvider = $stateProvider;
    $authProvider.logoutRedirectUrl = '/login';



    //$httpProvider.interceptors.push('httpInterceptor');
    // $authProvider.configure({
    //   apiUrl:                  '/api',
    //   tokenValidationPath:     '/auth/validate_token',
    //   signOutUrl:              '/auth/sign_out',
    //   emailRegistrationPath:   '/auth',
    //   accountUpdatePath:       '/auth',
    //   accountDeletePath:       '/auth',
    //   confirmationSuccessUrl:  window.location.href,
    //   passwordResetPath:       '/auth/password',
    //   passwordUpdatePath:      '/auth/password',
    //   passwordResetSuccessUrl: window.location.href,
    //   emailSignInPath:         '/auth/sign_in',
    //   storage:                 'cookies',
    //   forceValidateToken:      false,
    //   validateOnPageLoad:      true,
    //   proxyIf:                 function() { return false; },
    //   proxyUrl:                '/proxy',
    //   omniauthWindowType:      'sameWindow',
    //   authProviderPaths: {
    //     github:   '/auth/github',
    //     facebook: '/auth/facebook',
    //     google:   '/auth/google',
    //     twitter:   '/auth/twitter'
    //   },
    //   tokenFormat: {
    //     'access-token': '{{ token }}',
    //     'token-type':   'Bearer',
    //     'client':       '{{ clientId }}',
    //     'expiry':       '{{ expiry }}',
    //     'uid':          '{{ uid }}'
    //   },
    //   cookieOps: {
    //     path: '/',
    //     expires: 9999,
    //     expirationUnit: 'days',
    //     secure: false,
    //     domain: 'domain.com'
    //   },
    //   createPopup: function(url) {
    //     return window.open(url, '_blank', 'closebuttoncaption=Cancel');
    //   },
    //   parseExpiry: function(headers) {
    //     // convert from UTC ruby (seconds) to UTC js (milliseconds)
    //     return (parseInt(headers['expiry']) * 1000) || null;
    //   },
    //   handleLoginResponse: function(response) {
    //     return response.data;
    //   },
    //   handleAccountUpdateResponse: function(response) {
    //     return response.data;
    //   },
    //   handleTokenValidationResponse: function(response) {
    //     return response.data;
    //   }
    // });

  })
  .constant('API_URL', 'http://localhost:3000/')
  .run(function (_, $rootScope, $state, gettextCatalog, $log, $window) {
    var params = $window.location.search.substring(1);

    if (params && $window.opener && $window.opener.location.origin === $window.location.origin) {
      var pair = params.split('=');
      var code = decodeURIComponent(pair[1]);

      $window.opener.postMessage(code, $window.location.origin);
    }

    $rootScope.$state = $state;
    $rootScope.loading = true;
    $rootScope.mode = 'SLD';
    $rootScope.stateClass = $state.current.name;

    $rootScope.$on('auth:user-register-success', function() {
        alert('Register success! Please check you email and verify before login!');
    });

    $rootScope.$on('auth:user-register-failed', function(response) {
        alert(response.data.message);
    });

    gettextCatalog.setCurrentLanguage('en-us');

    $rootScope.$on('$stateChangeStart', function (/*event, toState*/) {
      //save location.search so we can add it back after transition is
      //var search = $location.search();
      //
      //if (!_.isEmpty(search)) {
      //  vehicleConfig.set(search);
      //}
      //
      //locationSearch = vehicleConfig.get();
      $rootScope.loading = true;
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
      //debugger;
      console.log(toState.name);
      if (toState.name === 'main'){
        $rootScope.loading = false;
      }
      //restore all query string parameters back to $search.search
      //$location.search(locationSearch || {});
      $rootScope.stateClass = toState.name;
    });

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
       
      $log.error(error);
      // throw the error so we know what happened when trying to resolve properties and enter a state
      throw error;

    });

  });



