'use strict';

// Declare app level module which depends on views, and components
angular.module('jukebuzz', [
  'ngStorage',
  'ngRoute',
  'ngMessages',
  'ui.router',
  'jukebuzz.home',
  'jukebuzz.signup',
  'jukebuzz.panel',
])
.constant('urls', {
       BASE: 'http://localhost:9001/app',
       BASE_API: 'http://localhost:3000/v1'
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
      url: '/',
      templateUrl: 'home/index.html',
      controller: 'HomeCtrl'
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
    })
    .state('new-place', {
        url: "/places/",
        templateUrl: 'panel/partials/place-form.html',
        parent: 'panel',
        controller:'PlaceCtrl',
    });

    $httpProvider.interceptors.push(['$q', '$rootScope', '$location', '$localStorage', '$injector',
      function($q, $rootScope, $location, $localStorage, $injector){
        //return two functions, one for onbefore requests, and one for handling
        //errors
        return {
          'request': function(config){
            config.headers = config.headers || {};
            if($localStorage.token){
              config.headers.Authorization = 'JWT ' + $localStorage.token;
            }
            return config;
          },
          'responseError': function(response){
            if(response.status == 403){
              //$injector.get('$state').transitionTo('signin');
              /*$rootScope.$on('$stateChangeSuccess',
              function(event, toState, toParams, fromState, fromParams){
                //console.log($('#signinButton'));
              });*/
            }
            return $q.reject(response);
          }
        };
      }
    ]);
  }
])
.directive('compareTo', function() {
  return {
    require: "ngModel",
    scope: {
      otherModelValue: "=compareTo"
    },
    link: function(scope, element, attributes, ngModel) {

      ngModel.$validators.compareTo = function(modelValue) {
        return modelValue == scope.otherModelValue;
      };

      scope.$watch("otherModelValue", function() {
        ngModel.$validate();
      });
    }
  };
});