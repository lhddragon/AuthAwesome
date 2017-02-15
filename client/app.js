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
  'ng-token-auth',
  'angular-jwt'
])
  .config(function ($urlRouterProvider, $httpProvider, $animateProvider, $authProvider) {
    $urlRouterProvider.otherwise('/login');

    $httpProvider.interceptors.push('httpInterceptor');

    $httpProvider.defaults.headers.post  = {'Content-Type': 'application/x-www-form-urlencoded'};

    $animateProvider.classNameFilter(/anim-/);

    //$httpProvider.interceptors.push('httpInterceptor');
    $authProvider.configure({
      apiUrl:                  '/api',
      tokenValidationPath:     '/auth/validate_token',
      signOutUrl:              '/auth/sign_out',
      emailRegistrationPath:   '/auth',
      accountUpdatePath:       '/auth',
      accountDeletePath:       '/auth',
      confirmationSuccessUrl:  window.location.href,
      passwordResetPath:       '/auth/password',
      passwordUpdatePath:      '/auth/password',
      passwordResetSuccessUrl: window.location.href,
      emailSignInPath:         '/auth/sign_in',
      storage:                 'cookies',
      forceValidateToken:      false,
      validateOnPageLoad:      true,
      proxyIf:                 function() { return false; },
      proxyUrl:                '/proxy',
      omniauthWindowType:      'sameWindow',
      authProviderPaths: {
        github:   '/auth/github',
        facebook: '/auth/facebook',
        google:   '/auth/google',
        twitter:   '/auth/twitter'
      },
      tokenFormat: {
        'access-token': '{{ token }}',
        'token-type':   'Bearer',
        'client':       '{{ clientId }}',
        'expiry':       '{{ expiry }}',
        'uid':          '{{ uid }}'
      },
      cookieOps: {
        path: '/',
        expires: 9999,
        expirationUnit: 'days',
        secure: false,
        domain: 'domain.com'
      },
      createPopup: function(url) {
        return window.open(url, '_blank', 'closebuttoncaption=Cancel');
      },
      parseExpiry: function(headers) {
        // convert from UTC ruby (seconds) to UTC js (milliseconds)
        return (parseInt(headers['expiry']) * 1000) || null;
      },
      handleLoginResponse: function(response) {
        return response.data;
      },
      handleAccountUpdateResponse: function(response) {
        return response.data;
      },
      handleTokenValidationResponse: function(response) {
        return response.data;
      }
    });

  })
  .run(function (_, $rootScope, $state, gettextCatalog, $log) {
    toastr.options = {
        'closeButton': true,
        'debug': false,
        'progressBar': true,
        'positionClass': 'toast-bottom-right',
        'preventDuplicates': true,
        'onclick': null,
        'showDuration': '0',
        'hideDuration': '0',
        'timeOut': '5000',
        'extendedTimeOut': '0',
        'showEasing': 'swing',
        'hideEasing': 'linear',
        'showMethod': 'fadeIn',
        'hideMethod': 'fadeOut'
    };
    $rootScope.$state = $state;
    $rootScope.loading = true;
    $rootScope.mode = 'SLD';
    $rootScope.stateClass = $state.current.name;

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


//TODO: move to separate i18n file
angular.module('ng-gulp-hapi').config(function (i18nServiceProvider){
  var urlRoot = '/api/export/locale/';
  var English = 'en';
  var Chinese = 'zh';
  var endPoint = '.json?key=61046619b5620f332317a7e8492dae3d&index=name';

  $.ajax({
    method: 'GET',
    url: urlRoot + English + endPoint,
    context: this
  }).then(function(enresult) {
    var eni18n = JSON.parse(enresult);
    console.log(eni18n);
    $.ajax({
      method: 'GET',
      url: urlRoot + Chinese + endPoint,
      context: this
    }).then(function(zhresult) {
      var zhi18n = JSON.parse(zhresult);

      i18nServiceProvider.api.set('en-us');
      i18nServiceProvider.api.add(['en', 'en-us'],{
        labelText: eni18n
      });
      i18nServiceProvider.api.add('zh-cn',{
        labelText: zhi18n
      });

    });    
  });
});

