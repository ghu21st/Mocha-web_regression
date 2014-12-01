	ECHO Mocha test batch file on Windows

REM	ECHO cleanup test result xml file
REM del /f/q .\reports\TEST-xunit.xml

	ECHO Before test set run, kill java process since last AHP test started selenium server by Java (note: not javaw process which used by AHP agent)
REM taskkill /F /IM "java.exe" 
REM sleep 3

	ECHO start selenium standalone server for web test driver
REM start "Protractor Webdriver-manager for api test" /min cmd /k webdriver-manager start
REM sleep 10

	ECHO Mocha test run
setx XUNIT_FILE "c:\LiveAssist_test\test\reports\TEST-xunit.xml"
setx LOG_XUNIT "true"
start "Run Mocha test" /HIGH /min cmd /k mocha --reporter xunit-file --ui bdd QA_TEST --timeout 3600s --slow 250000

	REM -----------check and wait for the test report XML generated then exit---------------

@echo off
:CHECK
for %%a in (.\reports\TEST-xunit.xml) do (
  if %%~za equ 0 (
    REM %%~na is empty - wait
    sleep 10
    goto CHECK

  ) else (
      sleep 2
@echo on
    echo %%~na is not empty
    ECHO Test done, copy report, exit and cleanup 
    move c:\LiveAssist_test\test\reports\TEST-xunit.xml c:\LiveAssist_test\test\reports\TEST-xunit-api.xml

@echo off
	taskkill /F /IM "cmd.exe" 
	exit 0
  )
)

