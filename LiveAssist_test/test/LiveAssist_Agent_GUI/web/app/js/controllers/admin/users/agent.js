'use strict';

angular.module('controllers').controller('AdminAgentController', ['$scope', '$modalInstance',
    'AdminUtilitiesService', 'AdminAgentService', 'agent', 'edit', 'skills',
    function($scope, $modalInstance, adminUtilitiesService, adminAgentService, agent, edit, skills) {
        $scope.nameDisabled = false;
        $scope.resource = agent;
        $scope.agent = {username:"", password:"", roles:[], skills:[]};
        $scope.allRoles = adminUtilitiesService.allRoleNames();
        $scope.header = "Add user";
        $scope.allSkills = skills;
        $scope.skills = [];

        for (var i = 0; i < $scope.allSkills.length; i++) {
            $scope.skills.push($scope.allSkills[i].name);
        }

        $scope.select2Options = {
            'multiple': true,
            'simple_tags': true,
            'tags': $scope.skills,
            'width': '100%'
        };

        if (edit) {
            $scope.header = "Edit user";
            $scope.agent.roles = adminUtilitiesService.authoritiesToRoleNames(agent.roles);
            $scope.agent.username = agent.username;
            $scope.nameDisabled = true;
            $scope.agent.skills = adminUtilitiesService.extractSkills(agent.skills, $scope.allSkills);
        }

        for ( var i = 0; i < $scope.allRoles.length; i++ ) {
            if ( $scope.agent.roles.indexOf($scope.allRoles[i]) > -1) {
                $scope.agent[$scope.allRoles[i]] = true;
            } else {
                $scope.agent[$scope.allRoles[i]] = false;
            }
        }

        $scope.ok = function () {
            var roles = [];
            for ( var i = 0; i < $scope.allRoles.length; i++ ) {
                if ( $scope.agent[$scope.allRoles[i]] ) {
                    roles.push($scope.allRoles[i]);
                }
            }
            $scope.resource.roles = adminUtilitiesService.roleNamesToAuthorities(roles);
            $scope.resource.username = $scope.agent.username;
            if ( $scope.agent.password !== "" || !edit ) {
                $scope.resource.password = $scope.agent.password;
            }
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
                    $scope.resource.skills = skills;
                    $modalInstance.close($scope.resource);
                }, function() {
                    $scope.resource.skills = skills;
                    $modalInstance.close($scope.resource);
                });
            } else {
                $scope.resource.skills = skills;
                $modalInstance.close($scope.resource);
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }
]);
