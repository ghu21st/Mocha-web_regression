'use strict';

angular.module('directives').directive('laConceptInput', ['$http', '$templateCache', '$compile', 'dateFilter', 'LaConfigService',
  function($http, $templateCache, $compile, dateFilter, laConfigService) {
    var TYPEAHEAD_SERVICE_URI = laConfigService.getLaRestBasePathname() + 'typeahead'; // '/liveassist/rest/typeahead'
    var DEFAULT_CONCEPT_TYPE = 'text';

    function link(scope, element ) {
        ensureConceptHasAType(scope.concept);
        restrictInputFieldCharactersIfNecessary(scope);
        setElementContentsFromTemplate(scope, element);
        addTypeaheadSupportIfNecessary(scope, element);
        addDatePickerSupportIfNecessary(scope, element);
    }

    function ensureConceptHasAType(concept) {
        if (angular.isUndefined(concept.type)) {
            concept.type = DEFAULT_CONCEPT_TYPE;
        }
    }

    function restrictInputFieldCharactersIfNecessary(scope) {
        var regex;
        
        if (scope.concept.type == 'tel') {
            regex = /[\d\-\.\(\)]/;
        } else if (scope.concept.type === 'date' || scope.concept.type === 'month') {
            regex = /[\d-]/;
        } else if (scope.concept.type === 'time') {
            regex = /[\d:]/;
        } else if (scope.concept.type === 'number') {
            regex = /[\d\.]/;
        }
        
        if (angular.isUndefined(regex)) {
            return;
        }

        scope.filterKeyPresses = function(concept, event) {
            //var character = event.charCode || event.which;
            var character = event.charCode;
            if (character && character > ' ') {
                if (!regex.test('' + String.fromCharCode(character))) {
                    event.preventDefault();
                }
            }
        };
    }

    function setElementContentsFromTemplate(scope, element) {
        var templateUrl = 'partials/live/busy/sections/concept-input.html';
        if (scope.concept.type === 'list') {
            templateUrl = 'partials/live/busy/sections/concept-input-list.html';
        } else if (angular.isDefined(scope.concept.typeahead)) {
            templateUrl = 'partials/live/busy/sections/concept-input-typeahead.html';
        } else if (scope.concept.type === 'date' || scope.concept.type === 'month') {
            templateUrl = 'partials/live/busy/sections/concept-input-date.html';
        } else if (scope.concept.type === 'time') {
            templateUrl = 'partials/live/busy/sections/concept-input-time.html';
        }

        $http.get(templateUrl, {cache: $templateCache}).success(function(templateContent){
            element.replaceWith($compile(templateContent.trim())(scope));
        });
    }

    function addTypeaheadSupportIfNecessary(scope) {
        var concept = scope.concept;
        if (angular.isUndefined(concept.typeahead)) {
            return;
        }

        if (angular.isDefined(concept.typeaheadRegex)) {
            concept.typeaheadRegex = new RegExp(concept.typeaheadRegex);
        }

        scope.getValues = function(viewValue) {
            var baseText = '';
            if (angular.isDefined(concept.typeaheadRegex)) {
                var result = concept.typeaheadRegex.exec(viewValue);
                if (!result) {
                    return [];
                }
                baseText = result[1] || result[0];
                viewValue = result[2] || result[1] || result[0];
            }

            if (!viewValue) {
                return [];
            }

            // TODO: Hack to use Google Maps API. Ideally, this should be done or configurable on the server
            if (concept.typeahead === 'GOOGLE_MAPS') {
                return getAddressesFromGoogleMaps(viewValue);
            }

//            return ['hotmail.com','gmail.com','lycos.com','outlook.com','yahoo.ca','yahoo.com'];
            var data = {
                agentValue: viewValue,
                typeaheadId: concept.typeahead,
                variableId: concept.id
            };
            return $http.post(TYPEAHEAD_SERVICE_URI, data).then(function(response) {
                // console.log("Returning response values: " + JSON.stringify(response.data));
                var values = [];
                for (var i = 0; i < response.data.values.length; ++i) {
                    values.push(baseText + response.data.values[i]);
                }
                return values;
            });
        };
    }

    function getAddressesFromGoogleMaps(viewValue) {
        return $http.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: viewValue,
                sensor: false
            }
        }).then(function(response) {
            var addresses = [];
            for (var i = 0; i < response.data.results.length; ++i) {
                var result = response.data.results[i];
                addresses.push(result.formatted_address);
            }
            return addresses;
        });
    }

    function addDatePickerSupportIfNecessary(scope, element) {
        if (scope.concept.type === 'date' || scope.concept.type === 'month') {
            scope.opened = false;
            scope.date = new Date();
            var date = new Date(scope.concept.value);
            scope.date.setFullYear(date.getUTCFullYear());
            scope.date.setMonth(date.getUTCMonth());
            scope.date.setDate(date.getUTCDate());
            scope.mode = "day";
            scope.filterExpr = 'yyyy-MM-dd';
            var options = { "datepicker-mode" : "day"};
            if ( scope.concept.type === 'month' ) {
                scope.filterExpr = 'yyyy-MM';
                scope.mode = "month";
                options = { "datepicker-mode" : "'month'",
                            "min-mode": "month"};
            }
            scope.options = options;
            scope.open = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                scope.opened = true;
            };
            scope.$watch('date', function () {
                scope.concept.value = dateFilter(scope.date, scope.filterExpr);
            });
        } else if (scope.concept.type === 'time') {
            scope.filterExpr = 'HH:mm';
        }
    }

    return {
        restrict: 'E',
        replace: true,
        scope: {
            concept: '=',
            conceptIndex: '='
        },
//        Removed, the templateUrl is set in the link function 
//        templateUrl: function(element, attributes) {
//            if (attributes.type === 'list') {
//                return 'partials/live/busy/sections/concept-input-list.html';
//            } else {
//                return 'partials/live/busy/sections/concept-input.html';
//            }
//        },
        link: {
            pre: link
        }
    };
}]);
