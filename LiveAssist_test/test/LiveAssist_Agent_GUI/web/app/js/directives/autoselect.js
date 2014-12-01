'use strict';

angular.module('directives').directive('ninaAutoselect', function($timeout) {
    function link(scope, element, attributes) {
        // console.log("Checking if should select");
        if (scope.$eval(attributes['ninaAutoselect'])) {
            // console.log("Selecting text in element");
            $timeout(function() {
                element[0].select();
            });
        }
    }

    return {
        priority: 10, // NOTE: We want to run after things like autofocus
        restrict: 'A',
        link: link
    };
});
