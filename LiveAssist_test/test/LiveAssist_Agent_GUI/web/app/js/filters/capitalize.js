angular.module('liveAssist').filter('capitalize', function() {
    return function(input) {
        if (input.length == 0) {
            return input;
        }
        return input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase();
    }
});