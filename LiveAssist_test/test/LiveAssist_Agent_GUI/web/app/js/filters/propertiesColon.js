angular.module('liveAssist').filter('propertiesColon', function() {
    return function(array, fields) {
        var ret = [];
        angular.forEach(array, function(elem, ind) {
            var res = "";
            if ( fields && angular.isArray(fields) ) {
                angular.forEach(fields, function(field, num) {
                    res += elem[field];
                    if ( num != fields.length-1 ) {
                        res += ":";
                    }
                })
            }
            ret.push(res);
        });
        return ret;
    }
});