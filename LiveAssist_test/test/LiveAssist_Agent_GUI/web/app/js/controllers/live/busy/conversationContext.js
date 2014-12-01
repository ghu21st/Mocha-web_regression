'use strict';

angular.module('controllers').controller('ConversationContextController', ['$scope',
    function($scope) {
        $scope.history = $scope.interaction.history;
    }
]);
