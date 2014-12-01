REM start "Selenium server" /min cmd /k java -jar c:\LiveAssist_test\test\QA_TEST\selenium-server-standalone-2.41.0.jar

start "Selenium + Firefox driver" /min cmd /k java -jar c:\LiveAssist_test\test\QA_TEST\selenium-server-standalone-2.43.1.jar -port 4444 -browser "browserName=firefox,maxInstances=5,platform=WINDOWS"
