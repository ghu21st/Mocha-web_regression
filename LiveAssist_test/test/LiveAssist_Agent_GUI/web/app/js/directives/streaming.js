'use strict';

angular.module('directives').directive('streaming', ['$log', function($log) {

    function link(scope, element, attributes) {

        var audio = element[0];

        //element.on('abort canplay canplaythrough emptied ended error loadeddata playing progress stalled waiting', function(ev) {
        //    $log.log(ev.type);
        //});

        // autoplay in response to interaction.audio setting
        scope.$watch('interaction.audio', function(newUrl) {
            $log.log("newUrl = " + newUrl);
            audio.src = newUrl;
            audio.load();
            audio.play();
        });

        // autorate in response to interaction.playbackRate setting
        scope.$watch('agentParams.playbackRate', function(newRate) {
            audio.playbackRate = newRate;
            audio.defaultPlaybackRate = newRate;
        });

        // audio latency reporting
        element.on('play', function(ev) {
            $log.log(ev.type);
            
            var src = audio.currentSrc;
            
            // remove random query string (which was added to fix audio caching problem) if any
            src = src.split('?', 1)[0];

            var uuid_tail_pat = /-[0-9a-f]{12}$/;
            if (uuid_tail_pat.test(src)) {
                 // send playback started notification
                 $log.log("sending playback started notification");
                 var xhr = new XMLHttpRequest();
                 xhr.open('GET', src + '/playing', true);
                 xhr.send(null);
            }

            // When the audio player is instructed to play again, it resets the various audio controls
            // We need to update the rest of the UI based on the new audio player settings.
            scope.$apply();
        });

        scope.$on("$destroy", function() {
            // Prevent memory leak. Apparently Firefox keeps each distinct audio source in memory, perhaps in case it needs to replay them.
            audio.pause(); // because there is no .stop()
            delete audio.src;
        });
    }

    return {
        restrict: 'A',
        link: link
    };

}]);
