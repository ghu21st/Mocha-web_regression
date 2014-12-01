'use strict';

angular.module('controllers').controller('WelcomeController', ['$scope', '$modalInstance', '$http', '$sce',
    function($scope, $modalInstance, $http, $sce) {

        $scope.close = function() {
            $modalInstance.close();
        };

        $http.get('data/welcome.txt'
            ).success(function(data) {
                $scope.messageOfTheDayHtml = $sce.trustAsHtml(data.replace(/\r\n/g, "<br/>"));
            }).error(function() {
//                $scope.messageOfTheDay = "Error reading response"
            });
    }
]);
