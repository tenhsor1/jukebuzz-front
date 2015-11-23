'use strict';
angular.module('jukebuzz')
.factory('Auth', [
  '$http',
  '$localStorage',
  'urls',
  function($http, $localStorage, urls){
    function urlBase64Decode(str){
      var output = str.replace('-', '+').replace('_', '/');
      switch (output.length % 4){
        case 0:
          break;
        case 2:
          output += '==';
          break;
        case 3:
          output += '=';
          break;
        default:
          throw 'Illegal base64url string';
      }
      return window.atob(output);
    }
    function getClaimsFromToken(){
      var token = $localStorage.token;
      var user = {};
      if(typeof token !== 'undefined'){
        var encoded = token.split('.')[1];
        user = JSON.parse(urlBase64Decode(encoded));
        console.log(user);
      }
      return user;
    }

    var tokenClaims = getClaimsFromToken();

    return {
      signup: function(data, success, error){
        $http.post(urls.BASE_API + '/auth/signup', data)
          .success(success)
          .error(error);
      },
      signin: function(data, success, error){
        $http.post(urls.BASE_API + '/auth/signin', data)
          .success(success)
          .error(error);
      },
      logout: function(success){
        tokenClaims = {};
        delete $localStorage.token;
        delete $localStorage.place;
        success();
      },
      getTokenClaims: function(){
        return tokenClaims;
      }
    };
  }
])
.factory('Errors', function(){
  return {
    signup: function(error){
      var data = error.data;
      if(data){
        if(data.summary){
          var invalidAttributes = data.invalidAttributes;
          var invAttr = "";
          //receive the invalid attributes, and iterate through them
          //for getting their names and sending them as a response
          for (var invalidAttribute in invalidAttributes) {
            if (invalidAttributes.hasOwnProperty(invalidAttribute)) {
              if(invalidAttribute == 'email'){
                //if the invalid attribute is the email, then add the message received
                //as a response
                invAttr +=  invalidAttributes[invalidAttribute][0].message + ", ";
              }else{
                invAttr +=  invalidAttribute + ", ";
              }
            }
            invAttr = invAttr.replace(/(^[,\s]+)|([,\s]+$)/g, '');
          }
          return data.summary + ": " + invAttr;
        }
      }else{
        return "";
      }
    },
    signin: function(error){
      var data = error;
      console.log(error);
      if(data.message){
        return data.message;
      }
      return "";
    }
  };
}).factory('globals', [
  '$state',
  '$route',
  function($state, $route) {
    return {
        reloadPanel: function() {
          $state.go('panel');
          $route.reload();
        }
    };
}]);