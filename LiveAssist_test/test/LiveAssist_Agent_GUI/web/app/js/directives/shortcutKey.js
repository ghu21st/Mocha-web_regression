'use strict';

angular.module('directives').directive('ninaShortcutKey', function($parse, ShortcutKeyService) {
    function link(scope, element, attributes) {
        var keyCombination = attributes['ninaShortcutKey'];
        if (!keyCombination) {
            return;
        }

        ShortcutKeyService.registerKeyBinding(scope, keyCombination, function(event) {
            if (attributes['ninaShortcutFor']) {
                var expressionExecutionFunction = $parse(attributes['ninaShortcutFor']);
                expressionExecutionFunction(scope, {$event: event});
            } else {
                element[0].click();
            }
        });
    }

    return {
        restrict: 'A',
        link: link
    };
});
