'use strict';

angular.module('controllers').controller('AdminApplicationContextsController', ['$scope', '$interval', '$modal',
    'AdminApplicationConfigurationContextService',
    function($scope, $interval, $modal, adminApplicationConfigurationContextService) {

        $scope.applicationContexts = [];
        $scope.applicationConfigurationId = "";
        $scope.applicationContextsData = [];
        $scope.applicationContextSelection = [];
        $scope.applicationConfigurationName = "";
        $scope.skills = adminApplicationConfigurationContextService.skills();

        var reportErrorAndSignout = function(error) {
            var errorMsg;
            if ('message' in error) {
                errorMsg = error.message;
            } else {
                errorMsg = JSON.stringify(error, null, 2);
            }
            alert('An error occurred contacting the Live Assist server, error: "' + errorMsg + '".\nPlease report this error to your administrator.');
            $scope.signOut();
        };

        var updateApplicationContexts = function () {
            if( $scope.selection.applicationConfiguration.id ) {
                $scope.applicationConfigurationId = $scope.selection.applicationConfiguration.id;
                $scope.applicationConfigurationName = $scope.selection.applicationConfiguration.name;
                $scope.applicationContexts =
                    adminApplicationConfigurationContextService.all(
                        {applicationConfigurationId:$scope.selection.applicationConfiguration.id},
                        function (value, responseHeaders) {
                            if (responseHeaders()["content-type"] === "application/json") {
                                $scope.setApplicationContexts();
                            } else {
                                reportErrorAndSignout("session ended");
                            }
                        });
                $scope.applicationContexts.$promise.then(null, function(error) {
                    reportErrorAndSignout(error);
                });
            }
        };

        $scope.setApplicationContexts = function() {
            $scope.applicationContextsData = $scope.applicationContexts;
        };

        updateApplicationContexts();

        $scope.addApplicationContext = function() {
            var skills = $scope.skills;
            var modalInstance = $modal.open({
                templateUrl: 'partials/admin/appconfig/applicationContext.html',
                controller: 'AdminApplicationContextController',
                resolve : {
                    applicationContext : function() {
                        return new adminApplicationConfigurationContextService(
                            {name:""});
                    },
                    edit : function() {
                        return false;
                    },
                    skills : function() {
                        return skills;
                    }
                }
            });
            modalInstance.result.then(function (applicationContext) {
                applicationContext.$save({applicationConfigurationId:$scope.applicationConfigurationId},
                    function() {
                        $scope.selection.applicationConfiguration.$get({},
                        function() {
                            updateApplicationContexts();
                        });
                    },
                    function(error) {
                        reportErrorAndSignout(error);
                    });
            });
        };

        $scope.editApplicationContext = function() {
            if ( $scope.applicationContextSelection.length > 0  && $scope.applicationContextSelection[0] ) {
                var applicationContext = $scope.applicationContextSelection[0];
                var skills = $scope.skills;
                var modalInstance = $modal.open({
                    templateUrl: 'partials/admin/appconfig/applicationContext.html',
                    controller: 'AdminApplicationContextController',
                    resolve : {
                        applicationContext : function() {
                            return applicationContext;
                        },
                        edit : function() {
                            return true;
                        },
                        skills : function() {
                            return skills;
                        }
                    }
                });
                modalInstance.result.then(function (newApplicationContext) {
                    newApplicationContext.$save({applicationConfigurationId:$scope.applicationConfigurationId},
                        function() {
                            $scope.selection.applicationConfiguration.$get({},
                                function() {
                                    updateApplicationContexts();
                                });
                        },
                        function(error) {
                            reportErrorAndSignout(error);
                        });
                });
            }
        };

        $scope.deleteApplicationContext = function() {
            if ( $scope.applicationContextSelection.length > 0  && $scope.applicationContextSelection[0] ) {

                var name = $scope.applicationContextSelection[0].name;
                var applicationConfigurationId = $scope.applicationConfigurationId;
                var applicationContext = $scope.applicationContextSelection[0];
                var modalInstance = $modal.open({
                    templateUrl: 'partials/admin/modal.html',
                    controller: 'AdminModalController',
                    resolve : {
                        header : function() {
                            return "Delete application context"
                        },
                        body : function() {
                            return "Do you want to delete application context with name \"" + name + "\"?";
                        }
                    }
                });
                modalInstance.result.then ( function() {
                    applicationContext.$delete({applicationConfigurationId:applicationConfigurationId}, function() {
                        angular.forEach($scope.applicationContexts, function(data, index){
                            if(data.id === $scope.applicationContextSelection[0].id){
                                $scope.applicationContexts.splice(index, 1);
                                if ( index > 0 ) {
                                    $scope.applicationContextsGridOptions.selectItem(index-1, true);
                                }
                            }
                        });
                    });
                });
            }

        };

        $scope.$on('ngGridEventData', function() {
                var applicationContextSelected = false;
                if ( $scope.applicationContextSelection.length > 0 ) {
                    angular.forEach($scope.applicationContexts, function(data, index){
                        if(data.id === $scope.applicationContextSelection[0].id){
                            $scope.applicationContextsGridOptions.selectItem(index, true);
                            applicationContextSelected = true;
                        }
                    });
                }
                if ( !applicationContextSelected && $scope.applicationContexts) {
                    if ( $scope.applicationContexts.length > 0 )
                        $scope.applicationContextsGridOptions.selectItem(0, true);
                    else
                        $scope.applicationContextSelection.length = 0;
                }
            }
        );

        $scope.$watch("selection.applicationConfiguration.id", function (newValue, oldValue) {
            if (newValue && newValue !== oldValue)
                updateApplicationContexts();
        });


        $scope.applicationContextsGridOptions = {
            data: 'applicationContextsData',
            multiSelect: false,
            enablePaging: true,
            pagingOptions: {
                pageSizes: [5, 10],
                pageSize: 5,
                currentPage: 1
            },
            showFilter:true,
            columnDefs: [
                { field: "name", displayName: "Name", resizable: true },
                { field: "pickListId", displayName: 'PickList', resizable: true},
                { field: "escalationClassifierId", displayName: 'Escalation Classifier', resizable: true}
            ],
            enableColumnResize: true,
            selectedItems: $scope.applicationContextSelection,
            plugins: [ngGridDoubleClick],
            dblClickFn: $scope.editApplicationContext
        };
    }
]);
