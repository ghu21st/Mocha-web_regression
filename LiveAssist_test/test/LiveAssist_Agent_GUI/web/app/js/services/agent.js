'use strict';

angular.module('services').factory('AgentService', ['$http', 'LaConfigService',
    function($http, laConfigService) {
        var restAppBasePath = laConfigService.getLaRestAppBasePathname();        // '/liveassist/rest/app/'
        var restSsoUserBasePath = laConfigService.getLaRestSsoUserBasePathname();    // '/liveassist/rest/ssoUser/'
        var appBasePath = laConfigService.getLaAppBasePathname();    // '/liveassist/app/'

        var AgentService = function() {
            this.serviceBasePath = laConfigService.getLaRestAgentBasePathname(); // '/liveassist/rest/agent/'

            // Fake interaction triggered by Make me busy button, the
            // server will automatically end the session on
            // sendAgentOutcome.
            this.fakeSessionId = null;
            
            this.pollingForInteraction = false;
            this.pollingForNoInteraction = false;
        };

        AgentService.prototype.pollForInteraction = function(successCallback, errorCallback) {
            this.pollingForInteraction = true;
            this._pollForInteraction(successCallback, errorCallback);
        };

        AgentService.prototype._pollForInteraction = function(successCallback, errorCallback) {
            var self = this;
            this.agentPollForInteractionTimeout = null;
            if (! self.pollingForInteraction) {
                return;
            }
            this._get('pollForInteraction').success(function(data, status, headers) {
                if (! self.pollingForInteraction) {
                    return;
                }
                var content_type = headers()["content-type"];
                if ( content_type !== "application/json" ) {
                    errorCallback();
                } else {
                    if (data.interactionResult) {
                        // console.log('pollForInteraction data returned an interaction result');
                        // Save interaction
                        self.lastAssignedInteraction = data.interactionResult;
                        self.pollingForInteraction = false;
                        successCallback(data);
                    } else {
                        // will poll again in data.agentPollDelay ms
                        self.agentPollForInteractionTimeout = setTimeout(function() {
                            self._pollForInteraction(successCallback, errorCallback);
                        }, data.agentPollDelay);
                    }
                }
            }).error(errorCallback);
        };

        AgentService.prototype.cancelPollForInteraction = function() {
            this.pollingForInteraction = false;
            if (this.agentPollForInteractionTimeout) {
                clearTimeout(this.agentPollForInteractionTimeout);
                // console.log('cleared poll timeout');
                this.agentPollForInteractionTimeout = null;
            }
        };
        
        AgentService.prototype.pollForNoInteraction = function(successCallback, errorCallback) {
            this.pollingForNoInteraction = true;
            this._pollForNoInteraction(successCallback, errorCallback);
        };

        AgentService.prototype._pollForNoInteraction = function(successCallback, errorCallback) {
            var self = this;
            this.agentPollForNoInteractionTimeout = null;
            if (! self.pollingForNoInteraction) {
                return;
            }
            this._get('pollForNoInteraction').success(function(data, status, headers) {
                if (! self.pollingForNoInteraction) {
                    return;
                }
                var content_type = headers()["content-type"];
                if ( content_type !== "application/json" ) {
                    errorCallback();
                } else {
                    if ( ! (data && data.busy) ) {
                        // console.log('pollForNoInteraction returned that the agent is not busy');
                        self.pollingForNoInteraction = false;
                        successCallback(data);
                    } else {
                        // will poll again in data.agentPollDelay ms
                        self.agentPollForNoInteractionTimeout = setTimeout(function() {
                            self._pollForNoInteraction(successCallback, errorCallback);
                        }, data.agentPollDelay);
                    }
                }
            }).error(errorCallback);
        };

        AgentService.prototype.cancelPollForNoInteraction = function() {
            this.pollingForNoInteraction = false;
            if (this.agentPollForNoInteractionTimeout) {
                clearTimeout(this.agentPollForNoInteractionTimeout);
                // console.log('cleared poll timeout');
                this.agentPollForNoInteractionTimeout = null;
            }
        };
        
        // TODO: Deprecated!!!
        // TODO: Should we take success and error callbacks as parameters or just return the http promise?
        // The problem with returning the promise is I'm not sure if we can call .success() multiple times.
        // Calling then returns a new derived promise which might not be the same as the original? ... to verify...
        AgentService.prototype.getAssignedInteraction = function(successCallback, errorCallback) {
            var self = this;
            this._get('getAssignedInteraction').success(function(data) {
                self.lastAssignedInteraction = data;
            }).then(successCallback, errorCallback);
        };

        AgentService.prototype.fakeInteraction = function(doneCallback) {
            var self = this;
            // TODO: add a form to read this from the GUI!
            var params = {
                "ani":"sip:5145551234@10.3.53.192:5064",
                "dnis":"sip:4627@mtl-da53", // 4627 is mapped to Nuance-IvrApiCallSteering in applicationConfigurations.json
                "externalSessionID":"0a0325e7_000011c2_5307b580_00d4_0001",
                "sessionID":"",
                "configurationName":"mainmenu",
                "completionCause":"no-match",
                "userInputText":"blah blah book a flight blah blah",
                "utterance":"http://mtl-da53/vxml/NUAN-22-24-mtl-da53-0a0325e7_000011c2_5307b580_00d4_0001-utt001-SAVEWAVEFORM.wav"
            };
            $http.post(restAppBasePath + 'inputInteractionStep', params).  // '/liveassist/rest/app/inputInteractionStep'
                success(function(result) {
                    // console.log("inputInteractionStep: sessionID=" + result.sessionID);
                    self.fakeSessionId = result.sessionID;
                    doneCallback();
                }).
                error(function() {
                    // console.log("sendAgentOutcome: error");
                    doneCallback();
                });
        };

        AgentService.prototype.getLastAssignedInteraction = function() {
            return this.lastAssignedInteraction;
        };

        AgentService.prototype.sendResponse = function(response, signOutRequested, doneCallback) {
            var self = this;
            this.lastResponse = response;

            var outcome = {};
            
            if (response) {
                if (response.intent) {
                    outcome.intent = {};
                    if (response.intent.id) {
                        outcome.intent.id = response.id;
                        outcome.intent.value = response.intent.id;
                    }
                    if (response.intent.variables) {
                        outcome.variables = [];
                        angular.forEach(response.intent.variables, function(variable, key) {
                            if (variable.confirmedByAgent) {
                                this.push({"id":variable.id, "value":variable.value});
                            }
                        }, outcome.variables);
                    }
                }
    
                if (response.globals) {
                    outcome.globals = [];
                    for (var i = 0; i < response.globals.length; ++i) {
                        if (response.globals[i].checkedByAgent) {
                            outcome.globals.push(response.globals[i].id);
                        }
                    }
                }
            } else {
                outcome.globals = [];
                outcome.globals.push("AGENT_TIMEOUT");
            }
            
            var params = {
                'outcome': outcome,
                'signOutRequested': signOutRequested
            };
            this._post('sendAgentOutcome', params).
                success(function() {
                    // console.log("sendAgentOutcome: ok");
                    if (self.fakeSessionId != null) {
                        var params = {
                            "sessionID":self.fakeSessionId
                        };
                        self.fakeSessionId = null;
                        $http.post(restAppBasePath + 'endSession', params).  // '/liveassist/rest/app/endSession'
                            success(function() {
                                // console.log("endSession: ok");
                                doneCallback();
                            }).
                            error(function() {
                                // console.log("endSession: error");
                                doneCallback();
                            });
                    } else {
                        doneCallback();
                    }
                }).
                error(function() {
                    // console.log("sendAgentOutcome: error");
                    doneCallback();
                });
        };

        AgentService.prototype.getLastResponse = function() {
            return this.lastResponse;
        };

        AgentService.prototype.resetLastResponse = function() {
            this.lastResponse = null;
        };

        AgentService.prototype.login = function(sso, username, password, mode, successCallback, errorCallback) {
            this.sso = sso;
            this.loginUsername = username;
            this.activeMode = mode;
            if (sso) {
                // no need to login per se, but call the agent API anyway to get the loginUsername
                var self = this;
                var params = mode;
                $http.post(restSsoUserBasePath + 'loggedIn', params).success(function(data) {  // '/liveassist/rest/ssoUser/loggedIn'
                    if (data.ok) {
                        self.loginUsername = data.userName;
                        successCallback();
                    } else {
                        errorCallback(data.error);
                    }
                }).error(function(data) {
                    errorCallback("An error occurred while verifying user authorizations. Please logout.");
                });
            } else {
                // form-login
                $http({
                    method: 'POST',
                    url: 'login',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: {
                        username: username,
                        password: password,
                        requestedMode: mode
                    },
                    transformRequest: function(data) {
                        var keyValuePairs = [];
                        angular.forEach(data, function(value, key) {
                            keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
                        });
                        var encoded = keyValuePairs.join('&');
                        // console.log("Sending the following body: " + encoded);
                        return encoded;
                    },
                    transformResponse: function(response) {
                        // Angular does not return the XHR statusLine, which we could use directly. Instead, we have to
                        // run a regex against the response in order to find the status line. At the moment, the result
                        // also includes the error code (e.g.: 'Error 401 Authentication Failed: Bad Credentials')
                        var match = new RegExp("<title>(.*)<\/title>").exec(response);
                        if (angular.isArray(match) && match.length > 1) {
                            return match[1];
                        }
                        return response;
                    }
                }).success(successCallback).error(errorCallback);
            }
        };

        AgentService.prototype.isSso = function() {
            return this.sso;
        };

        AgentService.prototype.getLoginUsername = function() {
            return this.loginUsername;
        };

        AgentService.prototype.getActiveMode = function() {
            return this.activeMode;
        };

        AgentService.prototype.logout = function(successCallback, errorCallback) {
            this.lastResponse = null;
            this.loginUsername = null;
            this.activeMode = null;
            if (this.sso) {
                this.sso = null;
                // TODO: confirm this is the right way...
                // Logout of this application:
                //window.location = appBasePath + 'logout';
                // Logout of all applications:
                window.location = appBasePath + 'sso_logout';  // '/liveassist/app/sso_logout'
            } else {
                //$http.post('logout').success(successCallback).error(errorCallback);  
                $http.post('logout').success(function() {
                    // Force reload to cleanup memory
                    window.location = appBasePath;  // '/liveassist/app/'
                }).error(errorCallback);
            }
        };

        // Utility get method for the common case of performing a get to the agent service on the server hosting the GUI.
        // Additional standard $http configuration can be specified in the config parameter.
        AgentService.prototype._get = function(path, config) {
            return $http.get(this.serviceBasePath + path, config);
        };

        // Utility get method for the common case of performing a post to the agent service on the server hosting the GUI
        // Additional standard $http configuration can be specified in the config parameter.
        AgentService.prototype._post = function(path, data, config) {
            return $http.post(this.serviceBasePath + path, data, config);
        };

        return new AgentService();
    }
]);
