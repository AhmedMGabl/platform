@echo off
cd /d %~dp0desktop
set MODEL_VERSION=0.7.0
set VERSION=0.7.208
set NODE_ENV=development
echo Launching Electron...
node_modules\.bin\electron.cmd --no-sandbox .
