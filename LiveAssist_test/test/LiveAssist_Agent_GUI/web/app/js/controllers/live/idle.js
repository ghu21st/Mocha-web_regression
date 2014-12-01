'use strict';

angular.module('controllers').controller('IdleController', ['$scope', '$state', 'AgentService', 'SseService', 'IntentService',
    function($scope, $state, agentService, sseService, intentService) {
    
        $scope.loginUsername = agentService.getLoginUsername();
        
        // The idle page currently displays the last response returned to the server, if any.
        $scope.lastResponse = agentService.getLastResponse();

        var interactionCallback = function(data) {
            if ( ($state.includes('live:idle') ) ) {
                // Fetch the picklist before showing the busy screen
                var interaction = agentService.getLastAssignedInteraction();
                if (interaction) {
                    var intents = intentService.query(interaction.interactionId, function(data) {
                        $scope.goToState('busy');                    
                    });
                    intents.$promise.then(null, function(error) {
                        var errorMsg;
                        if ('message' in error) {
                            errorMsg = error.message;
                        } else {
                            errorMsg = JSON.stringify(error, null, 2);
                        }
                        alert('An error occurred obtaining the picklist for interaction ' + interaction.interactionId +
                              ', error: "' + errorMsg + '".\nPlease report this error to your administrator.');
                        agentService.sendResponse(null, true, function() {
                            $scope.signOut();
                        });
                    });
                }
            }
        };
        
        // If there's an error message wait 3 seconds before polling
        if ($scope.statusMessages.length > 0) {
            setTimeout( function() {
                $scope.statusMessages.length = 0;
                poll();
            }, 3000);
        } else {
            poll();
        }

        function poll() {
            agentService.pollForInteraction(interactionCallback, function(response) {
                $scope.statusMessages.push('An error occurred contacting the Live Assist server.');
                //$scope.statusMessages.push(response);
                $scope.statusMessages.push('Cleaning up...');
                alert('An error occurred contacting the Live Assist server.');
                $scope.signOut();
            });
        }
        
        $scope.$on("$destroy", function(){
            agentService.cancelPollForInteraction();
        });

        $scope.makeMeBusy = function() {
            // console.log("fake interaction!");
            agentService.fakeInteraction(function() {
            });
        };
        
    }
]);
