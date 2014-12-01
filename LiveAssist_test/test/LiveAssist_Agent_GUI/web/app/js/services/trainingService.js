'use strict';

angular.module('services').factory('TrainingService', ['$resource', '$http', 'LaConfigService',
    function($resource, $http, laConfigService) {
        
        var basepath = laConfigService.getLaRestTrainingBasePathname();  // '/liveassist/rest/training/'

        var sets =
            $resource(basepath + 'sets/:id',
                      { id: '@id' },
                      { update: { method: 'PUT' } }
        );

        var refcounts = function (id) { return $http.get(basepath + 'sets/' + id + '/refcounts', ''); };

        var orgIds = function () { return $http.get(basepath + 'org'); };
        var appIds = function (trainingSet) { return $http.get(basepath + 'org/' + trainingSet.organizationId + "/app"); };
        var contexts = function (trainingSet) { return $http.get(basepath + 'org/' + trainingSet.organizationId + "/app/" + trainingSet.applicationId + "/context"); };

        // save() creates (POSTs) and starts a new training run
        var runs =
            $resource(basepath + 'runs/:id',
                      { id: '@id' },
                      { update: { method: 'PUT' }}
        );

        var users = $resource(basepath + 'users');

        var active = $resource(basepath + 'runs/active');

        var start = function (id) {
            return $http.post(basepath + 'runs/' + id + '/start', '');
        };

        var stop = function (id) {
            return $http.post(basepath + 'runs/' + id +'/stop', '');
        };

        var cancel = function (id) {
            return $http.post(basepath + 'runs/' + id +'/cancel', '');
        };

        var uploadPath = function (id) {
            return basepath + 'sets/' + id + '/utts';
        }

        return {
            sets: sets, 
            refcounts: refcounts, 
            orgIds: orgIds, 
            appIds: appIds, 
            contexts: contexts, 
            runs: runs, 
            users: users, 
            active: active, 
            start: start,
            stop: stop,
            cancel: cancel,
            uploadPath: uploadPath 
        };
    }
]);
