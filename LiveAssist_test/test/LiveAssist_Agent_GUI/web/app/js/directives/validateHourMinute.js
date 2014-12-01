'use strict';

angular.module('directives').directive('validateHourMinute', function() {
    return {
        require: "ngModel",
        link: function (scope, element, attrs, ngModel) {

            var hourMinuteRegex = /(\d+):(\d+)/;
            function validate(ctrl, validatorName, validity, value) {
                ctrl.$setValidity(validatorName, validity);
                return validity ? value : undefined;
            }
            function isValid(value) {
                if (angular.isUndefined(value))
                    return true;
                var x = hourMinuteRegex.exec(value);
                if (x && x.length >= 3) {
                    var h = x[1];
                    if (h < 0 || h > 23) {
                        return false;
                    }
                    var m = x[2];
                    if (m < 0 || m > 59) {
                        return false;
                    }
                    var y = h + ':' + m;
                    return true;
                }
                return false;
            }
            ngModel.$parsers.unshift(function (inputValue) {
                return validate(ngModel, 'isTimeValid', isValid(inputValue), inputValue);
            });
            
        }
    }
});