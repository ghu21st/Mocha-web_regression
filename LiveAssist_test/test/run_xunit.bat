ECHO Mocha test batch file on Windows
	
	ECHO Before test set run, kill java process since last AHP test started selenium server by Java (note: not javaw process which used by AHP agent)
taskkill /F /IM "java.exe" 
	
	ECHO start selenium standalone server for web test driver
start "Selenium + ChromeDriver" /min cmd /k java -jar c:\LiveAssist_test\test\QA_TEST\selenium-server-standalone-2.42.2.jar 

	ECHO Mocha test run
setx XUNIT_FILE "c:\LiveAssist_test\test\reports\TEST-xunit.xml"
setx LOG_XUNIT "true"
        mocha -R xunit-file --ui bdd QA_TEST2 --timeout 3600s --slow 250000
npm test

	ECHO Test done, kill all started command windows
taskkill /F /IM "cmd.exe" #kill all the command windows

exit 0
