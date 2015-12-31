'use strict';

angular.module('jukebuzz.signup', ['ngRoute'])
.controller('SignUpCtrl', [
  '$scope',
  '$state',
  '$http',
  '$localStorage',
  'Auth',
  'Errors',
  'urls',
  function($scope, $state, $http, $localStorage, Auth, Errors, urls) {

    $http.get(urls.BASE_API + '/countries')
      .success(function(result, status){
        $scope.countries = result.data;
      })
      .error(function(result, status){
        console.log(result);
      });

    $scope.populateStates = function(){
      var idCountry = $scope.user.country;
      if(idCountry){
        $http.get(urls.BASE_API + '/countries/' + idCountry + '/states')
        .success(function(result, status){
          $scope.states = result.data;
        })
        .error(function(result, status){
          console.log(result);
        });
      }else{
        $scope.states = [];
      }
    };

    $scope.submit = function(){
      if ($scope.form.$invalid) {
        $scope.form.errorMessage = 'Se encontraron errores en el formulario';
        return;
      }else{
        //if the form has valid information, then add the type of role
        //and try to create a new user
        $scope.user.role = 2;
        Auth.signup($scope.user,
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
            $scope.form.errorMessage = Errors.signup(error);
          }
        );
      }
    };

    $scope.token = $localStorage.token;
    $scope.tokenClaims = Auth.getTokenClaims();
  }
]);