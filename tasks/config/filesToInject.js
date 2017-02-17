/**
 * Files injected into index.html by gulp-inject
 * used by tasks inject & watch
 */

module.exports = [
  'client/app.js',
  'client/lib/**/*.js',
  'client/components/**/*.js', '!client/components/**/*.spec.js',
  'client/directives/**/*.js', '!client/directives/**/*.spec.js',
  'client/filters/**/*.js', '!client/filters/**/*.spec.js',
  'client/resources/**/*.js', '!client/resources/**/*.spec.js',
  'client/services/**/*.js', '!client/services/**/*.spec.js',
  'client/views/**/*.js', '!client/views/**/*.spec.js', '!client/views/**/*.e2e.js',
  'client/modals/**/*.js', '!client/modals/**/*.spec.js', '!client/modals/**/*.e2e.js',
  
  '!client/resources/resources.module.js',
  '!client/services/services.module.js',
  '!client/directives/directives.module.js',
  '!client/filters/filters.module.js',
  'client/styles/css/layout-default-latest.css',
  'client/styles/css/LBV.css',
  'client/styles/css/D3_chart.css',
  'client/styles/css/ngPopupStyle.css',
  'client/styles/css/slick.grid.css',
  'client/styles/css/slick-examples.css',
  'client/styles/css/jquery-ui-1.10.0.custom.min.css',
  'client/styles/css/jquery.loadmask.css',
  'client/styles/css/layout.css',
  'client/styles/css/styles.css',
  'client/styles/css/ol.css',
  'client/styles/css/ol3-layerswitcher.css',
  'client/styles/css/toastr.css',
  // 'client/styles/css/login.css',
  // 'client/styles/css/app.css',
  // 'client/styles/css/Bootstrap_GISTIC.css'
];