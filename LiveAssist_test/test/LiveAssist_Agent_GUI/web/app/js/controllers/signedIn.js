'use strict';

angular.module('controllers').controller('SignedInController', ['$scope', '$state', 'AgentService',
    function($scope, $state, agentService) {
        $scope.mode = $state.current.name;
        $scope.sso = agentService.isSso();
        // console.log("sso=" + $scope.sso);

        // Convenience method for child states to easily switch to different states
        // without having knowledge of different modes (live, training, admin)
        $scope.goToState = function(stateName) {
            // console.log("Transitioning to state " + stateName + " for mode " + $scope.mode);
            // There is one signedOut state for the entire application
            if (stateName == 'signedOut') {
                $state.go('signedOut');
            } else {
                $state.go($scope.mode + ':' + stateName);
            }
        };

        // TODO: Rename and move this to agent service once P4 merge is complete
        $scope.signOut = function() {
            agentService.logout(function() {
                $state.go('signedOut');
            }, function(response) {
                // console.log("Logout failed with response: " + response)
                $state.go('signedOut');
            });
        };
    }
]);
