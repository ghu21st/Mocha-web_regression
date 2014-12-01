'use strict';

angular.module('controllers').controller('AdminApplicationConfigurationsController', ['$scope', '$interval', '$modal',
    'AdminApplicationConfigurationService',
    function($scope, $interval, $modal, adminApplicationConfigurationService) {

        $scope.applicationConfigurations = [];
        $scope.applicationConfigurationsData = [];
        $scope.applicationConfigurationSelection = [];

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

        var updateApplicationConfigurations = function () {
            $scope.applicationConfigurations = adminApplicationConfigurationService.all({}, function (value, responseHeaders) {
                if (responseHeaders()["content-type"] === "application/json") {
                    $scope.setApplicationConfigurations();
                } else {
                    reportErrorAndSignout("session ended");
                }
            });
            $scope.applicationConfigurations.$promise.then(null, function(error) {
                reportErrorAndSignout(error);
            });
        };

        $scope.setApplicationConfigurations = function() {
            $scope.applicationConfigurationsData = $scope.applicationConfigurations;
        };

        updateApplicationConfigurations();

        $scope.refresh = function() {
            updateApplicationConfigurations();
        }

        $scope.addApplicationConfiguration = function() {
            var modalInstance = $modal.open({
                templateUrl: 'partials/admin/appconfig/applicationConfiguration.html',
                controller: 'AdminApplicationConfigurationController',
                resolve : {
                    applicationConfiguration : function() {
                        return new adminApplicationConfigurationService(
                                    {name:"", dnisList:[], organizationIDApplicationIDList:[], contextList:[]});
                    },
                    edit : function() {
                        return false;
                    }
                }
            });
            modalInstance.result.then(function (applicationConfiguration) {
                applicationConfiguration.$save({},
                    function() {
                        $scope.applicationConfigurations.push(applicationConfiguration);
                        $scope.setApplicationConfigurations();
                    },
                    function(error) {
                        reportErrorAndSignout(error);
                    });
            });
        };

        $scope.editApplicationConfiguration = function() {
            if ( $scope.applicationConfigurationSelection.length > 0  && $scope.applicationConfigurationSelection[0] ) {
                var applicationConfiguration = $scope.applicationConfigurationSelection[0];
                var modalInstance = $modal.open({
                templateUrl: 'partials/admin/appconfig/applicationConfiguration.html',
                controller: 'AdminApplicationConfigurationController',
                resolve : {
                    applicationConfiguration : function() {
                        return applicationConfiguration;
                    },
                    edit : function() {
                        return true;
                    }
                }
                });
                modalInstance.result.then(function (applicationConfiguration) {
                    applicationConfiguration.$save({},
                        function() {
                            $scope.setApplicationConfigurations();
                        },
                        function(error) {
                            reportErrorAndSignout(error);
                        });
                });
            }
        };

        $scope.deleteApplicationConfiguration = function() {
            if ( $scope.applicationConfigurationSelection.length > 0  && $scope.applicationConfigurationSelection[0] ) {

                var name = $scope.applicationConfigurationSelection[0].name;
                var id = $scope.applicationConfigurationSelection[0].id;
                var modalInstance = $modal.open({
                    templateUrl: 'partials/admin/modal.html',
                    controller: 'AdminModalController',
                    resolve : {
                        header : function() {
                            return "Delete application configuration"
                        },
                        body : function() {
                            return "Do you want to delete application configuration with name \"" + name + "\"?";
                        }
                    }
                });
                modalInstance.result.then ( function() {
                    adminApplicationConfigurationService.delete({id:id});
                    angular.forEach($scope.applicationConfigurations, function(data, index){
                        if(data.id === $scope.applicationConfigurationSelection[0].id){
                            $scope.applicationConfigurations.splice(index, 1);
                            if ( index > 0 ) {
                                $scope.applicationConfigurationsGridOptions.selectItem(index-1, true);
                            }
                        }
                    });
                });
            }
        };

        $scope.$on('ngGridEventData', function() {
                var applicationConfigurationSelected = false;
                if ( $scope.applicationConfigurationSelection.length > 0 ) {
                    angular.forEach($scope.applicationConfigurations, function(data, index){
                        if(data.id === $scope.applicationConfigurationSelection[0].id){
                            $scope.applicationConfigurationsGridOptions.selectItem(index, true);
                            applicationConfigurationSelected = true;
                        }
                    });
                }
                if ( !applicationConfigurationSelected && $scope.applicationConfigurations.length > 0 ) {
                    $scope.applicationConfigurationsGridOptions.selectItem(0, true);
                }
            }
        );

        var columnDefs = [
            { field: "name", displayName: "Name", resizable: true },
            { field: "organizationIDApplicationIDList", displayName: "Applications", resizable: true, cellFilter:"propertiesColon:[\"organizationID\", \"applicationID\"]|arrayComma"},
            { field: "dnisList", displayName: "DNIS", resizable: true, cellFilter: "arrayComma"}

        ];

        $scope.applicationConfigurationsGridOptions = {
            data: 'applicationConfigurationsData',
            multiSelect: false,
            enablePaging: true,
            pagingOptions: {
                pageSizes: [5, 10],
                pageSize: 5,
                currentPage: 1
            },
            showFilter:true,
            columnDefs: columnDefs,
            enableColumnResize: true,
            selectedItems: $scope.applicationConfigurationSelection,
            afterSelectionChange: function(rowItem, event) {
                if ( $scope.applicationConfigurationSelection.length > 0  && $scope.applicationConfigurationSelection[0] &&
                    $scope.selection.applicationConfiguration.id !== $scope.applicationConfigurationSelection[0].id ) {
                        $scope.selection.applicationConfiguration = $scope.applicationConfigurationSelection[0];
                }
            },
            plugins: [ngGridDoubleClick],
            dblClickFn: $scope.editApplicationConfiguration
        };
    }
]);
