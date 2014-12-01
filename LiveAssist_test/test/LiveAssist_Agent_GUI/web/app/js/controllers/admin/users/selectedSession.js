'use strict';

angular.module('controllers').controller('AdminSelectedSessionController', ['$scope', '$interval', 'AdminSessionService',
    function ($scope, $interval, adminSessionService) {

        $scope.session = {};

        var updateSelectedSession = function () {
            if ( $scope.selectedSession && $scope.selectedSession.sessionID ) {
                var session = adminSessionService.get({sessionID: $scope.selectedSession.sessionID}, function() {
                    for(var key in session) {
                        $scope.session[key] = session[key];
                    }
                });
            }
        };

        $scope.updateSelectedSessionInterval = $interval(function () {
            if ($scope.selectedSession.sessionID)
                updateSelectedSession();
        }, $scope.sessionsRefreshTimeout);

        $scope.$on("$destroy", function () {
            $interval.cancel($scope.updateSelectedSessionInterval);
        });
        $scope.$watch("selectedSession.sessionID", function (newValue, oldValue) {
            if (newValue && newValue !== oldValue)
                updateSelectedSession();
        });
    }
]);
