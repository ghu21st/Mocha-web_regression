'use strict';

angular.module('directives').directive('ninaAudioTest', function() {
    function link(scope, element, attributes) {
//        element.attr('autoplay', 'autoplay');
        scope[attributes['ninaAudioTest']] = element[0];
          // console.log('Emitting audio loaded event');
//        scope.$emit('audioLoaded', element[0]);
        scope.$watch('interaction.audio', function() {
            // console.log("Playing audio manually " + scope[attributes['ninaAudioTest']].src);
            element[0].load();
            element[0].play();
            // console.log("currentSrc " + scope[attributes['ninaAudioTest']].currentSrc);
            var error = scope[attributes['ninaAudioTest']].error;
            if (error) {
                // console.log("error " + error);
            }
        });

        element.on('play', function() {
            var src = scope[attributes['ninaAudioTest']].currentSrc;
            // console.log("currentSrc => " + src);
            
            // DE3923 restore audio latency reporting, which was lost
            // due to added random query string (which was added to fix audio caching problem)
            // fix: remove query string, if any
            src = src.split('?', 1)[0];

            var uuid_tail_pat = /-[0-9a-f]{12}$/;
            if (uuid_tail_pat.test(src)) {
                 // send playback started notification
                 // console.log("sending playback started notification");
                 var xhr = new XMLHttpRequest();
                 xhr.open('GET', src + '/playing', true);
                 xhr.send(null);
            } else {
                 // console.log("not sending playback started notification");
            }

            var error = scope[attributes['ninaAudioTest']].error;
            if (error) {
                // console.log("error " + error);
            }
            // When the audio player is instructed to play again, it resets the various audio controls
            // We need to update the rest of the UI based on the new audio player settings.
            scope.$apply();
        });
        element.on('error', function() {
            // console.log("Got error!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        });
    }

    return {
        restrict: 'A',
        link: link
    };
});
