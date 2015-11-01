'use strict';

angular.module('jukebuzz.panel', ['ngRoute'])
.controller('PanelCtrl', [
  '$scope',
  '$state',
  '$localStorage',
  'Auth',
  function($scope, $state, $localStorage, Auth) {
    $scope.logout = function(){
      Auth.logout(function(){
        window.location = "/";
      });
    };
    $scope.token = $localStorage.token;
    $scope.tokenClaims = Auth.getTokenClaims();
    if(!$scope.token){
      $state.go("signin");
    }
  }
]);