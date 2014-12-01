	ECHO Mocha test batch file on Windows

	ECHO cleanup test result xml file
del /f/q .\reports\TEST-*.xml

	ECHO Before test set run, kill java process since last AHP test started selenium server by Java (note: not javaw process which used by AHP agent)
taskkill /F /IM "java.exe" 
	
	ECHO start selenium standalone server for web test driver
start "Selenium + ChromeDriver" /min cmd /k java -jar c:\LiveAssist_test\test\QA_TEST\selenium-server-standalone-2.38.0.jar -Dwebdriver.chrome.driver=c:\LiveAssist_test\test\QA_TEST\chromedriver.exe

	ECHO Mocha test run
setx XUNIT_FILE "c:\LiveAssist_test\test\reports\TEST-xunit.xml"
setx LOG_XUNIT "true"
start "Run Mocha test" /min cmd /k npm test

	REM -----------check and wait for the test report XML generated then exit---------------

@echo off
:CHECK
for %%a in (.\reports\TEST-xunit.xml) do (
  if %%~za equ 0 (
    REM %%~na is empty - wait
    sleep 10
    goto CHECK

  ) else (
@echo on
    echo %%~na is not empty
    ECHO Test done, exit and cleanup 
@echo off
	taskkill /F /IM "java.exe" 
	taskkill /F /IM "cmd.exe" 
	exit 0
  )
)

