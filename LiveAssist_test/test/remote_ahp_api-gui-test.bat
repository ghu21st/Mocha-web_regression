@echo on
REM -------- script started to run remote machine tasks/scripts -------------
set machine=mtl-bl1-12-vm13
set file=\\mtl-bl1-12-vm13\c$\LiveAssist_test\test\run_AHP_api-gui.bat
set user=root
set userPwd=L0cus1
set executeAs=%user%
set executeAsPwd=%userPwd%

REM ---- clean up task (if have any) before new test -----
schtasks /delete /tn * /f /S %machine% /U %user% /P %userPwd%
sleep 3

REM --- Run the batch file as scheduled task on remote machine and accept the command line argument %1 as task name! -----------
schtasks /Create /S %machine% /U %user% /P %userPwd% /RU %executeAs% /RP %executeAsPwd% /SC ONCE /TN %1 /TR %file% /ST 00:00:00
schtasks /Run /S %machine% /U %user% /P %userPwd% /TN %1
