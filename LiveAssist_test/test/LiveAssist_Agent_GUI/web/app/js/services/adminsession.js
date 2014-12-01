'use strict';

angular.module('services').factory('AdminSessionService', ['$resource', 'LaConfigService',
    function($resource, laConfigService) {
        var basePath = laConfigService.getLaRestAdminBasePathname();                        // '/liveassist/rest/admin/'
        return $resource(basePath + 'sessions/:sessionID', {sessionID:'@sessionID', username: '@username'}, {  // '/liveassist/rest/admin/sessions/:sessionID'
            all : {method:'GET', url:basePath + 'sessions', isArray:true},  // "/liveassist/rest/admin/sessions"
            forAgent: {method:'GET', url:basePath + 'sessions/agent/:username/', isArray:false}  // "/liveassist/rest/admin/sessions/agent/:username/"
        });
    }
]);
