'use strict';

angular.module('controllers').controller('SignedOutController', ['$scope', '$state', '$modal', 'AgentService',
    function($scope, $state, $modal, agentService) {
                    	
        // Remove this line to re-enable welcome screen
        $scope.welcomeShown = true;
        // $scope.username = "x";
        // $scope.password = "x";

        if (!$scope.welcomeShown) {
            $modal.open({
                templateUrl: 'partials/welcome.html',
                controller: 'WelcomeController'
            });
            $scope.welcomeShown = true;
        }

        // TODO: use agent service to fetch this from Live Assist server instead of using path params
        $scope.sso = false;
        var parameters = window.location.search.substring(1).split("&");
        for (var i = 0; i < parameters.length; i++) {
            var parameter = parameters[i].split('=');
            if (parameter[0] == 'sso') {
                // console.log(parameter[1]);
                $scope.sso = parameter[1];
                break;
            }
        }
        
        $scope.signIn = function(mode) {
            $scope.errors = [];

            // Hack because Angular is not notified when Firefox autocompletes
            // TODO: use a directive?
            $scope.username = $("#username").val();
            $scope.password = $("#password").val();
            
            agentService.login($scope.sso, $scope.username, $scope.password, mode, function() {
                $state.go(mode);
            }, function(response) {
                $scope.errors.push(response);
            });
        };
    }
]);
