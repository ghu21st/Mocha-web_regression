'use strict';

angular.module('services').factory('IntentService', ['$resource', 'LaConfigService',
    function($resource, laConfigService) {
        var IntentService = function() {
            // 'id' is always interactionId now
            var basePath = laConfigService.getLaRestAgentBasePathname();       // '/liveassist/rest/agent/'
            this.resource = $resource(basePath + 'picklists/:id', {}, {  // '/liveassist/rest/agent/picklists/:id'
                query: { method: 'GET', isArray: false }
            });
        };

        IntentService.prototype.query = function(id, callback) {
            var self = this;
            return this.resource.query({ id: id }, function(data) {
                self.intents = normalizePickList(data);
                callback(data);
            });
        };
        
        function normalizePickList(data) {
            var intents = {};
            if (data) {
                if ('showSessionContext' in data) {
                    intents.showSessionContext = data.showSessionContext;
                }
                if ('prompt' in data) {
                    intents.prompt = data.prompt;
                }
                if ('timeout' in data) {
                    intents.timeout = data.timeout;
                }
                if ('id' in data) {
                    intents.id = data.id;
                } else {
                    throw 'Missing intent id in picklist.';
                }
                if ('intents' in data) {
                    intents.intents = normalizeIntentMembers(data.intents);
                } else {
                    throw 'No intents in picklist.';
                }
                if ('globals' in data) {
                    intents.globals = data.globals;
                }
            }
            return intents;
        }
        
        function normalizeIntentMembers(data) {
            var members = [];
            var i;
            for (i = 0; i < data.length; i++) {
                var member = data[i];
                if (!('members' in member)) {
                    // intent
                    if (!('id' in member)) {
                        // id is required on intent, don't add
                        continue;
                    }
                    if (!('name' in member)) {
                        // no name, use id
                        member.name = member.id;
                    }
                    if ('variables' in member) {
                        member.variables = normalizeIntentVariables(member.variables);
                    }
                } else {
                    // group
                    if (!('name' in member)) {
                        // no name, use id
                        if (!('id' in member)) {
                            // id or name is required on group, don't add
                            continue;
                        }
                        member.name = member.id;
                    }
                    member.members = normalizeIntentMembers(member.members);
                    if (member.members.length == 0) {
                        // don't add empty groups
                        continue;
                    }
                }
                if (members.length == 10) {
                    // add at most 10 elements
                    break;
                }
                // add
                members.push(member);
            }
            return members;
        }

        function normalizeIntentVariables(data) {
            var variables = [];
            var j;
            for (j = 0; j < data.length; j++) {
                var variable = data[j];
                if (!('id' in variable)) {
                    // id is required on variable, don't add
                    continue;
                }
                if (!('name' in variable)) {
                    // no name, use id
                    variable.name = variable.id;
                }
                if (!('type' in variable) ||
                        !(
                            variable.type == 'tel'   ||
                            variable.type == 'list'  ||
                            variable.type == 'data'  ||
                            variable.type == 'date'  ||
                            variable.type == 'month' ||
                            variable.type == 'time'
                         )) {
                    // default to text type
                    variable.type = 'text';
                }
                if (variables.length == 5) {
                    // add at most 5 variables
                    break;
                }
                // add
                variables.push(variable);
            }
            return variables;
        }

        IntentService.prototype.getCurrent = function() {
            return this.intents;
        };
    
        return new IntentService();
    }

]);
