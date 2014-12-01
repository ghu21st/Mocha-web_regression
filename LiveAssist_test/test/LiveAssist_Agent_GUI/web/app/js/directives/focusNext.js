'use strict';

angular.module('directives').directive('ninaFocusNext', function($timeout) {
    function isTabStop(element) {
        return (element[0].tabIndex >= 0);
    }

    function findNextTabStop(element) {
        var next = element.next();
        if (next.length > 0) {
            if (isTabStop(next)) {
                return next;
            }
            return findNextTabStop(next);
        }
        var parent = element.parent();
        if (parent.length > 0) {
            if (isTabStop(parent)) {
                return parent;
            }
            return findNextTabStop(parent);
        }

        return undefined;
    }

    function link(scope, element, attributes) {
        // console.log("Focusing next");
        element.on('focus', function() {
            var nextTabStopElement = findNextTabStop(element);
            if (angular.isDefined(nextTabStopElement)) {
                $timeout(function() {
                    // console.log("Setting focus on next element!");
                    nextTabStopElement[0].focus();
                });
            }
        });
    }

    return {
        restrict: 'A',
        link: link
    };
});
