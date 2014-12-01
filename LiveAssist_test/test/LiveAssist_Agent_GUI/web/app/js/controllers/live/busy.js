'use strict';

angular.module('controllers').controller('BusyController', ['$scope', '$state', 'AgentService', 'IntentService', '$timeout', '$interval',
    function($scope, $state, agentService, intentService, $timeout, $interval) {
        $scope.signOutRequested = false;

        $scope.interaction = agentService.getLastAssignedInteraction();
        $scope.intents = intentService.getCurrent();
        $scope.agentParams = agentService.agentParams;

        var progressbarInterval;

        // Will be filled in by child controllers as they acquire data
        // Child controllers cannot assign the response object itself, i.e., $scope.response = ... because that will
        // create a response object in their local scope.  Instead, child controllers assign to response.<property>.
        $scope.response = {
            id: undefined,
            intent: undefined,
            globals: undefined
        };

//        var i = 2;
//        if (i == 1) {
//            // Directly call sendResponse
//            setTimeout(function() {
//                var intent;
//                var member = $scope.intents.intents[3];
//                intent = member.id;
//                $scope.response.intent = {
//                    id : intent
//                };
//    
//                $scope.sendResponse();
//            }, 2000);
//        } else if (i == 2) {
//            // Send keydown on FF
//            setTimeout(function() {
//                var keyboardEvent = new KeyboardEvent("keydown", { key: "4", keyCode: 52, ctrlKey : true, shiftKey: false });
//                document.dispatchEvent(keyboardEvent);
// 
//                setTimeout(function() {
//                    var keyboardEvent = new KeyboardEvent("keydown", { key: "Enter", keyCode: 13, ctrlKey : true, shiftKey: false });
//                    document.dispatchEvent(keyboardEvent);
//                }, 1000);
//            }, 1000);
//        } else if (i == 3) {
//            // Hack keydown on Chrome
//            var keydown = function(k) {
//                var keyboardEvent = document.createEvent('KeyboardEvent');
//                Object.defineProperty(keyboardEvent, 'keyCode', {
//                            get : function() {
//                                return this.keyCodeVal;
//                            }
//                });     
//                Object.defineProperty(keyboardEvent, 'which', {
//                            get : function() {
//                                return this.keyCodeVal;
//                            }
//                });
//                keyboardEvent.initKeyboardEvent("keydown", true, true, document.defaultView, k, k, "Control", 0);
//                keyboardEvent.keyCodeVal = k;
//                document.dispatchEvent(keyboardEvent);
//            }
//            setTimeout(function() {
//                keydown(52);
//                setTimeout(function() {
//                    keydown(13);
//                }, 200);
//            }, 200);
//        }
        
        $scope.requestSignOut = function() {
            $scope.signOutRequested = !$scope.signOutRequested;
        };

        var noInteractionCallback = function(data) {
            if ( ($state.includes('live:busy') ) ) {
                $scope.statusMessages.length = 0;
                $scope.statusMessages.add("The session was terminated.");
                agentService.resetLastResponse();
                leaveBusyState();
            }
        };

        agentService.pollForNoInteraction(noInteractionCallback, function(response) {
            $scope.statusMessages.push('An error occurred contacting the Live Assist server.');
            //$scope.statusMessages.push(response);
            $scope.statusMessages.push('Cleaning up...');
            alert('An error occurred contacting the Live Assist server.');
            $scope.signOut();
        });

        $scope.$on("$destroy", function(){
            $interval.cancel(progressbarInterval);

            agentService.cancelPollForNoInteraction();            
        });

        $scope.sendResponse = function() {
            // Disable the no interaction callback while posting the agent response
            agentService.cancelPollForNoInteraction();
            
            // Saves the response so we can display it on the idle page.
            // Posts the response and the signOutRequested flag to the server.
            agentService.sendResponse($scope.response, $scope.signOutRequested, function() {
                leaveBusyState();
            });
        };
        
        $scope.sendTimedOutResponse = function(timeout) {
            // Disable the no interaction callback while posting the agent response
            agentService.cancelPollForNoInteraction();
            
            // Saves the response so we can display it on the idle page.
            // Posts the response and the signOutRequested flag to the server.
            agentService.sendResponse(null, $scope.signOutRequested, function() {
                // Wait for the agent to dismiss the alert to check that the agent is indeed present
                $timeout(function() {
                    alert('You are only allowed ' + timeout + ' seconds to send your choices.');

                    $scope.statusMessages.add('The interaction timeout of ' + timeout + ' seconds has elapsed.');

                    leaveBusyState();
                });
            });
        };
        
        var leaveBusyState = function() {
            if ($scope.signOutRequested) {
                if (agentService.isSso()) {
                    agentService.logout();
                } else {
                    $scope.goToState('signedOut');
                }
            } else {
                $scope.goToState('idle');
            }
        }

        initializeProgressBar($scope.intents);

        function initializeProgressBar(data) {
            var timeout = data.timeout;
            if (angular.isUndefined(timeout) || timeout < 1) {
                timeout = 27;
            }
            var now = 0;
            $scope.maxLatencyInSeconds = timeout;
            $scope.latencyInSeconds = now;

            progressbarInterval = $interval(updateLatency, 1000);

            function updateLatency() {
                now++;
                if (now >= 3) {
                    $scope.maxLatencyInSeconds = timeout;
                    $scope.latencyInSeconds = now;
                }
                if ($scope.latencyInSeconds >= $scope.maxLatencyInSeconds) {
                    $interval.cancel(progressbarInterval);
                    $scope.sendTimedOutResponse(timeout);
                }
            }
        }
        
    }
]);
