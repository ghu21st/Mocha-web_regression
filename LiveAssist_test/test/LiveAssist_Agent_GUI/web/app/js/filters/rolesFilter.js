angular.module('liveAssist').filter('rolesFilter', ['AdminUtilitiesService', function(adminUtilities) {
    return function(input) {
        if ( angular.isArray(input) ) {
            return adminUtilities.authoritiesToRoleNames(input);
        }
        return input;
    }
}]);