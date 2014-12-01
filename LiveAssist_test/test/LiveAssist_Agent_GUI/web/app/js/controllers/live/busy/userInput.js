'use strict';

angular.module('controllers').controller('UserInputController', ['$scope', 'LaConfigService',
    function($scope, laConfigService) {
        var audioProxyBasePath = laConfigService.getLaAudioProxyBasePathname();  // '/liveassist/audioproxy/'
        if ($scope.interaction && $scope.interaction.audio) {
            // Add some random data to the end of the URI to force a reload
            // of the audio.
            // The query string will be ignored.
            var r = (Math.random() + 1).toString(36).substring(7);
            $scope.interaction.audio = audioProxyBasePath + $scope.interaction.audio + '?' + r;
        }
    }
]);
