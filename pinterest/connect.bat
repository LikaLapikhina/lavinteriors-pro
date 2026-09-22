@echo off
cd /d "%~dp0.."
python pinterest\publish.py oauth
pause
