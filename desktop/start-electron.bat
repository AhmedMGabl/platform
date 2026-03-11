@echo off
cd /d %~dp0
set MODEL_VERSION=0.7.0
set VERSION=0.7.208
set NODE_ENV=production
node_modules\.bin\electron.cmd --no-sandbox .
