'use strict';

angular.module('services').factory('LaConfigService', [
    function() {
        var LaConfigService = function() {
            // 'id' is always interactionId now
            this.laProtocol = window.location.protocol; 
            this.laHost = window.location.host;
            this.laPathname = window.location.pathname;
            // console.log(this.laPathname);

            var path = this.laPathname;                 // /liveassist/app/ or /liveassist/app/index.html
            path = path.substring(0,  path.lastIndexOf('/'));  // /liveassist/app
            path = path.substring(0,  path.lastIndexOf('/'));  // /liveassist
            
            this.laBasePathname = path + '/';           // /liveassist/
            // console.log(this.laBasePathname);

            // https://host:port/liveassist/rest/
            this.laBaseHref = this.laProtocol + '//' + this.laHost + this.laBasePathname;

            // /liveassist/rest/
            this.laRestBasePathname = this.laBasePathname + "rest/";
            
            // /liveassist/rest/agent/
            this.laRestAgentBasePathname = this.laRestBasePathname + "agent/";
            
            // /liveassist/rest/admin/
            this.laRestAdminBasePathname = this.laRestBasePathname + "admin/";

            // /liveassist/rest/training/
            this.laRestTrainingBasePathname = this.laRestBasePathname + "training/";

            // /liveassist/rest/app/
            this.laRestAppBasePathname = this.laRestBasePathname + "app/";

            // /liveassist/rest/ssoUser/
            this.laRestSsoUserBasePathname = this.laRestBasePathname + "ssoUser/";

            // /liveassist/app/
            this.laAppBasePathname = this.laBasePathname + "app/";

            // /liveassist/audioproxy/
            this.laAudioProxyBasePathname = this.laBasePathname + "audioproxy/";
        };

        LaConfigService.prototype.getLaBasePathname = function() {
            return this.laBasePathname;
        };

        LaConfigService.prototype.getLaRestBasePathname = function() {
            return this.laRestBasePathname;
        };

        LaConfigService.prototype.getLaRestAgentBasePathname = function() {
            return this.laRestAgentBasePathname;
        };
        
        LaConfigService.prototype.getLaRestAdminBasePathname = function() {
            return this.laRestAdminBasePathname;
        };
        
        LaConfigService.prototype.getLaRestTrainingBasePathname = function() {
            return this.laRestTrainingBasePathname;
        };
        
        LaConfigService.prototype.getLaRestAppBasePathname = function() {
            return this.laRestAppBasePathname;
        };
        
        LaConfigService.prototype.getLaRestSsoUserBasePathname = function() {
            return this.laRestSsoUserBasePathname;
        };
        
        LaConfigService.prototype.getLaAppBasePathname = function() {
            return this.laAppBasePathname;
        };

        LaConfigService.prototype.getLaAudioProxyBasePathname = function() {
            return this.laAudioProxyBasePathname;
        };
        
        return new LaConfigService();
    }

]);
