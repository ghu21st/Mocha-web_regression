'use strict';

angular.module('services').factory('AdminUtilitiesService', [
    function() {
        var AdminUtilitiesService = function() {
            this.roles = [ "live", "admin", "training" ];
            this.roleNames = [ "Agent", "Administrator", "Agent (Training)" ];
            this.authorities = ["ROLE_LIVE_AGENT", "ROLE_ADMIN", "ROLE_TRAINING" ];
            this.anonymousRole = "ROLE_ANONYMOUS";
        };

        AdminUtilitiesService.prototype.roleToAuthority = function(role) {
            var ind = this.roles.indexOf(role);
            if ( ind > -1 ) return this.authorities[ind];
            return null;
        };

        AdminUtilitiesService.prototype.rolesToAuthorities = function(input) {
            var res = [];
            if ( input instanceof  Array ) {
                for ( var i = 0; i < input.length; i ++ ) {
                    res.push(this.roleToAuthority(input[i]));
                }
            }
            return res;
        };

        AdminUtilitiesService.prototype.roleNameToAuthority = function(roleName) {
            var ind = this.roleNames.indexOf(roleName);
            if ( ind > -1 ) return this.authorities[ind];
            return null;
        };

        AdminUtilitiesService.prototype.roleNamesToAuthorities = function(input) {
            var res = [];
            if ( input instanceof  Array ) {
                for ( var i = 0; i < input.length; i ++ ) {
                    res.push(this.roleNameToAuthority(input[i]));
                }
            }
            return res;
        };

        AdminUtilitiesService.prototype.allRoles = function() {
            return this.roles;
        };

        AdminUtilitiesService.prototype.allRoleNames = function() {
            return this.roleNames;
        };

        AdminUtilitiesService.prototype.allAuthorities = function() {
            return this.authorities;
        };

        AdminUtilitiesService.prototype.authorityToRole = function(authority) {
            var ind = this.authorities.indexOf(authority);
            if ( ind > -1 ) return this.roles[ind];
            return null;
        };

        AdminUtilitiesService.prototype.authoritiesToRoles = function(input) {
            var res = [];
            if ( input instanceof  Array ) {
                for ( var i = 0; i < input.length; i ++ ) {
                    res.push(this.authorityToRole(input[i]));
                }
            }
            return res;
        };

        AdminUtilitiesService.prototype.authorityToRoleName = function(authority) {
            var ind = this.authorities.indexOf(authority);
            if ( ind > -1 ) return this.roleNames[ind];
            return null;
        };

        AdminUtilitiesService.prototype.authoritiesToRoleNames = function(input) {
            var res = [];
            if ( input instanceof  Array ) {
                for ( var i = 0; i < input.length; i ++ ) {
                    res.push(this.authorityToRoleName(input[i]));
                }
            }
            return res;
        };

        AdminUtilitiesService.prototype.isAnonymous = function(input) {
            if ( input instanceof Array ) {
                return input.indexOf(this.anonymousRole) > -1;
            }
            if ( input === this.anonymousRole )
                return true;
            return false;
        };


        AdminUtilitiesService.prototype.extractSkills = function(skills, allSkills) {
            var retSkills = [];
            for ( var i = 0; i < skills.length; i ++) {
                var currSkill = allSkills.filter(function(skill){
                    return skill.id == skills[i];
                } );
                if ( currSkill.length > 0 )
                    retSkills.push(currSkill[0].name);
            }
            return retSkills;
        };

        return new AdminUtilitiesService;
    }
]);
