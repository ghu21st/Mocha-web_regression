'use strict';

angular.module('services').factory('ShortcutKeyService', ['$document',
    function($document) {
        var ShortcutKeyService = function() {
            this.keyBindingsByScope = {};
        };

        ShortcutKeyService.prototype.registerKeyBinding = function(scope, keyCombination, handler) {
            var self = this;

            var keyBinding = this._createKeyBinding(keyCombination, handler);
            // console.log("Registering shortcut key '" + keyCombination + "'(" + keyBinding.key + ") for scope '" + scope.$id + "'");

            var keyBindingsByKey = this._getKeyBindingsByKeyForScope(scope);
            var keyBindings = keyBindingsByKey[keyBinding.key];
            if (keyBindings) {
                keyBindings.push(keyBinding);
            } else {
                keyBindingsByKey[keyBinding.key] = [ keyBinding ];
            }
        };

        ShortcutKeyService.prototype._createKeyBinding = function(keyCombination, handler) {
            var components = keyCombination.toLowerCase().split("+");

            var keyBinding = {
                handler: handler,
                key: this._getKeyCodeForKeyDescription(components.pop()),
                control: false,
                alt: false,
                shift: false
            };

            for (var i = 0; i < components.length; ++i) {
                var modifierKey = components[i];
                if ((modifierKey == 'control') || (modifierKey == 'alt') || (modifierKey == 'shift')) {
                    keyBinding[modifierKey] = true;
                } else {
                    // TODO: Improve error message
                    throw "Unrecognized key '" + modifierKey + "'";
                }
            }

            return keyBinding;
        };

        var keyDescriptions = {
            'enter' : 13,
            'backspace' : 8,
            'end' : 35,

            'tilde' : 192,
            '~' : 192,
            'backquote' : 192,
            '`' : 192
        };
        ShortcutKeyService.prototype._getKeyCodeForKeyDescription = function(keyDescription) {
            if (keyDescription in keyDescriptions) {
                return keyDescriptions[keyDescription];
            }
            if (keyDescription.length == 1) {
                return keyDescription.charCodeAt(0);
            }
            var number = parseInt(keyDescription);
            if (!isNaN(number)) {
                return keyDescription;
            }
            throw "Unrecognized key description " + keyDescription;
        };

        ShortcutKeyService.prototype._getKeyBindingsByKeyForScope = function(scope) {
            var keyBindings = this.keyBindingsByScope[scope.$id];
            if (!keyBindings) {
                keyBindings = this._initializeShortcutKeyHandlingForScope(scope);
            }
            return keyBindings;
        };

        ShortcutKeyService.prototype._initializeShortcutKeyHandlingForScope = function(scope) {
            // console.log("Initializing shortcut key handling for scope '" + scope.$id + "'");

            var keyBindingsByKey = {};
            this.keyBindingsByScope[scope.$id] = keyBindingsByKey;

            var documentKeydownHandler = function(event) {
                //console.log("Looking for handler for keyCode " + event.keyCode + ", which " + event.which);
                var key = event.keyCode || event.which;
                var keyBindings = keyBindingsByKey[key];
                if (!keyBindings) {
                    return;
                }

                for (var i = 0; i < keyBindings.length; ++i) {
                    var keyBinding = keyBindings[i];
                    if ((event.altKey != keyBinding.alt) || (event.ctrlKey != keyBinding.control) || (event.shiftKey != keyBinding.shift)) {
                        continue;
                    }
                    //console.log("Firing handler for shortcut key for scope '" + scope.$id + "': " + JSON.stringify(keyBinding))
                    keyBinding.handler(event);
                }
            };
            $document.on('keydown', documentKeydownHandler);

            var self = this;
            scope.$on('$destroy', function() {
                // console.log("Finalizing shortcut key handling for scope " + scope.$id);
                self.keyBindingsByScope[scope.$id] = undefined;
                $document.off('keydown', documentKeydownHandler);
            });

            return keyBindingsByKey;
        };

        return new ShortcutKeyService();
    }
]);
