'use strict';

angular.module('services').factory('AdminAgentService', ['$resource', 'LaConfigService',
    function($resource, laConfigService) {
        var basePath = laConfigService.getLaRestAdminBasePathname();                           // '/liveassist/rest/admin/'
        return $resource(basePath + 'agents/:agentName', {agentName:'@username'}, {            // '/liveassist/rest/admin/agents/:agentName'
            loggedIn : {method:'GET', url:basePath + 'agents/loggedIn', isArray:true},         // "/liveassist/rest/admin/agents/loggedIn"
            all : {method:'GET', url:basePath + 'agents', isArray:true},                       // "/liveassist/rest/admin/agents"
            logout: {method:'GET', url:basePath + 'agents/:agentName/logout', isArray:false},  // "/liveassist/rest/admin/agents/:agentName/logout"
            add: {method:'POST', url:basePath + 'agents'},                                     // "/liveassist/rest/admin/agents"
            skills : {method:'GET', url:basePath + 'agents/skills', isArray:true},             // '/liveassist/rest/admin/agents/skills'
            addSkills: {method:'POST', url:basePath + 'agents/skills', isArray:true},          // '/liveassist/rest/admin/agents/skills'
            agentSkills: {method: 'GET', url:basePath + 'agents/:agentName/skills'},           // '/liveassist/rest/admin/agents/skills'
            setAgentSkills: {method: 'POST', url:basePath + 'agents/:agentName/skills'}        // '/liveassist/rest/admin/agents/skills'
        });
    }
]);
