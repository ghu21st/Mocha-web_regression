function checkPlayMedia(media) {
    var player = document.getElementById(media + "Player");
    if (player) {
        var playAny = 0;
        myTypes = new Array("audio/wav");
        var myAudio = document.getElementsByTagName('audio')[0];
        for (var i = 0, len = myTypes.length; i < len; i++) {
            var canPlay = myAudio.canPlayType(myTypes[i]);
            if ((canPlay == "maybe") || (canPlay == "probably"))
                playAny = 1;
        }
        if (playAny == 0) {
            player.style.visibility = "hidden";
            player.style.height = "0";
        }
        else {
            var audioRateValue = 1.0;
            var audio = document.getElementById(media + "Audio");
            var rateRange = document.getElementById(media + "RateRange");
            var rateValue = document.getElementById(media + "RateValue");

            audio.addEventListener('timeupdate', function () {
                if (!isNaN(audio.currentTime)) {
                    if (audio.playbackRate != audioRateValue) {
                        audio.playbackRate = audioRateValue;
                    }
                }
            });

            rateRange.oninput = function () {
                audioRateValue = rateRange.value;
                if (audio.playbackRate != audioRateValue) {
                    audio.playbackRate = audioRateValue;
                    rateValue.textContent = audioRateValue;
                }
            };

            audio.defaultPlaybackRate = audioRateValue;
            rateRange.value = audioRateValue;
            rateValue.textContent = audioRateValue;

// dcopp US3833/TA7407
            if (media == 'stream') {
                // install progress handler to shorten prebuffer
                audio.addEventListener('progress', function () {
                    if (audio.readyState > 0 && audio.readyState < 3) {
                        audio.play();
                    }
                });
// TA7399 install playing handler to verify end-to-end latency at server
                audio.addEventListener('playing', function () {
                    var xhr = new XMLHttpRequest();
                    var src = audio.firstElementChild.getAttribute('src');
                    // DE906 fix: use GET instead of POST to slip under the XSS radar
                    xhr.open('GET', src.replace('/recording/','/playing/'), true);
                    xhr.send();
                });
// kick off play (cannot use autoplay!)
                audio.play();
            }
        }
    }
}
window.onload = function () {
    checkPlayMedia("utt");
    checkPlayMedia("stream");
}
