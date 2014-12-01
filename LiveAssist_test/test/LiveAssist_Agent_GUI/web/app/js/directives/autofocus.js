'use strict';

angular.module('directives').directive('ninaAutofocus', function() {
    function link(scope, element, attributes) {
        // console.log("Checking if should auto focus");
        if (scope.shouldAutofocus) {
            // NOTE: Calling element[0].focus() unfortunately does not seem to trigger the handling of the ng-focus
            // directive. Adding the autofocus attribute to the element does.
            element.attr('autofocus', 'autofocus');
        }
    }

    return {
        restrict: 'A',
        link: link,
        scope: {
            shouldAutofocus: '=ninaAutofocus'
        }
    };
});
