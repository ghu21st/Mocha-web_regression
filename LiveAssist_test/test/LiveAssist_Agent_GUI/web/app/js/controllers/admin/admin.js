'use strict';

angular.module('controllers').controller('AdminController', ['$scope', 'AgentService',
    function($scope, agentService) {
        $scope.loginUsername = agentService.getLoginUsername();
        $scope.sessionsRefreshTimeout = 2000;
        $scope.agentsRefreshTimeout = 60000;
        $scope.loggedInAgentsRefreshTimeout = 5000;
        $scope.goToState("users");
    }
]);
