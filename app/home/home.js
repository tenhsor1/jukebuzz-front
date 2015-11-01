'use strict';

angular.module('jukebuzz.home', ['ngRoute'])
.controller('HomeCtrl', ['$rootScope', '$scope', '$localStorage', 'Auth',
  function($rootScope, $scope, $localStorage, Auth) {
    $scope.token = $localStorage.token;
    $scope.tokenClaims = Auth.getTokenClaims();
  }
]);