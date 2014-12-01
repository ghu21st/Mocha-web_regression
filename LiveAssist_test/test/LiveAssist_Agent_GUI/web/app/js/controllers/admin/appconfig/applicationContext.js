'use strict';

angular.module('controllers').controller('AdminApplicationContextController', ['$scope', '$modalInstance', '$filter',
    'applicationContext', 'edit', 'skills',
    function($scope, $modalInstance, $filter, applicationContext, edit, skills) {
        $scope.nameDisabled = false;
        $scope.resource = applicationContext;
        $scope.applicationContext = {name:"", escalationClassifierId:"DynamicEscalationClassifier", pickListId:"",
            assistGrammarList:[{grammar:""}], commandGrammarList:[{grammar:""}],
            skillList:[{skill:""}], parameterList:[
                                                   {name:"agent_pending_completion_cause", value:"success"},
                                                   {name:"agent_pending_recognition_result", value:"AGENT_PENDING"},
                                                   {name:"immediate_percentage", value:"100"},
                                                   {name:"no_input_percentage", value:"0"},
                                                   {name:"low_confidence_percentage", value:"0"},
                                                   {name:"minimum_confidence_threshold", value:"0"},
                                                   {name:"middle_confidence_percentage", value:"0"},
                                                   {name:"maximum_confidence_threshold", value:"1.0"},
                                                   {name:"high_confidence_percentage", value:"0"},
                                                   {name:"", value:""}
                                                  ]};
        $scope.header = "Add application context";
        $scope.skills = skills;

        if (edit) {
            $scope.header = "Edit application context";
            $scope.applicationContext.name = applicationContext.name;
            $scope.applicationContext.escalationClassifierId = applicationContext.escalationClassifierId;
            $scope.applicationContext.pickListId = applicationContext.pickListId;

            for ( var i = 0; i < applicationContext.assistGrammarList.length; i ++) {
                $scope.applicationContext.assistGrammarList.splice(
                    $scope.applicationContext.assistGrammarList.length-1, 0, {grammar:applicationContext.assistGrammarList[i]});
            }
            for ( var i = 0; i < applicationContext.commandGrammarList.length; i ++) {
                $scope.applicationContext.commandGrammarList.splice(
                    $scope.applicationContext.commandGrammarList.length-1, 0, {grammar:applicationContext.commandGrammarList[i]});
            }
            $scope.applicationContext.parameterList = angular.copy(applicationContext.parameterList);
            $scope.applicationContext.parameterList.push({name:"", value:""});
            for ( var i = 0; i < applicationContext.skillList.length; i ++) {
                $scope.applicationContext.skillList.splice(
                    $scope.applicationContext.skillList.length-1, 0, {skill:applicationContext.skillList[i]});
            }

        }

        $scope.isGrammarRemovable = function (entity, selected) {
            if ( selected && entity.grammar ) {
                return true;
            }
            return false;
        }

        $scope.isParameterRemovable = function (entity, selected) {
            if ( selected && entity.name ) {
                return true;
            }
            return false;
        }

        $scope.isSkillRemovable = function (entity, selected) {
            if ( selected && entity.skill ) {
                return true;
            }
            return false;
        }

        $scope.removeAssistGrammarClicked = function(rowNumber) {
            $scope.applicationContext.assistGrammarList.splice(rowNumber, 1);
        }

        $scope.removeCommandGrammarClicked = function(rowNumber) {
            $scope.applicationContext.commandGrammarList.splice(rowNumber, 1);
        }

        $scope.removeSkillClicked = function(rowNumber) {
            $scope.applicationContext.skillList.splice(rowNumber, 1);
        }

        $scope.removeParameterClicked = function(rowNumber) {
            $scope.applicationContext.parameterList.splice(rowNumber, 1);
        }

        $scope.ok = function () {
            $scope.resource.name = $scope.applicationContext.name;
            $scope.resource.escalationClassifierId = $scope.applicationContext.escalationClassifierId;
            $scope.resource.pickListId = $scope.applicationContext.pickListId;
            var leIndex = $scope.applicationContext.assistGrammarList.length -1;
            if ( !$scope.applicationContext.assistGrammarList[leIndex].grammar ) {
                $scope.applicationContext.assistGrammarList.splice(leIndex, 1);
            }
            var assistGrammarList = [];
            for ( var i = 0; i < $scope.applicationContext.assistGrammarList.length; i ++) {
                assistGrammarList.push($scope.applicationContext.assistGrammarList[i].grammar);
            }
            $scope.resource.assistGrammarList = assistGrammarList;
            leIndex = $scope.applicationContext.commandGrammarList.length -1;
            if ( !$scope.applicationContext.commandGrammarList[leIndex].grammar ) {
                $scope.applicationContext.commandGrammarList.splice(leIndex, 1);
            }
            var commandGrammarList = [];
            for ( var i = 0; i < $scope.applicationContext.commandGrammarList.length; i ++) {
                commandGrammarList.push($scope.applicationContext.commandGrammarList[i].grammar);
            }
            $scope.resource.commandGrammarList = commandGrammarList;
            leIndex = $scope.applicationContext.parameterList.length -1;
            if ( !$scope.applicationContext.parameterList[leIndex].name ) {
                $scope.applicationContext.parameterList.splice(leIndex, 1);
            }
            $scope.resource.parameterList = $scope.applicationContext.parameterList;
            leIndex = $scope.applicationContext.skillList.length -1;
            if ( !$scope.applicationContext.skillList[leIndex].skill ) {
                $scope.applicationContext.skillList.splice(leIndex, 1);
            }
            var skillList = [];
            for ( var i = 0; i < $scope.applicationContext.skillList.length; i ++) {
                skillList.push($scope.applicationContext.skillList[i].skill);
            }
            $scope.resource.skillList = skillList;
            $modalInstance.close($scope.resource);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.$on('ngGridEventEndCellEdit', function(evt){
            if ( evt.targetScope.gridId == $scope.assistGrammarGridOptions.ngGrid.gridId ) {
                if (evt.targetScope.row.rowIndex == $scope.applicationContext.assistGrammarList.length -1
                    && evt.targetScope.row.entity.grammar ) {
                    $scope.applicationContext.assistGrammarList.push({grammar:""});
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }
            } else if ( evt.targetScope.gridId == $scope.commandGrammarGridOptions.ngGrid.gridId ) {
                if (evt.targetScope.row.rowIndex == $scope.applicationContext.commandGrammarList.length -1
                    && evt.targetScope.row.entity.grammar ) {
                    $scope.applicationContext.commandGrammarList.push({grammar:""});
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }
            } else if ( evt.targetScope.gridId == $scope.parameterGridOptions.ngGrid.gridId ) {
                if (evt.targetScope.row.rowIndex == $scope.applicationContext.parameterList.length -1
                    && evt.targetScope.row.entity.name ) {
                    $scope.applicationContext.parameterList.push({name:"", value:""});
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }
            } else if ( evt.targetScope.gridId == $scope.skillGridOptions.ngGrid.gridId ) {
                if (evt.targetScope.row.rowIndex == $scope.applicationContext.skillList.length -1
                    && evt.targetScope.row.entity.skill ) {
                    $scope.applicationContext.skillList.push({skill:""});
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }
            }
        });


        $scope.assistGrammarGridOptions = {
            data: 'applicationContext.assistGrammarList',
            multiSelect: false,
            showFilter:false,
            enableCellEdit:true,
            columnDefs: [
                { field: "grammar", displayName: "Assist grammar" }
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
                    "<i  class=\"glyphicon glyphicon-remove verticalyCentered pull-right\" ng-show=\"isGrammarRemovable(row.entity, row.selected)\" ng-click=\"removeAssistGrammarClicked(row.rowIndex)\"/>"
        };

        $scope.commandGrammarGridOptions = {
            data: 'applicationContext.commandGrammarList',
            multiSelect: false,
            showFilter:false,
            enableCellEdit:true,
            columnDefs: [
                { field: "grammar", displayName: "Command grammar" }
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
                    "<i  class=\"glyphicon glyphicon-remove verticalyCentered pull-right\" ng-show=\"isGrammarRemovable(row.entity, row.selected)\" ng-click=\"removeCommandGrammarClicked(row.rowIndex)\"/>"
        };

        $scope.skillGridOptions = {
            data: 'applicationContext.skillList',
            multiSelect: false,
            showFilter:false,
            enableCellEdit:true,
            columnDefs: [
                {
                    field: "skill", displayName: "Skills",
                    cellFilter: "skillsFilter:skills",
                    editableCellTemplate:
                        "<select  ng-cell-input " +
                        "ng-options='skill.id as skill.name for skill in skills' " +
                        "ng-class=\"'colt' + $index\" ng-model=\"COL_FIELD\" ng-input=\"COL_FIELD\" " +
                        "data-placeholder=\"-- Select One --\">" +
                        "</select>"
                }
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
                    "<i  class=\"glyphicon glyphicon-remove verticalyCentered pull-right\" ng-show=\"isSkillRemovable(row.entity, row.selected)\" ng-click=\"removeSkillClicked(row.rowIndex)\"/>"
        };

        $scope.parameterGridOptions = {
            data: 'applicationContext.parameterList',
            multiSelect: false,
            showFilter:false,
            enableCellEdit:true,
            columnDefs: [
                { field: "name", displayName: "Parameter name" },
                { field: "value", displayName: "Parameter value" }
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
                    "<i  class=\"glyphicon glyphicon-remove verticalyCentered pull-right\" ng-show=\"isParameterRemovable(row.entity, row.selected)\" ng-click=\"removeParameterClicked(row.rowIndex)\"/>"
        };

    }
]);
