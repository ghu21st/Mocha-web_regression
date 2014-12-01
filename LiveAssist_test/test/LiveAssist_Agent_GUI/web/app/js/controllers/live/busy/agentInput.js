'use strict';

angular.module('controllers').controller('AgentInputController', ['$scope', '$http', 'dateFilter', 'IntentService', 'ShortcutKeyService',
    function($scope, $http, dateFilter, intentService, shortcutKeyService) {
        
        var data = intentService.getCurrent();

        initializeIntentHandling(data);

        function initializeIntentHandling(data) {
            $scope.prompt = data.prompt;
            $scope.intent = data.id;
            $scope.intents = data.intents;
            $scope.selectedIntents = [];
            
            $scope.response.id = data.id;

            $scope.selectIntent = function(intent, level) {
                if (level < 0) {
                    return;
                }

                for (var i = $scope.selectedIntents.length - 1; i >= level; --i) {
                    $scope.selectedIntents.pop().selected = false;
                }
                intent.selected = true;
                $scope.selectedIntents.push(intent);

                if (intent.variables) {
                    for (i = 0; i < intent.variables.length; ++i) {
                        processIntentVariable(intent.variables[i]);
                    }
                }

                // Set the selected intent in the response we'll send back to the agent
//                if (angular.isUndefined(intent.members)) {
//                    $scope.response.intent = intent;
//                } else {
//                    $scope.response.intent = undefined;
//                }
                if (angular.isUndefined(intent.id)) {
                    $scope.response.intent = undefined;
                } else {
                    $scope.response.intent = intent;
                }
            };

            function processIntentVariable(variable) {
                if (angular.isUndefined(variable.default)) {
                    if (variable.type == 'date') {
                        variable.default = dateFilter(new Date(), 'yyyy-MM-dd');
                    }

                    if ( variable.type == 'month') {
                        variable.default = dateFilter(new Date(), 'yyyy-MM');
                    }

                    if (variable.type == 'time') {
                        variable.default = dateFilter(new Date(), 'HH:00');
                    }
                }

                variable.value = variable.default;
            }

            function handleControlAndDigitKey(event) {
                event.preventDefault();

                // TODO: Make this better by having a better way to convert keys to numerical values
                var key = event.keyCode || event.which;
                var index = key - 48;
                if (index == 0) {
                    index = 10;
                }

                var intents = $scope.intents;
                if ($scope.selectedIntents[$scope.selectedIntents.length - 1]) {
                    intents = $scope.selectedIntents[$scope.selectedIntents.length - 1].members;
                }

                if (angular.isUndefined(intents) || index > intents.length) {
                    return;
                }

                $scope.selectIntent(intents[index - 1], $scope.selectedIntents.length);
            }

            for (var i = 0; i < 10; ++i) {
                shortcutKeyService.registerKeyBinding($scope, 'Control+' + i.toString(), handleControlAndDigitKey);
            }

            shortcutKeyService.registerKeyBinding($scope, 'Control+Backspace', function(event) {
                // If there is one, pop and remove the last intent
                if ($scope.selectedIntents.length > 0) {
                    $scope.selectedIntents.pop().selected = false;
                }
                $scope.response.intent = undefined;
                event.preventDefault();
            });
        }
    }
]);
