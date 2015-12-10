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
    $scope.$state = $state;
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
  }])
.controller('ListsCtrl', [
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

    $scope.lists = [];
    $http.get(urls.BASE_API + '/lists')
    .then(function(listResults){
      $scope.lists = listResults.data.data;
      for(var i in $scope.lists){
        var m = moment.parseZone($scope.lists[i].createdAt);
        $scope.lists[i].createdAt = m.format("DD/MM/YYYY HH:mm:ss");
      }

      console.log($scope.lists);
    }, function(listError){
      console.log(listError);
    });

  }])
.controller('ListCtrl', [
  '$scope',
  '$state',
  '$stateParams',
  '$http',
  '$localStorage',
  '$timeout',
  'Auth',
  'urls',
  'globals',
  'id3Reader',
  function($scope,
    $state,
    $stateParams,
    $http,
    $localStorage,
    $timeout,
    Auth,
    urls,
    globals,
    id3Reader) {

    $scope.list = {};
    $scope.list.songs = [];
    $scope.formList = {};
    $scope.formList.warningMessage = '';
    if($stateParams.action == 'edit'){
      $scope.formList.action = 'Editar';
    }else{
      $scope.formList.action = 'Nueva';
    }

    $scope.submit = function(){
      if ($scope.form.$invalid) {
        $scope.form.errorMessage = 'Se encontraron errores en el formulario';
        return;
      }else if($scope.list.songs.length == 0){
        $scope.form.errorMessage = 'Agrega al menos una canción a tu lista de canciones';
      }else{
        //if the form has valid information, then send the new list to the api
        console.log($scope.list);
        $http.post(urls.BASE_API + '/lists', $scope.list)
        .then(function(listResult){
          $scope.newList = listResult.data.data;
          $('#successModal').modal('show');
        }, function(listError){
          console.log(listError);
        });
      }
    };

    $scope.reloadLists = function(){
      $state.go('lists');
    };

    function loadId3Tags(tags){
      console.log(tags);
      var songNode = document.getElementById('song-template').cloneNode(true);
      songNode.removeAttribute('id');

      var filename = tags.filename.replace(/\.[^/.]+$/, "");
      var alternativeArtist = filename.split('-')[0];
      var alternativeTitle = filename.split('-')[1];

      if(alternativeArtist){
        if(alternativeArtist.length <= 0){
          alternativeArtist = filename;
        }
      }else{
        alternativeArtist = filename;
      }
      if(alternativeTitle){
        if(alternativeTitle.length <= 0){
          alternativeTitle = filename;
        }
      }else{
        alternativeTitle = filename;
      }

      songNode.querySelector('.song-artist').innerHTML = tags.artist || alternativeArtist;
      songNode.querySelector('.song-title').innerHTML = tags.title || alternativeTitle;

      songNode.querySelector('.input-artist').innerHTML = tags.artist || alternativeArtist;
      songNode.querySelector('.input-title').innerHTML = tags.title || alternativeTitle;
      songNode.querySelector('.input-genre').innerHTML = tags.genre || "-";

      document.getElementById('show-songs').appendChild(songNode);
      var song = {
        'artist': tags.artist || alternativeArtist,
        'title': tags.title || alternativeTitle,
        'genre': tags.genre || "-"
      };
      $scope.list.songs.push(song);
    }

    function validateFile(file){
      var extension = file.name.substr((~-file.name.lastIndexOf(".") >>> 0) + 2);
      if(extension.toUpperCase() !== 'MP3'){

        $timeout (function () {
          $scope.formList.warningMessage = 'Todos los archivos seleccionados que ' +
                                      'no tienen extension MP3 fueron suprimidos';
        }, 0);
        console.log($scope.formList.warningMessage);
        return false;
      }
      return true;
    }

    $scope.dropzoneConfig = {
    'options': { // passed into the Dropzone constructor
      'url': '#',
      autoProcessQueue: false,
      dictDefaultMessage: 'Arrastra las canciones que deseas agregar a la lista',
      previewTemplate: document.querySelector('#preview-template').innerHTML,
    },
      'eventHandlers': {
        'addedfile': function(file){
          if(validateFile(file)){
            var filename = file.name;
            id3Reader.loadFromFile(file, loadId3Tags);
          }
        }
      }
    };

  }])
.controller('JukeboxesCtrl', [
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

    $scope.jukeboxes = [];
    $http.get(urls.BASE_API + '/jukeboxes')
    .then(function(jukeboxesResults){
      $scope.jukeboxes = jukeboxesResults.data.data;
      for(var i in $scope.jukeboxes){
        var m = moment.parseZone($scope.jukeboxes[i].expirationDate);
        $scope.jukeboxes[i].expirationDate = m.format("DD/MM/YYYY");
      }

      console.log($scope.jukeboxes);
    }, function(jukeboxError){
      console.log(jukeboxError);
    });

  }])
.controller('JukeboxCtrl', [
  '$scope',
  '$state',
  '$stateParams',
  '$http',
  '$localStorage',
  '$timeout',
  'Auth',
  'urls',
  'globals',
  'id3Reader',
  function($scope,
    $state,
    $stateParams,
    $http,
    $localStorage,
    $timeout,
    Auth,
    urls,
    globals,
    id3Reader) {

    $scope.list = {};
    $scope.list.songs = [];
    $scope.formList = {};
    $scope.formList.warningMessage = '';
    if($stateParams.action == 'edit'){
      $scope.formList.action = 'Editar';
    }else{
      $scope.formList.action = 'Nueva';
    }

    $scope.submit = function(){
      if ($scope.form.$invalid) {
        $scope.form.errorMessage = 'Se encontraron errores en el formulario';
        return;
      }else if($scope.list.songs.length == 0){
        $scope.form.errorMessage = 'Agrega al menos una canción a tu lista de canciones';
      }else{
        //if the form has valid information, then send the new list to the api
        console.log($scope.list);
        $http.post(urls.BASE_API + '/lists', $scope.list)
        .then(function(listResult){
          $scope.newList = listResult.data.data;
          $('#successModal').modal('show');
        }, function(listError){
          console.log(listError);
        });
      }
    };

    $scope.reloadJukeboxes = function(){
      $state.go('jukeboxes');
    };
  }]);