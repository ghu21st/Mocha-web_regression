	ECHO Mocha test batch file on Windows

cd c:\LiveAssist_test\test
REM call set_env.bat
REM set 

REM	ECHO cleanup test result xml file
REM	ECHO Before test set run, kill java process since last AHP test started selenium server by Java (note: not javaw process which used by AHP agent)
REM taskkill /F /IM "java.exe" 
REM sleep 3

	ECHO start selenium standalone server for web test driver
start "Start selenium server for protractor on api gui test" /min cmd /k c:\LiveAssist_test\test\start_selenium.bat
sleep 5

	ECHO Mocha test run
setx XUNIT_FILE "c:\LiveAssist_test\test\reports\TEST-xunit.xml"
setx LOG_XUNIT "true"
start "Run Mocha test" /min cmd /k mocha --reporter xunit-file --ui bdd QA_TEST2 --timeout 3600s --slow 250000
sleep 5
	
	ECHO Check Test done 
REM start "Check Test Done script" /LOW /WAIT /min cmd /k chk_gui_test_done.bat
REM sleep 1


	REM -----------check and wait for the test report XML generated then exit---------------
@echo off
:CHECK
for %%a in (.\reports\TEST-xunit.xml) do (
  if %%~za equ 0 (
    REM %%~na is empty - wait
    sleep 5
    goto CHECK

  ) else (
      sleep 1
@echo on
    echo %%~na is not empty
    ECHO Test done, copy report, exit and cleanup 
	copy c:\LiveAssist_test\test\reports\TEST-xunit.xml c:\LiveAssist_test\test\reports\TEST-xunit-api-gui.xml
	sleep 1

@echo off
	taskkill /F /IM "java.exe" 
	taskkill /F /IM "cmd.exe" 
	taskkill /F /IM "firefox.exe"
	exit 0
  )
)
