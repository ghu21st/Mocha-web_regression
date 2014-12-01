'use strict';

angular.module('controllers').controller('AdminAgentsController', ['$scope', '$filter', '$modal', '$interval', 'AdminAgentService', 'AdminUtilitiesService',
    function($scope, $filter, $modal, $interval, adminAgentService, adminUtilitiesService) {

        $scope.agentsData = [];
        $scope.agentSelection = [];
        $scope.editAllowed = false;
        $scope.logoutAllowed = false;
        $scope.skills = {};

        var reportErrorAndSignout = function() {
            $interval.cancel($scope.updateAgentsInterval);
            $interval.cancel($scope.updateLoggedInAgentsInterval);
            alert('An error occurred contacting the Live Assist server.');
            $scope.signOut();
        };

        var updateSkills = function() {
            var skills = adminAgentService.skills();
            skills.$promise.then(function() {
                $scope.skills = skills;
            })
        };

        var updateAgents = function () {
//            if (!$scope.sso) {
                var agents = adminAgentService.all({}, function (value, responseHeaders) {
                        if (responseHeaders()["content-type"] === "application/json") {
                            $scope.loggedInAgents = adminAgentService.loggedIn({}, function () {
                                $scope.setAgentsData(agents);
                            }, function () {
                                reportErrorAndSignout();
                            });
                        } else {
                            reportErrorAndSignout();
                        }
                    },
                    function () {
                        reportErrorAndSignout();
                    }
                );
                agents.$promise.then(null, function(error) {
                    reportErrorAndSignout();
                });
//            } else {
//                var loggedInAgents = adminAgentService.loggedIn({}, function (value, responseHeaders) {
//                        if (responseHeaders()["content-type"] === "application/json") {
//                            $scope.loggedInAgents = loggedInAgents;
//                            $scope.setAgentsData(loggedInAgents);
//                        } else {
//                            reportErrorAndSignout();
//                        }
//                    },
//                    function () {
//                        reportErrorAndSignout();
//                    }
//                );
//                loggedInAgents.$promise.then(null, function(error) {
//                    reportErrorAndSignout();
//                });
//            }
        };

        var updateLoggedInAgents = function () {
            $scope.loggedInAgents = adminAgentService.loggedIn({}, function () {
                $scope.updateAllowedForSelection();
            }, function () {
                reportErrorAndSignout();
            });
        };

        $scope.setAgentsData = function (agents) {
            $scope.agentsData = $filter('filter')(agents, function (agent) {
                return !adminUtilitiesService.isAnonymous(agent.roles);
            });
            $scope.pagingOptions.totalServerItems = $scope.agentsData.length;
            $scope.updateAllowedForSelection();
        };

        $scope.updateAllowedForSelection = function() {
            $scope.editAllowed = false;
            $scope.logoutAllowed = false;
            if ( $scope.agentSelection.length > 0  && $scope.agentSelection[0] ) {
                $scope.editAllowed = true;
                var selectedName = $scope.agentSelection[0].username;
                if ( selectedName !== $scope.loginUsername ) {
                    for ( var i = 0; i < $scope.loggedInAgents.length; i++ ) {
                        if ( $scope.loggedInAgents[i].username === selectedName ) {
                            $scope.logoutAllowed = true;
                        }
                    }
                }
            }
        };

        $scope.getRoleNames = function(roles) {
            if ( roles != null ) {
                return adminUtilitiesService.authoritiesToRoleNames(roles).join(', ');
            }
            return "";
        };

        $scope.deleteAgent = function() {
            if (!$scope.sso) {
                var agent = $scope.selectedAgent.username;
                var modalInstance = $modal.open({
                    templateUrl: 'partials/admin/modal.html',
                    controller: 'AdminModalController',
                    resolve : {
                        header : function() {
                            return "Delete user"
                        },
                        body : function() {
                            return "Do you want to delete user " + agent + "?";
                        }
                    }
                });
                modalInstance.result.then ( function() {
                    adminAgentService.delete({agentName:agent});
                    updateAgents();
                });
            }
        };

        $scope.logoutAgent = function() {
            var agentName = $scope.selectedAgent.username;
            var modalInstance = $modal.open({
                templateUrl: 'partials/admin/modal.html',
                controller: 'AdminModalController',
                resolve : {
                    header : function() {
                        return "Logout user"
                    },
                    body : function() {
                        return "Do you want to logout user " + agentName + "?";
                    }
                }
            });
            modalInstance.result.then ( function() {
                adminAgentService.logout({agentName:agentName})
                    .$promise.then(function() {
                        updateAgents();
                    });
            } );
        };

        $scope.addAgent = function() {
            if (!$scope.sso) {
                var skills = adminAgentService.skills();
                skills.$promise.then(function() {
                    $scope.skills = skills;
                    var modalInstance = $modal.open({
                        templateUrl: 'partials/admin/users/agent.html',
                        controller: 'AdminAgentController',
                        resolve : {
                            agent : function() {
                                return new adminAgentService({username:"", password:"", roles:[]});
                            },
                            edit : function() {
                                return false;
                            },
                            skills : function() {
                                return skills;
                            }
                        }
                    });
                    modalInstance.result.then(function (agent) {
                        adminAgentService.add(agent)
                            .$promise.then(function() {
                                updateSkills();
                                updateAgents();
                            });
                    });
                });
            }
        };

        $scope.editAgent = function() {
            if (!$scope.sso) {
                if ( $scope.agentSelection.length > 0 ) {
                    var agent = $scope.agentSelection[0];
                    var skills = adminAgentService.skills();
                    skills.$promise.then(function() {
                        $scope.skills = skills;
                        var modalInstance = $modal.open({
                            templateUrl: 'partials/admin/users/agent.html',
                            controller: 'AdminAgentController',
                            resolve : {
                                agent : function() {
                                    return agent;
                                },
                                edit : function() {
                                    return true;
                                },
                                skills : function() {
                                    return skills;
                                }
                            }
                        });
                        modalInstance.result.then(function (agent) {
                            adminAgentService.save(agent)
                                .$promise.then(function() {
                                    updateSkills();
                                    updateAgents();
                                });
                        });
                    });
                }
            }
        };

        $scope.assignSkills = function() {
            if ($scope.sso) {
//                var skills = adminAgentService.skills();
//                skills.$promise.then(function() {
//                    $scope.skills = skills;
//                    var modalInstance = $modal.open({
//                        templateUrl: 'partials/admin/users/assignSkills.html',
//                        controller: 'AdminAssignSkillsController',
//                        resolve : {
//                            skills : function() {
//                                return skills;
//                            }
//                        }
//                    });
//                    modalInstance.result.then(function (agent) {
//                        updateSkills();
//                        adminAgentService.setAgentSkills({agentName:agent.username}, agent.skills)
//                            .$promise.then(function() {
//                                angular.forEach($scope.agentsData, function(data,index){
//                                    if ( data.username === agent.username ) {
//                                        data.skills = agent.skills;
//                                    }
//                                });
//                            });
//                    });
//                });
                if ( $scope.agentSelection.length > 0 ) {
                    var agent = $scope.agentSelection[0];
                    var skills = adminAgentService.skills();
                    skills.$promise.then(function() {
                        $scope.skills = skills;
                        var modalInstance = $modal.open({
                            templateUrl: 'partials/admin/users/assignSkills.html',
                            controller: 'AdminAgentController',
                            resolve : {
                                agent : function() {
                                    return agent;
                                },
                                edit : function() {
                                    return true;
                                },
                                skills : function() {
                                    return skills;
                                }
                            }
                        });
                        modalInstance.result.then(function (agent) {
                            updateSkills();
                            adminAgentService.setAgentSkills({agentName:agent.username}, agent.skills)
                                .$promise.then(function() {
                                    angular.forEach($scope.agentsData, function(data,index){
                                        if ( data.username === agent.username ) {
                                            data.skills = agent.skills;
                                        }
                                    });
                                });
                        });
                    });
                }
            }
        };

        updateSkills();
        updateAgents();
        $scope.updateAgentsInterval = $interval(function() {
            updateAgents();
        }, $scope.agentsRefreshTimeout);
        $scope.updateLoggedInAgentsInterval = $interval(function() {
            updateLoggedInAgents();
        }, $scope.loggedInAgentsRefreshTimeout);
        
        $scope.$on("$destroy", function(){
            $interval.cancel($scope.updateAgentsInterval);
            $interval.cancel($scope.updateLoggedInAgentsInterval);
        });

        $scope.$on('ngGridEventData', function() {
                var agentSelected = false;
                if ( $scope.agentSelection.length > 0 ) {
                    angular.forEach($scope.agentsData, function(data, index){
                        if(data.username === $scope.agentSelection[0].username){
                            $scope.agentsGridOptions.selectItem(index, true);
                            agentSelected = true;
                        }
                    });
                }
                if ( !agentSelected ) {
                    $scope.agentsGridOptions.selectItem(0, true);
                }
            }
        );

        $scope.pagingOptions = {
            pageSizes: [5, 10],
            pageSize: 5,
            currentPage: 1,
            totalServerItems: 0
        };

        var columnDefs = [
                { field: "username", displayName: "Username" },
                { field: "roles", displayName: "Roles", cellFilter: "rolesFilter | arrayComma"},
                { field: "skills", displayName: "Skills", cellFilter: "skillsFilter:skills | arrayComma"}
        ];
        $scope.agentsGridOptions = {
            data: 'agentsData',
            multiSelect: false,
            enablePaging: true,
            pagingOptions: $scope.pagingOptions,
            showFilter:true,
            columnDefs: columnDefs,
            enableColumnResize: true,
            selectedItems: $scope.agentSelection,
            afterSelectionChange: function(rowItem, event) {
                if ( $scope.agentSelection.length > 0  && $scope.agentSelection[0] &&
                    $scope.selectedAgent.username !== $scope.agentSelection[0].username )
                        $scope.selectedAgent.username = $scope.agentSelection[0].username;
                $scope.updateAllowedForSelection();
            },
            plugins: [ngGridDoubleClick],
            dblClickFn: $scope.editAgent
        };
    }
]);
