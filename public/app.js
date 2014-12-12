var grasshopper = angular.module('grasshopper', ['ui.router', 'ngAnimate', 'ngResource', 'grasshopper.services']).config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.withCredentials = true;
}]);


// Services
angular.module('grasshopper.services', []).factory('Board', function($resource) {
  return $resource('http://grasshopperapi.herokuapp.com/boards/:id', { id: '@id' }, {
    update: {
      method: 'PUT'
    }
  });
})
.factory('Message', function($resource) {
  return $resource('http://grasshopperapi.herokuapp.com/boards/:board_id/messages/:id', { board_id: '@board_id',  id: '@id' }, {
    update: {
      method: 'PUT'
    }
  });
});


grasshopper.service('userService', function($http) {
this.getUser = function(){
    var user = $http({method: 'GET', url: 'http://grasshopperapi.herokuapp.com/user/current_user.json'}).success(
        function(data) {
            return data;
        });
     return user;
}});


// Controllers
grasshopper.controller('BoardListController', function($scope, $state, Board) {
  $scope.boards = Board.query();
});

grasshopper.controller('BoardViewController', function($scope, $state, $stateParams, Board, userService) {

  userService.getUser().then(function (response) {
    $scope.user = response.data;
  });

  $scope.board = Board.get({ id: $stateParams.id });

  $scope.updateBoard = function() {
    $scope.board.$update(function() {
      $state.transitionTo('viewBoard', { id: $stateParams.id });
  });
 };
});

grasshopper.controller('BoardCreateController', function($scope, $state, $stateParams, $window, Board, userService) {
  userService.getUser().then(function (response) {
    $scope.user = response.data;
  });
  $scope.board = new Board();
  $scope.addBoard = function() {
  $scope.board.$save(function() {
  $state.go('boards');
  });
 };
});

grasshopper.controller('MessageListController', function($scope, $http, $state, $stateParams, $window, Message, userService) {
  userService.getUser().then(function (response) {
    $scope.user = response.data;
  });
  $scope.messages = Message.query({ board_id: $stateParams.id });
  $scope.message = new Message( {board_id: $stateParams.id} );

  $scope.addMessage= function() {
  $scope.message.$save(function() {
  // $scope.messages = Message.query({ board_id: $stateParams.id });
  location.reload();
  //have switched to a reload here because was not able to post 2 messages concurrently as :id gets lost for some reason. It's not elegant but it fixes the bug for now.
  });
 };
$scope.deleteMessage = function( board_id, id ){
  $http({method: 'DELETE', url: "http://grasshopperapi.herokuapp.com/boards/" + board_id + "/messages/" + id }).success(
    function(data) {
      location.reload();
    })
  };
});

grasshopper.controller('MessageViewController', function($scope, $state, $stateParams, Message, $window) {
 $scope.message = Message.get({ board_id: $stateParams.board_id, id: $stateParams.id});
});

grasshopper.controller('UserController', function($scope, $state, $http, userService, $window) {
  userService.getUser().then(function (response) {
    $scope.user = response.data;
  });

  $scope.logIn = function(){
    $http({method: 'POST', url: "http://grasshopperapi.herokuapp.com/sessions", data: {email: $scope.email, password: $scope.password}}).success(function(data) {
      $scope.email = "";
      $scope.password = "";
      $window.location.reload();
      $state.go('boards');
    })
  };

  $scope.signUp = function(){
    $http({method: 'POST', url: "http://grasshopperapi.herokuapp.com/users", data: {email: $scope.email, name: $scope.name, password: $scope.password, password_confirmation: $scope.password_confirmation}}).success(function(data) {
      $scope.email = "";
      $scope.name = "";
      $scope.password = "";
      $scope.password_confirmation = "";
      $window.location.reload();
      $state.go('boards');
    })
  };

  $scope.logOut = function(){
  $http({method: 'DELETE', url: "http://grasshopperapi.herokuapp.com/sessions/" + $scope.user.id }).success(function(data) {
    console.log(data);
    $window.location.reload();
    $state.go('boards');
    })
  };
})


// Routes
angular.module('grasshopper').config(function($stateProvider) {
  $stateProvider.state('boards', { // index
    url: '/boards',
    templateUrl: 'pages/home.html',
    controller: 'BoardListController'
  }).state('viewBoard', { // show
    url: '/boards/:id/view',
    templateUrl: 'pages/board-view.html'
  }).state('newBoard', { // create
    url: '/boards/new',
    templateUrl: 'pages/board-add.html',
    controller: 'BoardCreateController'
  }).state('editBoard', { // update
    url: '/boards/:id/edit',
    templateUrl: 'pages/board-edit.html',
    controller: 'BoardViewController'
  }).state('viewMessage', { // show
    url: 'boards/:board_id/messages/:id/view',
    templateUrl: 'pages/message-view.html',
    controller: 'MessageViewController'
  }).state('newMessage', { // create
    url: '/boards/:board_id/messages/new',
    templateUrl: 'pages/message-add.html',
    controller: 'MessageCreateController'
  }).state('account', { // create
    url: '/account/',
    templateUrl: 'pages/account.html',
    controller: 'UserController'
  });
}).run(function($state) {
  $state.go('boards');
});


