'use strict';

angular.module('controllers').controller('TrainingController',
    ['$scope', '$modal', '$timeout', 'TrainingService', '$interval', '$log', '$filter', 'RestError',
    function($scope, $modal, $timeout, db, $interval, $log, $filter, restError) {

        naturalSort.insensitive = true;

        $scope.assignTraining = function () {
            var modalStart = $modal.open({
                templateUrl: 'partials/admin/training/assignTraining.html',
                controller: 'AssignTrainingController',
                windowClass: 'assign-training',
                resolve: {
                    trainingSets: function() { return $scope.trainingSets; },
                    usernames: function() { return $scope.usernames; }
                }
            });
            modalStart.result.then(function (newRun) {
                db.runs.save({}, newRun, function (result) {
                    $scope.runs.push(result);
                    $scope.runs.sort(trainingRunCompare);
                    startMonitor(newRun);
                }, restError.alert);
            });
        };

        $scope.manageTrainingSets = function () {
            var modalManage = $modal.open({
                templateUrl: 'partials/admin/training/manageTrainingSets.html',
                controller: 'ManageTrainingSetsController',
                size: 'sm',
                resolve: {
                    trainingSets: function() { return $scope.trainingSets; }
                }
            });
            modalManage.result.then(function () {
                loadRuns(); // reflect possible side-effects on training runs
            });
        };

        // sets display order
        var trainingRunCompare = function (l,r) {
            if (l['final'] && r['final']) {
                return l.updated < r.updated ? 1 : l.updated > r.updated ? -1 : 0;
            } else if (!l['final'] && r['final']) {
                return -1;
            } else if (l['final'] && !r['final']) {
                return 1;
            } else if (l.target !== r.target) {
                // naturalsort doesn't sort nulls consistently
                if (l.target == null) {
                    return 1;
                }
                else if (r.target == null) {
                    return -1;
                }
                else {
                    return naturalSort(l.target, r.target);
                }
            } else if (l.active) {
                return -1;
            } else if (r.active) {
                return 1;
            } else {
                return l.created < r.created ? -1 : l.created > r.created ? 1 : 0;
            }
        };

        $scope.runs = [];
        $scope.mousedRow = {index: null, disabled: false};
        var loadRuns = function () {
            var updatedRuns = db.runs.query(function () {
                updatedRuns.sort(trainingRunCompare);

                // disable hover controls if run in at mousedRowIndex changed id or final state
                var mousedRun = $scope.mousedRow.index != null ?
                                $scope.runs[$scope.mousedRow.index] : null;
                var updatedRun = $scope.mousedRow.index != null && $scope.mousedRow.index < updatedRuns.length ?
                                 updatedRuns[$scope.mousedRow.index] : null;
                if (mousedRun != null && updatedRun != null && (mousedRun.id != updatedRun.id || mousedRun['final'] != updatedRun['final'])) {
                    $scope.mousedRow.disabled = true;
                }

                $scope.runs = updatedRuns;
                var haveActiveRuns = false;
                for (var i=0; i<$scope.runs.length; i++) {
                    if ($scope.runs[i].active) {
                        haveActiveRuns = true;
                        break;
                    }
                }
                if (haveActiveRuns) {
                    startMonitor();
                } else {
                    cancelMonitor();
                }
            }, restError.alert);
        };

        var activeMonitor = undefined;
        var updateActive = function () {
            var active = db.active.get(function () {
                for (var i=0; i<$scope.runs.length; i++) {
                    var run = $scope.runs[i];
                    if (run.id in active) {
                        angular.forEach(active[run.id], function(value, key) { run[key] = value; });
                    } else if (run.active) {
                        // Ambiguous actual state, could be the result of:
                        // 1. the run was added to $scope.runs[] as a new run
                        // 2. the run went inactive and has stale state in $scope.runs[]
                        // 3. 1 followed by 2 in quick  succession
                        // No choice but to reload $scope.runs[].
                        $timeout(function () { loadRuns(); }, 0);
                        return;
                    }
                }

                if (active.length === 0) {
                    cancelMonitor();
                }
            }, restError.alert);
        };

        var startMonitor = function (newRun) {
            if (!angular.isDefined(activeMonitor)) {
                activeMonitor = $interval(function () { updateActive(); }, 5000);
            } else if (angular.isDefined(newRun)){
                // if new training run target appears active in runs[], update now
                for (var i=0; i<$scope.runs.length; i++) {
                    if ($scope.runs[i].active && $scope.runs[i].target === newRun.target) {
                        updateActive();
                        break;
                    }
                }
            }
        }

        var cancelMonitor = function () {
            if (angular.isDefined(activeMonitor)) {
                $interval.cancel(activeMonitor);
                activeMonitor = undefined;
            }
        };

        $scope.$on('$destroy', function () { cancelMonitor(); });

        $scope.canStart = function (run) {
            if (run.final || run.active) {
                return false;
            }
            for (var i = $scope.runs.indexOf(run)-1; i >= 0 && $scope.runs[i].target === run.target; i--) {
                if ($scope.runs[i].active) {
                    return false;
                }
            }
            return true;
        }

        // op = start/stop/cancel
        $scope.runOp = function (run, op) {
            db[op](run.id).success(function (updatedRun) {
                angular.forEach(updatedRun, function(value, key) { run[key] = value; });
                resortGridData();
                if (op === 'start' && updatedRun.active) {
                    startMonitor();
                }
            }).error(restError.alert);
        };

        var resortGridData = function () {
            var resorted = $scope.runs.slice();
            resorted.sort(trainingRunCompare);
            $scope.runs = resorted;
        }

        $scope.deleteRun = function (run) {
            db.runs.remove(run, function () {
                $scope.runs.splice($scope.runs.indexOf(run), 1);
            }, restError.alert);
        };

        var targetCellTmpl = 
          '<div class="ngCellText" ng-class="col.colIndex()">'
        +   '<span ng-cell-text>{{COL_FIELD || "Any available agent"}}</span>'
        + '</div>';

        var uttsRemainingCellTmpl =
          '<div class="ngCellText clearfix" ng-class="col.colIndex()">'
        +   '<span ng-show="row.entity.numUttsRemaining > 0 && row.entity.active && !row.entity.stalled" class="badge btn-success disabled pull-right">'
        +     '{{row.entity.numUttsRemaining}}'
        +   '</span>'
        +   '<span ng-show="row.entity.numUttsRemaining > 0 && row.entity.active && row.entity.stalled" class="badge btn-info disabled pull-right">'
        +     '{{row.entity.numUttsRemaining}}'
        +   '</span>'
        +   '<span ng-show="row.entity.numUttsRemaining > 0 && !row.entity.active" class="badge pull-right">'
        +     '{{row.entity.numUttsRemaining}}'
        +   '</span>'
        +   '<span ng-show="row.entity.numUttsRemaining === 0" class="glyphicon pull-right" '
        +         'ng-class="row.entity.canceled ? \'glyphicon-remove-sign\' : \'glyphicon-ok-sign\'" '
        +         'style="margin-top:2px;">'
        +   '</span>'
        + '</div>';

        $scope.activityGrid = {

            enableRowSelection: false,
            enableSorting: false,

            data: 'runs',
            columnDefs: [ { field: 'updated', cellFilter: 'date:"yyyy/MM/dd HH:mm:ss"', displayName: 'Updated', width:160 },
                          { field: 'target', displayName: 'Target', cellTemplate: targetCellTmpl, width:160 },
                          { field: 'trainingSetName', displayName: 'Training set', width:225 },
                          { field: 'uttsRemaining', displayName: '', cellTemplate: uttsRemainingCellTmpl, width:60 },
                          { field: 'comment', displayName: 'Notes' }
                        ],

            // custom templates to remove divider bewteen training set name & utterance odometer so they appear to occupy same cell,
            // and add hover controls at row end
            rowTemplate:
              '<div ng-mouseenter="mousedRow.index=row.rowIndex;mousedRow.disabled=false" ng-mouseleave="mousedRow.index=null">'
            +   '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}">'
            +     '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last &amp;&amp; $index != 2 }">&nbsp;</div>'
            +     '<div ng-cell></div>'
            +   '</div>'
            +   '<div class="pull-right" style="margin:3px;" ng-show="mousedRow.index===row.rowIndex">'
            +     '<div class="btn-group" ng-show="!row.entity.final">'
            +       '<button class="btn btn-default btn-xs" ng-disabled="mousedRow.disabled || !canStart(row.entity)" ng-click="runOp(row.entity, \'start\')">'
            +         '<span class="glyphicon glyphicon-play"></span>'
            +       '</button>'
            +       '<button class="btn btn-default btn-xs" ng-disabled="mousedRow.disabled || !row.entity.active" ng-click="runOp(row.entity, \'stop\')">'
            +         '<span class="glyphicon glyphicon-stop"></span>'
            +       '</button>'
            +     '</div>'
            +     '<div class="btn-group" ng-show="!row.entity.final" style="margin-left:3px;">'
            +       '<button class="btn btn-default btn-xs" ng-disabled="mousedRow.disabled" ng-click="runOp(row.entity, \'cancel\')">'
            +         '<span class="glyphicon glyphicon-remove"></span>'
            +       '</button>'
            +     '</div>'
            +     '<div class="btn-group" ng-show="row.entity.final">'
            +       '<button class="btn btn-default btn-xs" ng-disabled="mousedRow.disabled" ng-click="deleteRun(row.entity)">'
            +         '<span class="glyphicon glyphicon-trash"></span>'
            +       '</button>'
            +     '</div>'
            +   '</div>'
            + '</div>',


            headerRowTemplate:
              '<div ng-style="{ height: col.headerRowHeight }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngHeaderCell">'
            + '<div class="ngVerticalBar" ng-style="{height: col.headerRowHeight}" ng-class="{ ngVerticalBarVisible: !$last &amp;&amp; $index != 2 }">&nbsp;</div>'
            + '<div ng-header-cell></div></div>'
        };

        //
        // load chain: training sets => usernames => runs
        //

        $scope.trainingSets = db.sets.query(function () {
            $scope.trainingSets.sort(function (l,r) { return naturalSort(l.name, r.name); });
            loadUsernames();
        }, restError.alert);

        var loadUsernames = function () {
            $scope.usernames = db.users.get(function() {
                // convert csv back to array, because angular resource sucks at arrays of string literals
                $scope.usernames = $scope.usernames.users.split(',');
                loadRuns();
            }, restError.alert);
        }
    }
]);

