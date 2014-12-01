/**
 QA browser test driver wrapper for Firefox/Chrome
 **/
//var TestConfig  = require('../Config/TestConfig.js');

function ProtractorDriver(selenium_server, browser_driver) {
    this.seleniumAddr = selenium_server;
    this.driverName = browser_driver;

    this.protractor = require('protractor'); //require protractor library
    this.driver = null;

    //Add for Chrome driver
    this.chromeOptions = this.protractor.Capabilities.chrome();
    this.chromeOptions['caps_'].chromeOptions = {
        args: ['--disable-web-security', '--start-maximized']
    };
}

// Add methods
ProtractorDriver.prototype.create = function(){
    var self = this;

    //check which browser driver protractor need to use
    if (self.driverName == "firefox") {
        self.driver = new self.protractor.Builder().          //define driver instance for Selenium server used/wrapped with protractor
            usingServer(self.seleniumAddr).
            withCapabilities(
                self.protractor.Capabilities.firefox()  //Firefox test
        ).build();
    } else if (self.driverName == "chrome") {
        self.driver = new self.protractor.Builder().          //define driver instance for Selenium server used/wrapped with protractor
            usingServer(self.seleniumAddr).
            withCapabilities(
                self.chromeOptions               //Chrome test
        ).build();
    } else {
        self.driver = null;
    }

    //return self.protractor.wrapDriver(self.driver); //old
    return [self.protractor.wrapDriver(self.driver), self.protractor];
};

//exports function for protractor driver creation
exports.createPtorDriver = function(selenium_server, browser_driver){
    return new ProtractorDriver(selenium_server, browser_driver).create();
};



