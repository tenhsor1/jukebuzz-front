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
    $urlRouterProvider.otherwise('/panel');

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
    })
    .state('edit-place', {
        url: '/places/:placeId',
        templateUrl: 'panel/partials/place-form.html',
        controller: 'PlaceCtrl',
        parent: 'panel',
    })
    .state('lists', {
        url: "/lists/",
        templateUrl: 'panel/partials/lists.html',
        parent: 'panel',
        controller:'ListsCtrl',
    })
    .state('add-list', {
        url: "/lists/new",
        templateUrl: 'panel/partials/list-form.html',
        parent: 'panel',
        controller:'ListCtrl',
    })
    .state('edit-list', {
        url: '/lists/:listId',
        templateUrl: 'panel/partials/list-form.html',
        controller: 'ListCtrl',
        parent: 'panel',
    })
    .state('jukeboxes', {
        url: "/jukeboxes/",
        templateUrl: 'panel/partials/jukeboxes.html',
        parent: 'panel',
        controller:'JukeboxesCtrl',
    })
    .state('add-jukebox', {
        url: "/jukeboxes/new",
        templateUrl: 'panel/partials/jukebox-form.html',
        parent: 'panel',
        controller:'JukeboxCtrl',
    })
    .state('edit-jukebox', {
        url: '/jukeboxes/:jukeboxId',
        templateUrl: 'panel/partials/jukebox-form.html',
        controller: 'JukeboxCtrl',
        parent: 'panel',
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
})
.directive('dropzone', function () {
  return function (scope, element, attrs) {
    var config, dropzone;

    config = scope[attrs.dropzone];

    // create a Dropzone for the element with the given options
    dropzone = new Dropzone(element[0], config.options);

    // bind the given event handlers
    angular.forEach(config.eventHandlers, function (handler, event) {
      dropzone.on(event, handler);
    });
  };
});