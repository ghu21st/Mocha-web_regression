angular.module('liveAssist').filter('skillsFilter', function() {
    var convertSkill = function (input, skills) {
        var skillsMatched = skills.filter(function(skill) {
            return skill.id == input;
        });

        if (skillsMatched.length == 1)
            return skillsMatched[0].name;
        else
            return "";
    };

    return function(input, skills) {
        if ( angular.isArray(input) ) {
            var retSkills = [];
            angular.forEach(input, function (obj, num) {
                retSkills.push(convertSkill(obj, skills));
            });
            return retSkills;
        }
        return convertSkill(input, skills);
    }
});