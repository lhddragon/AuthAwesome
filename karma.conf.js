'use strict';

module.exports = function (config) {
  config.set({

    basePath: 'client',

    frameworks: ['jasmine'],

    preprocessors: {
      '**/*.html': ['ng-html2js'],
      'views/**/!(*spec|*mock).js': 'coverage',
      'services/**/!(*spec|*mock).js': 'coverage',
      'components/**/!(*spec|*mock).js': 'coverage',
      'directives/**/!(*spec|*mock).js': 'coverage',
      'resources/**/!(*spec|*mock).js': 'coverage'
    },

    coverageReporter: {
      type: 'html'
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: 'client/',
      moduleName: 'templates'
    },

    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-ng-html2js-preprocessor',
      'karma-coverage'
    ],

    files: [
      {pattern: 'mocks/**/*.json', included: false},
      'bower_components/lodash/lodash.js',
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-foundation/mm-foundation.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-ui-lodash/angular-ui-lodash.js',
      'bower_components/angular-ui-router/release/angular-ui-router.js',
      'bower_components/angular-ui-router-anim-in-out/anim-in-out.js',
      'bower_components/angular-foundation-toaster/toaster.js',
      'bower_components/angular-gettext/dist/angular-gettext.js',
      '../node_modules/jasmine-jquery/lib/jasmine-jquery.js',
      'components/**/*.js',
      'directives/directives.module.js',
      'directives/**/*.html',
      'directives/**/*.js',
      'filters/filters.module.js',
      'filters/**/*.js',
      'resources/resources.module.js',
      'resources/**/*.js',
      'services/services.module.js',
      'services/**/*.js',
      'views/**/*.js',
      'app.js'
    ],

    exclude: [
      'views/**/*.e2e.js'
    ],

    reporters: ['progress', 'coverage'],

    port: 9876,

    colors: true,

    // possible values:
    // config.LOG_DISABLE
    // config.LOG_ERROR
    // config.LOG_WARN
    // config.LOG_INFO
    // config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    autoWatch: false,

    browsers: ['PhantomJS'],

    singleRun: true
  });
};
