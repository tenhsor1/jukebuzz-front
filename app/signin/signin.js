'use strict';

angular.module('jukebuzz.signin', ['ngRoute'])
.controller('SignInCtrl', [
  '$scope',
  '$state',
  '$localStorage',
  'Auth',
  function($scope, $state, $localStorage, Auth) {
    function successAuth(res){
      $localStorage.token = res.access;
      $state.go('panel');
    }

    $scope.signin = function(){
      var formData = {
        email: $scope.email,
        password: $scope.password
      };
      Auth.signin(formData, successAuth, function(){
        $scope.error = 'Usuario y/o Contraseña incorrectos';
      });
    };

    $scope.token = $localStorage.token;
    $scope.tokenClaims = Auth.getTokenClaims();
  }
]);