'use strict';

// Declare app level module which depends on views, and components
angular.module('jukebuzz', [
  'ngStorage',
  'ngRoute',
  'ui.router',
  'jukebuzz.home',
  'jukebuzz.signin',
  'jukebuzz.signup',
  'jukebuzz.panel',
])
.constant('urls', {
       BASE: 'http://localhost:9001/app',
       BASE_API: 'http://localhost:9000'
   })
.config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
  function($stateProvider, $urlRouterProvider, $httpProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'home/index.html',
      controller: 'HomeCtrl'
    })
    .state('signin', {
      url: '/signin',
      templateUrl: 'signin/index.html',
      controller: 'SignInCtrl'
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'signup/index.html',
      controller: 'SignUpCtrl'
    })
    .state('panel', {
      url: '/panel',
      templateUrl: 'panel/index.html',
      controller: 'PanelCtrl'
    });

    $httpProvider.interceptors.push(['$q', '$location', '$localStorage',
      function($q, $location, $localStorage){
        //return two functions, one for onbefore requests, and one for handling
        //errors
        return {
          'request': function(config){
            config.headers = config.headers || {};
            if($localStorage.token){
              config.headers.Authorization = 'Bearer ' + $localStorage.token;
            }
            return config;
          },
          'responseError': function(response){
            if(response.status == 401 || response.status == 403){
              $location.path('/signin');
            }
            return $q.reject(response);
          }
        };
      }
    ]);
  }
]);
