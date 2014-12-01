'use strict';

angular.module('controllers').controller('DoneButtonController', ['$scope', '$interval', 'IntentService',
    function($scope, $interval, intentService) {
        var stop;
        
        var data = intentService.getCurrent();
        
        initializeProgressBar(data);

        function initializeProgressBar(data) {
            var timeout = data.timeout;
            if (angular.isUndefined(timeout) || timeout < 1) {
                timeout = 27;
            }
            var now = 0;
            $scope.maxLatencyInSeconds = timeout;
            $scope.latencyInSeconds = now;

            stop = $interval(updateLatency, 1000);

            function updateLatency() {
                now++;
                if (now >= 3) {
                    $scope.maxLatencyInSeconds = timeout;
                    $scope.latencyInSeconds = now;
                }
                if ($scope.latencyInSeconds >= $scope.maxLatencyInSeconds) {
                    $interval.cancel(stop);
                    $scope.sendTimedOutResponse(timeout);
                }
            }
        }
        
        $scope.$on("$destroy", function() {
            $interval.cancel(stop);
        });
    }
]);

