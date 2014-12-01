'use strict';

angular.module('services').factory('SseService', [
    function() {
        var SseService = function() {
            this.sseNeeded = false;
        };

        SseService.prototype._createEventSource = function() {
            var self = this;
            if (this.source)
                this.source.close();
            // console.log('sse create');
            this.source = new EventSource('/liveassist/agent/sse');
            this.source.addEventListener('assigned', function(event) {
                if (self.assignedCallback != null) {
                    self.assignedCallback(event);
                }
            }, false);
            this.source.onerror = function(error) {
                // console.log('sse error');
                self.sseNeeded = false;
                self.source.close();
                if (self.errorCallback != null) {
                    self.errorCallback(error);
                }
            }
            // TODO: clean-up. For now re-create sse once in a while to ensure the notification channel is still working.
            setTimeout(function() {
                if (self.sseNeeded) {
                    self._createEventSource();
                }
            }, 10000);
        };

        SseService.prototype.onAssignedEvent = function(callback, errorCallback) {
            if (callback) {
                this.assignedCallback = callback;
                this.errorCallback = errorCallback;
                // Enable sse when entering the idle state
                this.sseNeeded = true;
                this._createEventSource();
            } else {
                // Disable sse when leaving the idle state
                this.sseNeeded = false;
                this.assignedCallback = null;
                this.errorCallback = null;
                if (this.source) {
                    // console.log('sse close');
                    this.source.close();
                }
            }
        };

        return new SseService();
    }
]);
