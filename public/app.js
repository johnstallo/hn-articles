var app = angular.module('myApp', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/new");

    $stateProvider
        .state('new', {
            url: "/new",
            templateUrl: "views/article-list.html",
            controller: 'MainController',
            resolve: {
                theArticles: function(Articles) {
                    console.log("loading articles...");
                    return Articles.get();
                }
            }
        })
        .state('submit', {
            url: "/submit",
            templateUrl: "views/article-submit.html",
            controller: function($scope, $state, Articles) {
                $scope.title = "Submit Article";

                $scope.formData = { title: "", url: "" };
                $scope.submitArticle = function() {
                    var newArticle = { title: $scope.formData.title, url: $scope.formData.url };

                    Articles.submit(newArticle)
                        .then(function(data) {
                            $state.go('new', {}, { reload: true });
                        });
                };
            }
        })
        .state('item', {
            url: "/item/:id",
            templateUrl: "views/article.html",
            controller: function($scope, $state, $stateParams, Articles, article) {
                $scope.article = article.data;
            },
            resolve: {
                article: function($stateParams, Articles) {
                    return Articles.getArticle($stateParams.id);
                }
            }
        });
});

app.controller('MainController', function($scope, $http, $state, Articles) {

    Articles.get()
        .success(function(data, status, headers, config) {
            console.log("API Gateway hostname: " + headers('Host-Name'));
            $scope.articles = data;
        });

    $scope.openSubmitScreen = function() {
        $state.go('submit');
    };

    $scope.refreshComments = function(articleID) {
        Articles.getComments(articleID)
            .success(function(data, status, headers, config) {
                console.log("API Gateway hostname: " + headers('Host-Name'));
                $scope.articles[articleID].comments = data;
            });
    };

});

app.factory('Articles', ['$http', function($http) {

    return {
        get: function() {
            return $http.get('/api/articles');
        },
        getArticle: function(articleID) {
            return $http.get('/api/articles/' + articleID);
        },
        create: function(articleData) {
            return $http.post('/api/articles', articleData);
        },
        delete: function(id) {
            // TODO
        },
        submit: function(newArticle) {
            console.log("posting new article %j", newArticle);
            return $http.post('/api/submit', newArticle);
        },
        upvote: function(id) {
            var articleData = {
                articleID: id
            };
            return $http.post('/api/upvote/', articleData);
        },
        createComment: function(commentData) {
            return $http.post('/api/comments', commentData);
        },
        getComments: function(articleID) {
            //console.log("Refreshing comments for article " + articleID);
            return $http.get('/api/articles/' + articleID + '/comments');
        }
    }
}]);
