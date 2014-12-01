angular.module('liveAssist').filter('arrayComma', function() {
    return function(array) {
        if (angular.isArray(array)) {
            return array.join(", ");
        }
        return array;
    }
});