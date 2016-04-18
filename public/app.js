var app = angular.module('myApp', ['ngRoute']);
// .config(['$routeProvider', function($routeProvider) {
//     $routeProvider.when('/', {
//         templateUrl: '/index.html'
//     });
// }])
app.controller('MainController', function($scope, $http, socket) {

    $scope.messages = [];
    $scope.sayHelloToServer = function() {
        $http.get("/api").then(function(response) {
            $scope.messages.push(response.data);
        });
    };
    
    $scope.sayHelloToServer();

    // $scope.messages = [];
    // socket.on('hello', function(data) {
    //     $scope.$apply(function() {
    //         $scope.messages.push(data);
    //     });
    //     console.log("recieved hello");
    // });

    // $scope.runHello = function() {
    //     socket.emit('greet', 30);
    // };

    // $scope.printResponse = function(message) {
    //   return message[19];  
    // };
});

// var app = angular.module('sampleApp', ['ngRoute']);

// app.config(['$routeProvider', function($routeProvider) {
//   $routeProvider.when('/', {
//     templateUrl: '/index.html'
//   });
// }]);

app.factory('socket', ['$rootScope', function($rootScope) {
    var socket = io.connect();

    return {
        on: function(eventName, callback) {
            socket.on(eventName, callback);
        },
        emit: function(eventName, data) {
            socket.emit(eventName, data);
        }
    };
}]);

// app.controller('IndexController', function($scope, socket) {
//   $scope.newCustomers = [];
//   $scope.currentCustomer = {};

//   $scope.join = function() {
//     socket.emit('add-customer', $scope.currentCustomer);
//   };

//   socket.on('notification', function(data) {
//     $scope.$apply(function () {
//       $scope.newCustomers.push(data.customer);
//     });
//   });
// });