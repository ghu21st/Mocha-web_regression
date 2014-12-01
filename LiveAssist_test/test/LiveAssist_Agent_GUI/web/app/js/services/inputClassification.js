'use strict';

angular.module('services').factory('InputClassificationService', ['$resource',
    function($resource) {
        return $resource('data/inputClassification.json', {}, {
            query: { method: 'GET', isArray: true }
        });
    }
]);