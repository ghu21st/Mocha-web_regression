'use strict';

angular.module('directives').directive('ninaAudio', function() {
    function link(scope, element, attributes) {
        // console.log(element[0]);
        if (attributes['type'] == 'streaming') {
            element[0].attr('preload', 'none');
        } else if (attributes['type'] == 'static') {
            element[0].attr('autoplay', 'autoplay');
        }
    }

    return {
        restrict: 'E',
//        link: link,
//        template: '<audio controls="controls"><source src="{{audioSource}}" /></audio>'
        template: function(tElement, tAttributes) {
            var html = '<audio id="bla" controls';
            if (tAttributes['type'] == 'streaming') {
                html += ' preload="none"';
            } else if (tAttributes['type'] == 'static') {
                html += ' autoplay="autoplay"';
            }
            html += '><source src="' + tAttributes['src'] + '" />';
            html += '</audio>';
            // console.log("returning html " + html);
            return html;
        }
    };
});
