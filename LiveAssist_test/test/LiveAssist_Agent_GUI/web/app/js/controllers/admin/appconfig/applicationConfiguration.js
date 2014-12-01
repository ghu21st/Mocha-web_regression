'use strict';

angular.module('controllers').controller('AdminApplicationConfigurationController', ['$scope', '$modalInstance', 'applicationConfiguration', 'edit',
    function($scope, $modalInstance, applicationConfiguration, edit) {
        $scope.nameDisabled = false;
        $scope.resource = applicationConfiguration;
        $scope.applicationConfiguration = {name:"", dnisList:[{dnis:""}], organizationIDApplicationIDList:[{applicationID:"", organizationID:""}], contextList:[]};
        $scope.applicationSelection = [];
        $scope.header = "Add application configuration";

        if (edit) {
            $scope.header = "Edit application configuration";
            $scope.applicationConfiguration.name = applicationConfiguration.name;
            $scope.applicationConfiguration.organizationIDApplicationIDList =
                                            applicationConfiguration.organizationIDApplicationIDList.slice(0);
            $scope.applicationConfiguration.organizationIDApplicationIDList.push({applicationID:"", organizationID:""});
            for ( var i = 0; i < applicationConfiguration.dnisList.length; i ++) {
                $scope.applicationConfiguration.dnisList.splice(
                    $scope.applicationConfiguration.dnisList.length-1, 0, {dnis:applicationConfiguration.dnisList[i]});
            }
        }

        $scope.isApplicationRemovable = function (entity, selected) {
            if ( selected && ( entity.applicationID && entity.organizationID )) {
                return true;
            }
            return false;
        }

        $scope.isDnisRemovable = function (entity, selected) {
            if ( selected && entity.dnis) {
                return true;
            }
            return false;
        }

        $scope.removeApplicationClicked = function(rowNumber) {
            $scope.applicationConfiguration.organizationIDApplicationIDList.splice(rowNumber, 1);
        }

        $scope.removeDnisClicked = function(rowNumber) {
            $scope.applicationConfiguration.dnisList.splice(rowNumber, 1);
        }

        $scope.ok = function () {
            $scope.resource.name = $scope.applicationConfiguration.name;
            var leIndex = $scope.applicationConfiguration.organizationIDApplicationIDList.length -1;
            if ( !$scope.applicationConfiguration.organizationIDApplicationIDList[leIndex].applicationID ) {
                $scope.applicationConfiguration.organizationIDApplicationIDList.splice(leIndex, 1);
            }
            $scope.resource.organizationIDApplicationIDList =
                    $scope.applicationConfiguration.organizationIDApplicationIDList;
            leIndex = $scope.applicationConfiguration.dnisList.length -1;
            if ( !$scope.applicationConfiguration.dnisList[leIndex].dnis ) {
                $scope.applicationConfiguration.dnisList.splice(leIndex, 1);
            }
            var dnisList = [];
            for ( var i = 0; i < $scope.applicationConfiguration.dnisList.length; i ++) {
                dnisList.push($scope.applicationConfiguration.dnisList[i].dnis);
            }
            $scope.resource.dnisList = dnisList;
            $modalInstance.close($scope.resource);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.$on('ngGridEventEndCellEdit', function(evt){
            if ( evt.targetScope.gridId == $scope.applicationsGridOptions.ngGrid.gridId ) {
                if (evt.targetScope.row.rowIndex == $scope.applicationConfiguration.organizationIDApplicationIDList.length -1
                    && ( evt.targetScope.row.entity.applicationID || evt.targetScope.row.entity.organizationID )) {
                    $scope.applicationConfiguration.organizationIDApplicationIDList.push({applicationID:"", organizationID:""});
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }
            } else if ( evt.targetScope.gridId == $scope.dnisGridOptions.ngGrid.gridId ) {
                if (evt.targetScope.row.rowIndex == $scope.applicationConfiguration.dnisList.length -1
                    && evt.targetScope.row.entity.dnis ) {
                    $scope.applicationConfiguration.dnisList.push({dnis:""});
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }
            }
        });

        $scope.applicationsGridOptions = {
            data: 'applicationConfiguration.organizationIDApplicationIDList',
            multiSelect: false,
            showFilter:false,
            enableCellEdit:true,
            selectedItems: $scope.applicationSelection,
            columnDefs: [
                { field: "applicationID", displayName: "Application"},
                { field: "organizationID", displayName: "Organization"}
            ],

            enableColumnResize: false,
            enableSorting: false,

            rowTemplate:
                "<div ng-style=\"{ 'cursor': row.cursor }\" ng-repeat=\"col in renderedColumns\" ng-class=\"col.colIndex()\" class=\"ngCell {{col.cellClass}}\">\r" +
                "\n" +
                "\t<div class=\"ngVerticalBar\" ng-style=\"{height: rowHeight}\" ng-class=\"{ ngVerticalBarVisible: !$last }\">&nbsp;</div>\r" +
                "\n" +
                "\t<div ng-cell></div>\r" +
                "\n" +
                "</div>" +
                "\n" +
                "<i  class=\"glyphicon glyphicon-remove verticalyCentered pull-right\" ng-show=\"isApplicationRemovable(row.entity, row.selected)\" ng-click=\"removeApplicationClicked(row.rowIndex)\"/>"
        };

        $scope.dnisGridOptions = {
            data: 'applicationConfiguration.dnisList',
            multiSelect: false,
            showFilter:false,
            enableCellEdit:true,
            columnDefs: [
                { field: "dnis", displayName: "DNIS" }
            ],

            enableColumnResize: false,
            enableSorting: false,

            rowTemplate:
                "<div ng-style=\"{ 'cursor': row.cursor }\" ng-repeat=\"col in renderedColumns\" ng-class=\"col.colIndex()\" class=\"ngCell {{col.cellClass}}\">\r" +
                    "\n" +
                    "\t<div class=\"ngVerticalBar\" ng-style=\"{height: rowHeight}\" ng-class=\"{ ngVerticalBarVisible: !$last }\">&nbsp;</div>\r" +
                    "\n" +
                    "\t<div ng-cell></div>\r" +
                    "\n" +
                    "</div>" +
                    "\n" +
                    "<i  class=\"glyphicon glyphicon-remove verticalyCentered pull-right\" ng-show=\"isDnisRemovable(row.entity, row.selected)\" ng-click=\"removeDnisClicked(row.rowIndex)\"/>"
        };
    }
]);
