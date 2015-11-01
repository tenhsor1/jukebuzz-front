'use strict';

angular.module('jukebuzz.signup', ['ngRoute'])
.controller('SignUpCtrl', [
  '$scope',
  '$state',
  '$localStorage',
  'Auth',
  function($scope, $state, $localStorage, Auth) {
    function successAuth(res){
      $localStorage.token = res.token;
      $state.go('panel');
    }

    $scope.signup = function(){
      var formData = {
        email: $scope.email,
        password: $scope.password
      };
      Auth.signup(formData, successAuth, function(){
        $scope.error = 'Error al crear el usuario';
      });
    };

    $scope.token = $localStorage.token;
    $scope.tokenClaims = Auth.getTokenClaims();
  }
]);