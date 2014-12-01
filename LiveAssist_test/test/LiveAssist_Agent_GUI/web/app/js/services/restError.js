'use strict';

angular.module('services').factory('RestError', ['$window', function($window) {
    
    var alert = function (response, status) {
        var msg = 'The Live Assist server failed to perform the request';
        if (angular.isDefined(status)) {
            if (status === 419) {
                msg += ': session expired';
            } else {
                msg += ' (' + status + ').';
            }
        } else if (angular.isDefined(response)) {
            if (response.status === 419) {
                msg += ': session expired';
            } else {
                msg += ' (' + response.status + ').';
            }
        } else {
            msg += '.';
        }
        $window.alert(msg);
    };

    return { alert: alert, sessionExpired: 419 };

}]);
