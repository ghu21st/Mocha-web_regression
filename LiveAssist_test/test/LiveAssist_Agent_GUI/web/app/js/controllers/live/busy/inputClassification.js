'use strict';

angular.module('controllers').controller('InputClassificationController', ['$scope', 'IntentService', 'ShortcutKeyService',
    function($scope, intentService, shortcutKeyService) {

        var data = intentService.getCurrent();
        
        initializeGlobals(data);
        
        function initializeGlobals(data) {
            var checkboxes = data.globals;
            if (angular.isUndefined(checkboxes)) {
                return;
            }

            // console.log("Setting up checkboxes: " + JSON.stringify(checkboxes));
            var numColumns = 5; // TODO: Make configurable?
            $scope.checkboxNumColumns = numColumns;
            var numRows = Math.ceil(checkboxes.length / numColumns);

            $scope.checkboxRows = new Array(numRows);
            for (var i = 0; i < numRows; ++i) {
                if (i === (numRows - 1)) {
                    $scope.checkboxRows[i] = new Array(checkboxes.length % numColumns);
                } else {
                    $scope.checkboxRows[i] = new Array(numColumns);
                }
            }

            for (i = 0; i < checkboxes.length; ++i) {
                var row = Math.floor(i / numColumns);
                var column = i % numColumns;
                $scope.checkboxRows[row][column] = checkboxes[i];
            }

            $scope.response.globals = checkboxes;

            function handleAltAndDigitKey(event) {
                event.preventDefault();

                // TODO: Make this better by having a better way to convert keys to numerical values
                var key = event.keyCode || event.which;
                var index = key - 48;
                if (index == 0) {
                    index = 10;
                }

                if (angular.isUndefined(checkboxes) || index > checkboxes.length) {
                    return;
                }

                var i = index - 1;
                var row = Math.floor(i / numColumns);
                var column = i % numColumns;
                var old = $scope.checkboxRows[row][column].checkedByAgent;
                // console.log('row=' + row + ', column=' + column + ', check=' + old);
                $scope.checkboxRows[row][column].checkedByAgent = !old;
            }

            for (var i = 0; i < 10; ++i) {
                shortcutKeyService.registerKeyBinding($scope, 'Alt+' + i.toString(), handleAltAndDigitKey);
            }

        }
    }
]);
