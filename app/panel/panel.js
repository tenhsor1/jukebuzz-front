'use strict';

angular.module('jukebuzz.panel', ['ngRoute'])
.controller('PanelCtrl', [
  '$scope',
  '$state',
  '$http',
  '$localStorage',
  'Auth',
  'urls',
  function($scope, $state, $http, $localStorage, Auth, urls) {
    $scope.logout = function(){
      Auth.logout(function(){
        $state.go('home');
      });
    };

    //get the user information
    $scope.user = {};
    $http.get(urls.BASE_API + '/user')
    .then(function(userResponse){ //get the user info and add a promise for getting places
      $scope.user = userResponse.data.data;
      //return a promise for geting the places of the admin
      return $http.get(urls.BASE_API + '/places?adminId=' + $scope.user.id);
    }).then(function(placesResponse){
      //resolve the promise of the places
      $scope.places = placesResponse.data.data;
      $scope.places.push({
        id: '+',
        name: 'Agrega un lugar'
      });
      console.log($localStorage.place);
      if($localStorage.place){
        $scope.placeSelected = $localStorage.place;
      }
    });

    $scope.changePlace = function(){
      if($scope.placeSelected == '+'){
        $state.go('new-place');
      }
      $localStorage.place = $scope.placeSelected;
    };
    //set the claims and tokens in the current scope
    $scope.token = $localStorage.token;
    $scope.tokenClaims = Auth.getTokenClaims();
    if(!$scope.token){
      $state.go("signin");
    }
  }
])
.controller('PlaceCtrl', [
  '$scope',
  '$state',
  '$stateParams',
  '$http',
  '$localStorage',
  'Auth',
  'urls',
  'globals',
  function($scope,
    $state,
    $stateParams,
    $http,
    $localStorage,
    Auth,
    urls,
    globals) {
    $scope.formPlace = {};
    if($stateParams.action == 'edit'){
      $scope.formPlace.action = 'Editar';
    }else{
      $scope.formPlace.action = 'Nuevo';
    }

    $http.get(urls.BASE_API + '/countries')
      .success(function(result, status){
        $scope.countries = result.data;
      })
      .error(function(result, status){
        console.log(result);
      });

    $scope.populateStates = function(){
      var idCountry = $scope.place.country;
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
        //if the form has valid information, then send the place to the api
        $http.post(urls.BASE_API + '/places', $scope.place)
        .then(function(placeResult){
          $scope.newPlace = placeResult.data.data;
          $localStorage.place = $scope.newPlace.id;
          $scope.$parent.places.push($scope.newPlace);
          $scope.$parent.placeSelected = $localStorage.place;

          $('#successModal').modal('show');
        }, function(placeError){
          console.log(placeError);
        });
      }
    };
    $scope.reloadPanel = function(){
      globals.reloadPanel();
    };
  }]);