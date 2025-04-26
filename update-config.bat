@echo off
echo Updating Firebase configuration...
firebase functions:config:set gmail.email="beakinapp@gmail.com" gmail.password="vrepxjeaistzfefu"
echo.
echo Configuration updated! Now deploying...
firebase deploy --only functions:emailGamePlan
echo.
echo Done!
pause 