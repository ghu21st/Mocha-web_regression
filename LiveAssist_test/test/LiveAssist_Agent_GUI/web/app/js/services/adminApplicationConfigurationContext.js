'use strict';

angular.module('services').factory('AdminApplicationConfigurationContextService', ['$resource', 'LaConfigService',
    function($resource, laConfigService) {
        var basePath = laConfigService.getLaRestAdminBasePathname();                        // '/liveassist/rest/admin/'
        return $resource(basePath + 'applicationConfigurations/:applicationConfigurationId/context/:id',  // '/liveassist/rest/admin/applicationConfigurations/:applicationConfigurationId/context/:id'
                {applicationConfigurationId:'@applicationConfigurationId', id:'@id'}, {
            all : {method:'GET', url:basePath + 'applicationConfigurations/:applicationConfigurationId/context',isArray:true}, // "/liveassist/rest/admin/applicationConfigurations/:applicationConfigurationId/context"
            skills : { method:'GET', url:basePath + 'applicationConfigurations/skills', isArray:true} // "/liveassist/rest/admin/applicationConfigurations/skills"
        });
    }
]);