angular.module('controllers').controller('AssignTrainingController', ['$scope', '$modalInstance', '$log', 'trainingSets', 'usernames',
    function ($scope, $modalInstance, $log, trainingSets, usernames) {
        $scope.usernames = usernames;
        $scope.trainingSets = trainingSets;
        $scope.trainingRun = {trainingSetId:null, target:null, shuffle:true, comment:""};
        $scope.selectedTrainingSetIdx = -1;

        $scope.ok = function () {
            $scope.trainingRun.trainingSetId = trainingSets[$scope.selectedTrainingSetIdx].id;
            if ($scope.trainingRun.target === "*") { // the "any available agent" option
                $scope.trainingRun.target = null;
            }
            $modalInstance.close($scope.trainingRun);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }
]);

angular.module('controllers').controller('ManageTrainingSetsController',
    ['$scope', '$modalInstance', '$modal', '$log', '$timeout', '$upload', 'TrainingService', 'RestError', 'trainingSets',
    function ($scope, $modalInstance, $modal, $log, $timeout, $upload, db, restError, trainingSets) {
        $scope.trainingSets = trainingSets.slice();
        $scope.selectedTrainingSetIdx = null;
        $scope.readOnlyTrainingSet = false;
        $scope.editedTrainingSet = null;
        $scope.editedTrainingSetIsNew = false;
        $scope.upload = null;
        var restoreSelectedTrainingSetIdx = null; // if user creates new then cancels

        $scope.$watch('selectedTrainingSetIdx', function () {
            if ($scope.selectedTrainingSetIdx != null) {
                db.refcounts($scope.trainingSets[$scope.selectedTrainingSetIdx].id).success(function(refcounts) {
                    $scope.selectedTrainingSetRefcount = refcounts['final'];
                    $scope.readOnlyTrainingSet = refcounts.nonfinal > 0;
                }).error(function (data, status) {
                    if (status === restError.sessionExpired) { $modalInstance.close(); }
                    restError.alert(undefined, status);
                });
            }
        });

        $scope.trainingSetNameExists = function (name) {
            for (var i=0; i<$scope.trainingSets.length; i++) {
                var trainingSet = $scope.trainingSets[i];
                if (trainingSet.name === name && trainingSet.id != $scope.editedTrainingSet.id) {
                    return true;
                }
            }
            return false;
        };

        $scope.applicationIds = null;
        $scope.$watch('editedTrainingSet.organizationId', function () {
            if ($scope.editedTrainingSet != null) {
                // if valid orgid
                //   initialize appid selection
                //   [in]validate current appid
                // else
                //   null out the new value and trailing selections
                if ($scope.organizationIds.indexOf($scope.editedTrainingSet.organizationId) != -1) {
                    db.appIds($scope.editedTrainingSet).success(function(appIds) {
                        $scope.applicationIds = appIds;
                        if ($scope.applicationIds.indexOf($scope.editedTrainingSet.applicationId) == -1) {
                            $scope.editedTrainingSet.applicationId = null;
                            $scope.editedTrainingSet.context = null;
                            $scope.contexts = null;
                        }
                    }).error(function (data, status) {
                        if (status === restError.sessionExpired) { $modalInstance.close(); }
                        restError.alert(undefined, status);
                    });
                } else {
                    $scope.editedTrainingSet.organizationId = null;
                    $scope.editedTrainingSet.applicationId = null;
                    $scope.applicationIds = null;
                    $scope.editedTrainingSet.context = null;
                    $scope.contexts = null;
                }
            }
        });

        $scope.contexts = null;
        $scope.$watchCollection('[applicationIds, editedTrainingSet.applicationId]', function () {
            // if appid selection validated, load contexts and validate
            if ($scope.applicationIds != null && $scope.editedTrainingSet != null
                && $scope.editedTrainingSet.applicationId != null) {
                db.contexts($scope.editedTrainingSet).success(function (contexts) {
                    $scope.contexts = contexts;
                    if ($scope.contexts.indexOf($scope.editedTrainingSet.context) == -1) {
                        $scope.editedTrainingSet.context = null;
                    }
                }).error(function (data, status) {
                    if (status === restError.sessionExpired) { $modalInstance.close(); }
                    restError.alert(undefined, status);
                });
            }
        });

        var resortTrainingSets = function() {
            // in-place sort won't update select2
            $scope.trainingSets = $scope.trainingSets.slice().sort(function (l,r) { return naturalSort(l.name, r.name); });
        }

        // workaround select2 bug where displayed selection is not updated from model update
        var select2DisplayUpdateWorkaround = function () {
            var idx = $scope.selectedTrainingSetIdx;
            $scope.selectedTrainingSetIdx = null;
            $timeout(function () { $scope.selectedTrainingSetIdx = idx; }, 0);
        };

        $scope.newTrainingSet = function (file) {
            // create a new trainingSet with null name, then set a default name
            var newTrainingSet = {organizationId:'', applicationId:'', context:''};
            db.sets.save({}, newTrainingSet, function (result) {
                newTrainingSet.id = result.id;
                newTrainingSet.name = "TrainingSet" + newTrainingSet.id;
                db.sets.update(newTrainingSet, uploadUtterancesFile, restError.alert);
            }, restError.alert);
            var uploadUtterancesFile = function () {
                $scope.upload = {filename: file.name, error: false, errorMessage: null, percent: 0};
                var fileReader = new FileReader();
                fileReader.readAsArrayBuffer(file);
                fileReader.onload = function (e) {
                    $upload.http({
                        url: db.uploadPath(newTrainingSet.id),
                        method: 'POST',
                        headers: { 'Content-type': 'text/plain; charset=utf-8' },
                        data: e.target.result
                    }).progress(function (evt) {
                        $scope.upload.percent = parseInt(100.0 * evt.loaded / evt.total);
                    }).success(function () {
                        $scope.upload.percent = 100;
                        // let full progress linger
                        $timeout(function () {
                            $scope.upload = null;
                            $scope.editedTrainingSet = db.sets.get({id:newTrainingSet.id}, function () {
                                $scope.editedTrainingSetIsNew = true;
                                // append to $scope.trainingSets[] and re-sort
                                $scope.trainingSets.push($scope.editedTrainingSet);
                                resortTrainingSets();
                                restoreSelectedTrainingSetIdx = $scope.selectedTrainingSetIdx;
                                // set $scope.selectedTrainingSetIdx to its new index
                                for (var i=0; i<$scope.trainingSets.length; i++) {
                                    if ($scope.trainingSets[i].id === $scope.editedTrainingSet.id) {
                                        $scope.selectedTrainingSetIdx = i;
                                        break;
                                    }
                                }
                                select2DisplayUpdateWorkaround();
                            }, restError.alert);
                        }, 1100);
                    }).error(function (data, status, headers, config) {
                        if (status != restError.sessionExpired) {
                            db.sets.remove({id:newTrainingSet.id}, function () {
                                $modal.open({
                                    templateUrl: 'partials/admin/training/showTrainingSetUploadErrors.html',
                                    controller: 'ShowTrainingSetUploadErrorsController',
                                    size: data.length ? 'lg' : 'sm',
                                    resolve: { filename: function() { return $scope.upload.filename; },
                                                   data: function() { return data; } }
                                });
                                $scope.upload = null;
                            } , restError);
                        }
                    });
                };
            };
        };

        $scope.editTrainingSet = function () {
            $scope.editedTrainingSetIsNew = false;
            $scope.editedTrainingSet = angular.copy($scope.trainingSets[$scope.selectedTrainingSetIdx]);
        };

        $scope.saveEdits = function () {
            db.sets.update($scope.editedTrainingSet, function () {
                var nameChanged = $scope.editedTrainingSet.name != $scope.trainingSets[$scope.selectedTrainingSetIdx].name;
                $scope.trainingSets[$scope.selectedTrainingSetIdx] = angular.copy($scope.editedTrainingSet);
                if (nameChanged || $scope.editedTrainingSetIsNew) {
                    resortTrainingSets();
                    $scope.selectedTrainingSetIdx = null;
                    for (var i=0; i<$scope.trainingSets.length; i++) {
                        if ($scope.trainingSets[i].name === $scope.editedTrainingSet.name) {
                            $scope.selectedTrainingSetIdx = i;
                            break;
                        }
                    }
                    select2DisplayUpdateWorkaround();
                }
                $scope.editedTrainingSet = null;
            }, restError);
        };

        $scope.cancel = function () {
            if ($scope.editedTrainingSetIsNew) {
                // might do a confirmation here
                db.sets.remove({id:$scope.editedTrainingSet.id}, function () {
                    $scope.trainingSets.splice($scope.selectedTrainingSetIdx, 1);
                    // restore previous selection, if any
                    $scope.selectedTrainingSetIdx = restoreSelectedTrainingSetIdx;
                }, restError);
            }
            $scope.editedTrainingSet = null;
            $scope.confirmDeleteTrainingSet = false;
        };

        $scope.confirmDeleteTrainingSet = false;
        $scope.confirmDelete = function () { $scope.confirmDeleteTrainingSet = true; }
        $scope.deleteTrainingSet = function () {
            db.sets.remove({id:$scope.trainingSets[$scope.selectedTrainingSetIdx].id}, function () {
                $scope.trainingSets.splice($scope.selectedTrainingSetIdx, 1);
                $scope.selectedTrainingSetIdx = null;
                $scope.confirmDeleteTrainingSet = false;
            }, restError.alert);
        };

        $scope.dismiss = function () {
            // apply changes, if any
            trainingSets.splice(0, trainingSets.length);
            trainingSets.push.apply(trainingSets, $scope.trainingSets);
            $modalInstance.close();
        };

        db.orgIds().success(function(orgIds) {
            $scope.organizationIds = orgIds;
        }).error(function (data, status) {
            if (status === restError.sessionExpired) { $modalInstance.close(); }
            restError.alert(undefined, status);
        });
    }
]);

angular.module('controllers').controller('ShowTrainingSetUploadErrorsController', ['$scope', '$modalInstance', 'filename', 'data',
    function ($scope, $modalInstance, filename, data) {
        $scope.filename = filename;
        $scope.data = data;
        $scope.dismiss = function () {
            $modalInstance.dismiss();
        };
    }
]);
