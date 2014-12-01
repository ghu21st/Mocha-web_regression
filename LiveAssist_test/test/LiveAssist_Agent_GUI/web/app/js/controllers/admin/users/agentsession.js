'use strict';

angular.module('controllers').controller('AdminAgentSessionController', ['$scope', '$interval', 'AdminSessionService',
    function ($scope, $interval, adminSessionService) {

        $scope.session = {};

        var updateAgentSession = function () {

            if ( $scope.selectedAgent && $scope.selectedAgent.username ) {
                var session = adminSessionService.forAgent({username: $scope.selectedAgent.username}, function() {
                    for(var key in session) {
                        $scope.session[key] = session[key];
                    }
                });
            }
        };

        $scope.updateAgentSessionInterval = $interval(function () {
            updateAgentSession();
        }, $scope.sessionsRefreshTimeout);

        $scope.$on("$destroy", function () {
            $interval.cancel($scope.updateAgentSessionInterval);
        });
        $scope.$watch("selectedAgent.username", function (newValue, oldValue) {
            if (newValue && newValue !== oldValue)
                updateAgentSession();
        });
    }
]);
