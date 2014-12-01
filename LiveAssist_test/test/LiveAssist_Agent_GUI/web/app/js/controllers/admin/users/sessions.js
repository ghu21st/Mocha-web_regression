'use strict';

angular.module('controllers').controller('AdminSessionsController', ['$scope', '$interval', 'AdminSessionService',
    function($scope, $interval, adminSessionService) {

        $scope.sessionsData = [];
        $scope.sessionSelection = [];

        var updateSessions = function () {
            var sessions = adminSessionService.all({}, function (value, responseHeaders) {
                if (responseHeaders()["content-type"] === "application/json") {
                    $scope.setSessions(sessions);
                }
            })
        };

        $scope.setSessions = function(sessions) {
            $scope.sessionsData = sessions;
        };

        updateSessions();

        $scope.updateSessionsInterval = $interval(function() {
            updateSessions();
        }, $scope.sessionsRefreshTimeout);

        $scope.$on("$destroy", function(){
            $interval.cancel($scope.updateSessionsInterval);
        });

        $scope.$on('ngGridEventData', function() {
                var sessionSelected = false;
                if ( $scope.sessionSelection.length > 0 ) {
                    angular.forEach($scope.sessionsData, function(data, index){
                        if(data.sessionID === $scope.sessionSelection[0].sessionID){
                            $scope.sessionsGridOptions.selectItem(index, true);
                            sessionSelected = true;
                        }
                    });
                }
                if ( !sessionSelected && $scope.sessionsData.length > 0 ) {
                    $scope.sessionsGridOptions.selectItem(0, true);
                }
            }
        );

        $scope.sessionsGridOptions = {
            data: 'sessionsData',
            multiSelect: false,
            enablePaging: true,
            pagingOptions: {
                pageSizes: [5, 10],
                pageSize: 5,
                currentPage: 1
            },
            showFilter:true,
            columnDefs: [
                { field: "externalSessionID", displayName: "Session ID", resizable: true },
                { field: "ani", displayName: 'From', resizable: true},
                { field: "dnis", displayName: 'To', resizable: true}
            ],
            enableColumnResize: true,
            selectedItems: $scope.sessionSelection,
            afterSelectionChange: function(rowItem, event) {
                if ( $scope.sessionSelection.length > 0  && $scope.sessionSelection[0] &&
                    $scope.selectedSession.sessionID !== $scope.sessionSelection[0].sessionID )
                    $scope.selectedSession.sessionID = $scope.sessionSelection[0].sessionID;
            }
        };
    }
]);
