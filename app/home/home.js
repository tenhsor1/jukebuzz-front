'use strict';

angular.module('jukebuzz.home', ['ngRoute'])
.controller('HomeCtrl', ['$rootScope', '$scope', '$state', '$location', '$localStorage', 'Auth', 'Errors',
  function($rootScope, $scope, $state, $location, $localStorage, Auth, Errors) {
    $scope.login = function(){
      if ($scope.form.$invalid) {
        //$scope.form.errorMessage = 'Se encontraron errores en el formulario';
        return;
      }else{
        //if the form has valid information, then try to login
        Auth.signin($scope.credentials,
          function(result, status){
            //if the user was correctly created, then
            //save the token in local storage and redirect to the admin panel
            var data = result.data;
            var user = data.user;
            $localStorage.token = data.token;
            $localStorage.userId = user.id;

            $state.go("panel");
          },
          function(error, status){
            //if there is a new error, then Call the service Error
            //for handling the response from the server
            $scope.form.errorMessage = Errors.signin(error);
          }
        );
      }
    };

    $scope.token = $localStorage.token;
    $scope.tokenClaims = Auth.getTokenClaims();
  }
]);