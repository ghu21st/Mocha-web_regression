'use strict';

(function(){
    var agentApp = angular.module('liveAssist',
    ['ui.router', 'ui.bootstrap', 'ui.utils', 'controllers', 'directives', 'services', 'ngGrid', 'angularFileUpload', 'ui.select2' ]);

    agentApp.config(['$stateProvider', '$sceDelegateProvider', function($stateProvider, $sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            'self', 'http://localhost:8100/**'
        ]);

        $stateProvider.state('signedOut', {
            templateUrl: 'partials/signedOut.html',
            controller: 'SignedOutController'
            /*url: ''*/
        });

        $stateProvider.state('signedIn', {
            abstract: true,
            template: '<ui-view/>',
            controller: 'SignedInController'
        });

        $stateProvider.state('live', {
            parent: 'signedIn',
            template: '<ui-view/>',
            controller: 'LiveController'
        });

        $stateProvider.state('admin', {
            parent: 'signedIn',
            views: {
                "": {
                    templateUrl: 'partials/signedIn.html',
                    controller: 'AdminController'
                },
                "nav@admin": {
                    templateUrl: 'partials/admin/nav.html'
                }
            }
        });

        $stateProvider.state('admin:users', {
            parent: 'admin',
            /*url: '/admin/users',*/
            views: {
                "detail": {
                    templateUrl: 'partials/admin/users/detail.html',
                    controller: 'AdminUsersController'
                },
                "agents@admin:users": {
                    templateUrl: 'partials/admin/users/agents.html',
                    controller: 'AdminAgentsController'
                },
                "sessions@admin:users": {
                    templateUrl: 'partials/admin/users/sessions.html',
                    controller: 'AdminSessionsController'
                },
                "agentSession@admin:users": {
                    templateUrl: 'partials/admin/users/agentsession.html',
                    controller: 'AdminAgentSessionController'
                },
                "selectedSession@admin:users": {
                    templateUrl: 'partials/admin/users/selectedSession.html',
                    controller: 'AdminSelectedSessionController'
                }
            }
        });

        $stateProvider.state('admin:appconfig', {
            parent: 'admin',
            /*url: '/admin/appconfig',*/
            views: {
                "detail": {
                    templateUrl: 'partials/admin/appconfig/detail.html',
                    controller: 'AdminAppconfigController'
                },
                "applicationConfigurations@admin:appconfig": {
                    templateUrl: 'partials/admin/appconfig/applicationConfigurations.html',
                    controller: 'AdminApplicationConfigurationsController'
                },
                "applicationContexts@admin:appconfig": {
                    templateUrl: 'partials/admin/appconfig/applicationContexts.html',
                    controller: 'AdminApplicationContextsController'
                }
            }
        });

        $stateProvider.state('admin:training', {
            parent: 'admin',
            /*url: '/admin/training',*/
            views: {
                "detail": {
                    templateUrl: 'partials/admin/training/training.html',
                    controller: 'TrainingController'
                }
            }
        });

        $stateProvider.state('live:idle', {
            parent: 'live',
            views: {
                "": {
                    templateUrl: 'partials/signedIn.html',
                    controller: 'IdleController'
                },
                "nav@live:idle": {
                    templateUrl: 'partials/live/idle/nav.html'
                },
                "detail@live:idle": {
                    templateUrl: 'partials/live/idle/detail.html'
                }
            }
        });
        $stateProvider.state('live:busy', {
            parent: 'live',
            views: {
                "": {
                    templateUrl: 'partials/signedIn.html',
                    controller: 'BusyController'
                },

                "nav@live:busy": {
                    templateUrl: 'partials/live/busy/nav.html'
                },
                "detail@live:busy": {
                    templateUrl: 'partials/live/busy/detail.html'
                },

                "userInput@live:busy": {
                    templateUrl: 'partials/live/busy/sections/user-input.html',
                    controller: 'UserInputController'
                },
                "conversationContext@live:busy": {
                    templateUrl: 'partials/live/busy/sections/conversation-context.html',
                    controller: 'ConversationContextController'
                },

                "agentInput@live:busy": {
                    templateUrl: 'partials/live/busy/sections/agent-input.html',
                    controller: 'AgentInputController'
                },
                "assignIntent@live:busy": {
                    templateUrl: 'partials/live/busy/sections/assign-intent.html'
                },
                "dataInput@live:busy": {
                    templateUrl: 'partials/live/busy/sections/data-input.html'
                },

                "inputClassification@live:busy": {
                    templateUrl: 'partials/live/busy/sections/input-classification.html',
                    controller: 'InputClassificationController'
                },
                "doneButton@live:busy": {
                    templateUrl: 'partials/live/busy/sections/done.html',
                    controller: 'DoneButtonController'
                }
            }
        });

    }]);

    agentApp.factory('SessionExpiredInterceptor', ['$injector', '$q', '$log', '$filter', function($injector, $q, $log, $filter) {
        return {
            'response': function (response) {
                // must get $state from injector to avoid circular dependency error when it is put in the dependency list
                var $state = $injector.get('$state');
                // when session times out we will get 302'd to the login page in some state other than signedOut
                if (angular.isDefined(response.data) && typeof response.data === "string" &&
                    response.data.slice(0,42) === '<!DOCTYPE html>\n<html ng-app="liveAssist">' && !$state.is('signedOut')) {
                    // interpolate an error response
                    response.data = '';
                    response.status = 419; // Authentication expired; app should gently abandon any operation in progress
                    $state.go('signedOut');
                    return $q.reject(response);
                } else {
                    return response;
                }
            }
        };
    }]);

    agentApp.config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push('SessionExpiredInterceptor');
    }]);

    agentApp.run(function($state) {
        // We transition to the signedOut state when the application starts
        $state.go('signedOut');
    });

    angular.module('controllers', []);
    angular.module('services', ['ngResource']);
    angular.module('directives', []);
})();
