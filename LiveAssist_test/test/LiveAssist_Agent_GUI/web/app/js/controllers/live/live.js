'use strict';

angular.module('controllers').controller('LiveController', ['$scope', '$state', 'AgentService',
    function($scope, $state, agentService) {
        // When the live state is initially activated, we are in the idle sub-state
        $scope.goToState('idle');

        $scope.statusMessages = [];

        $scope.statusMessages.add = function(message) {
            this.push(message);
        };

    }
]);
