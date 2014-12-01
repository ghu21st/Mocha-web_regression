'use strict';

angular.module('controllers').controller('AdminModalController', ['$scope', '$modalInstance', 'header', 'body',
    function($scope, $modalInstance, header, body) {
        $scope.header = header;
        $scope.body = body;
        $scope.ok = function () {
            $modalInstance.close('ok');
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }
]);
