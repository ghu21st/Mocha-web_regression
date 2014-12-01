'use strict';

angular.module('services').factory('AdminApplicationConfigurationService', ['$resource', 'LaConfigService',
    function($resource, laConfigService) {
        var basePath = laConfigService.getLaRestAdminBasePathname();                        // '/liveassist/rest/admin/'
        return $resource(basePath + 'applicationConfigurations/:id', {id:'@id'}, {          // '/liveassist/rest/admin/applicationConfigurations/:id'
            all : {method:'GET', url:basePath + "applicationConfigurations", isArray:true}  // "/liveassist/rest/admin/applicationConfigurations"
        });
    }
]);
