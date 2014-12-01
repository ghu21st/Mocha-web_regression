'use strict';

angular.module('controllers').controller('AdminAssignSkillsController', ['$scope', '$modalInstance',
    'AdminUtilitiesService', 'AdminAgentService', 'skills',
    function($scope, $modalInstance, adminUtilitiesService, adminAgentService, skills) {
        $scope.allSkills = skills;
        $scope.skills = [];
        $scope.agent = { username:"", skills:[]};

        for (var i = 0; i < $scope.allSkills.length; i++) {
            $scope.skills.push($scope.allSkills[i].name);
        }

        $scope.select2Options = {
            'multiple': true,
            'simple_tags': true,
            'tags': $scope.skills,
            'width': '100%'
        };

        $scope.load = function() {
            var retSkills = adminAgentService.agentSkills({agentName:$scope.agent.username});
            retSkills.$promise.then(function() {
                $scope.agent.skills = adminUtilitiesService.extractSkills(retSkills.skills, $scope.allSkills);
            })
        }

        $scope.ok = function () {
            var skills = [];
            var newSkills = [];
            for ( var i = 0; i < $scope.agent.skills.length; i ++) {
                var currSkill = $scope.allSkills.filter(function(skill){
                    return skill.name == $scope.agent.skills[i];
                } );
                if ( currSkill.length > 0 )
                    skills.push(currSkill[0].id);
                else
                    newSkills.push({ name : $scope.agent.skills[i]});
            }

            if (newSkills.length > 0) {
                var retSkills = adminAgentService.addSkills(newSkills);
                retSkills.$promise.then(function() {
                    for(var i=0; i < retSkills.length; i ++) {
                        skills.push(retSkills[i].id);
                    }
                    $scope.agent.skills = skills;
                    $modalInstance.close($scope.agent);
                }, function() {
                    $scope.agent.skills = skills;
                    $modalInstance.close($scope.agent);
                });
            } else {
                $scope.agent.skills = skills;
                $modalInstance.close($scope.agent);
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }
]);
