'use strict';

angular.module('controllers').controller('AdminUsersController', ['$scope',
    function ($scope) {
        $scope.selectedSession = {};
        $scope.selectedAgent = {};
    }
]);
